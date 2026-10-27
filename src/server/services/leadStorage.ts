import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ValidatedLeadPayload, normalizeGuatemalaPhone } from '../validators/leadSchema';

export type LeadPriority = 'HIGH' | 'STANDARD';

export interface StoredLead {
  leadId: string;
  priority: LeadPriority;
  timestamp: string;
  timestampGT: string;
  ip: string;
  userAgent?: string;
  data: ValidatedLeadPayload;
  whatsappRedirectUrl: string;
}

/**
 * Genera el ID único de seguimiento con formato IYC-2026-[RANDOM_4_HEX]
 */
export function generateLeadId(): string {
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `IYC-2026-${hex}`;
}

/**
 * Clasifica la prioridad del lead según volumen o tipo de servicio
 */
export function classifyLeadPriority(payload: ValidatedLeadPayload): LeadPriority {
  const m2 = payload.metrosCuadrados;
  if (m2 !== null && m2 !== undefined && m2 >= 100) {
    return 'HIGH';
  }
  if (
    payload.servicio === 'Impermeabilización de Losas' ||
    payload.servicio === 'Mantenimiento Comercial' ||
    payload.servicio === 'Resinas Epóxicas'
  ) {
    return 'HIGH';
  }
  return 'STANDARD';
}

/**
 * Obtiene la hora actual formateada en Zona Horaria de Guatemala (America/Guatemala, UTC-6)
 */
export function getGuatemalaTimestamp(): { iso: string; formatted: string } {
  const now = new Date();
  const iso = now.toISOString();
  const formatted = new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return { iso, formatted };
}

/**
 * Construye la URL de WhatsApp preformateada para el asesor de ventas
 */
export function buildWhatsAppRedirectUrl(
  leadId: string,
  payload: ValidatedLeadPayload,
  targetNumber = process.env.WHATSAPP_TARGET_NUMBER || '50266617592'
): string {
  const cleanTarget = targetNumber.replace(/[^0-9]/g, '');
  const phoneInfo = normalizeGuatemalaPhone(payload.telefono);
  const displayPhone = phoneInfo.valid ? phoneInfo.normalized : payload.telefono;

  const lines = [
    `*COTIZACIÓN WEB [${leadId}]*`,
    `*Cliente:* ${payload.nombre}`,
    `*Teléfono:* ${displayPhone}`,
    payload.email ? `*Email:* ${payload.email}` : '',
    `*Servicio:* ${payload.servicio}`,
    `*Ubicación:* ${payload.ubicacion}`,
    payload.metrosCuadrados ? `*Área Estimada:* ${payload.metrosCuadrados} m²` : '',
    payload.mensaje ? `*Detalle:* ${payload.mensaje}` : '',
    '',
    `_Solicito asesoría técnica y cotización formal con garantía por escrito._`,
  ].filter(Boolean);

  const text = lines.join('\n');
  return `https://wa.me/${cleanTarget}?text=${encodeURIComponent(text)}`;
}

/**
 * Persiste el lead en almacenamiento seguro JSONL (fuera de la carpeta pública)
 * y despacha a Webhook externo opcional (Google Sheets / Notion / CRM)
 */
export async function persistLead(
  payload: ValidatedLeadPayload,
  ip: string,
  userAgent?: string
): Promise<StoredLead> {
  const leadId = generateLeadId();
  const priority = classifyLeadPriority(payload);
  const { iso, formatted: formattedGT } = getGuatemalaTimestamp();
  const whatsappRedirectUrl = buildWhatsAppRedirectUrl(leadId, payload);

  const leadRecord: StoredLead = {
    leadId,
    priority,
    timestamp: iso,
    timestampGT: formattedGT,
    ip,
    userAgent,
    data: payload,
    whatsappRedirectUrl,
  };

  // Directorio de persistencia seguro (fuera de public y dist)
  const storageDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const logFilePath = path.join(storageDir, 'leads.jsonl');
  const line = JSON.stringify(leadRecord) + '\n';

  await fs.promises.appendFile(logFilePath, line, { encoding: 'utf8' });

  // Disparador de Webhook CRM asíncrono opcional
  const crmWebhook = process.env.WEBHOOK_CRM_URL;
  if (crmWebhook && crmWebhook.startsWith('http')) {
    fetch(crmWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadRecord),
    }).catch((err) => {
      console.warn('[CRM Webhook] Error al enviar lead a webhook:', err?.message || err);
    });
  }

  return leadRecord;
}
