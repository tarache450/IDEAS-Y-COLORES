import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  ValidatedLeadPayload,
  normalizeGuatemalaPhone,
  isSafeWebhookUrl,
} from '../validators/leadSchema';
import { getSqliteDb } from './sqliteDb';

export type LeadPriority = 'HIGH' | 'STANDARD';

export interface StoredLead {
  leadId: string;
  priority: LeadPriority;
  timestamp: string;
  timestampGT: string;
  ip: string;
  ipHash: string;
  userAgent?: string;
  data: ValidatedLeadPayload;
  whatsappRedirectUrl: string;
}

export function hashClientIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'iyc-gt-2026-audit-salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').slice(0, 16);
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
  const ipHash = hashClientIp(ip);

  const leadRecord: StoredLead = {
    leadId,
    priority,
    timestamp: iso,
    timestampGT: formattedGT,
    ip,
    ipHash,
    userAgent,
    data: payload,
    whatsappRedirectUrl,
  };

  // 1. Persistencia relacional transaccional en SQLite (fuera de public/ y dist/)
  try {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO leads (
        lead_id, name, phone, email, service, space_type, estimated_area,
        desired_timeline, location, metros_cuadrados, message, priority,
        status, source, ip_hash, user_agent, whatsapp_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?)
    `).run(
      leadId,
      payload.nombre,
      payload.telefono,
      payload.email ?? null,
      payload.servicio,
      payload.spaceType ?? null,
      payload.estimatedArea ?? null,
      payload.desiredTimeline ?? null,
      payload.ubicacion,
      payload.metrosCuadrados ?? null,
      payload.mensaje ?? '',
      priority,
      payload.source ?? 'website_quote_wizard',
      ipHash,
      (userAgent || '').slice(0, 250),
      whatsappRedirectUrl,
      iso,
      iso
    );

    db.prepare(`
      INSERT INTO audit_events (event_type, actor, target_id, detail, created_at)
      VALUES ('LEAD_CREATED', ?, ?, ?, ?)
    `).run(ipHash, leadId, `${payload.servicio} (${payload.ubicacion})`, iso);
  } catch (dbErr) {
    console.warn('[SQLite Persist Warning] Guardando en respaldo JSONL:', dbErr);
  }

  // 2. Directorio de persistencia de respaldo JSONL (sin PII de IP en claro)
  const storageDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const logFilePath = path.join(storageDir, 'leads.jsonl');
  const sanitizedLogRecord = {
    leadId: leadRecord.leadId,
    priority: leadRecord.priority,
    timestamp: leadRecord.timestamp,
    timestampGT: leadRecord.timestampGT,
    ipHash: leadRecord.ipHash,
    data: leadRecord.data,
    whatsappRedirectUrl: leadRecord.whatsappRedirectUrl,
  };
  const line = JSON.stringify(sanitizedLogRecord) + '\n';

  await fs.promises.appendFile(logFilePath, line, { encoding: 'utf8' });

  // 3. Disparador de Webhook CRM asíncrono opcional con protección SSRF + timeout 5s
  const crmWebhook = process.env.WEBHOOK_CRM_URL || '';
  if (crmWebhook && isSafeWebhookUrl(crmWebhook)) {
    fetch(crmWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedLogRecord),
      signal: AbortSignal.timeout(5000),
    }).catch((err) => {
      console.warn('[CRM Webhook] Error al enviar lead a webhook:', err?.message || err);
    });
  }

  return leadRecord;
}
