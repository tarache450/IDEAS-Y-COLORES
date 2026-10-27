import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeadSource, QuoteRequestInsert } from '../types/database.types';
import {
  sanitizePlainText,
  isValidGuatemalaPhone,
  isHoneypotTriggered,
  checkRateLimit,
  resetRateLimit,
} from '../utils/security';

export { resetRateLimit };

export interface CreateQuoteInput {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  spaceType?: string;
  estimatedArea?: string;
  desiredTimeline?: string;
  location?: string;
  message?: string;
  source?: LeadSource;
  honeypot?: string;
}

export interface QuoteSubmissionResult {
  success: boolean;
  error?: string;
  id?: string;
  leadId?: string;
  whatsappRedirectUrl?: string;
  droppedByHoneypot?: boolean;
  rateLimited?: boolean;
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isDev = Boolean(
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production')
);

/**
 * Sanitiza texto destinado a almacenamiento o canales de texto plano.
 */
export function sanitizeString(val?: unknown, maxLength = 3000): string {
  return sanitizePlainText(val, maxLength);
}

/**
 * Valida los datos antes de enviarlos a la API
 */
export function validateQuoteInput(input: CreateQuoteInput): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Datos de solicitud inválidos.' };
  }

  const rawName = typeof input.name === 'string' ? input.name.trim() : '';
  const rawMessage = typeof input.message === 'string' ? input.message.trim() : '';
  const rawEmail = typeof input.email === 'string' ? input.email.trim() : '';

  if (!rawName) {
    return { valid: false, error: 'Por favor ingresa tu nombre completo.' };
  }

  const cleanName = sanitizePlainText(input.name, 150);
  const cleanPhone = sanitizePlainText(input.phone, 25);
  const cleanEmail = sanitizePlainText(input.email, 254);

  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).' };
  }

  if (cleanName.length > 80) {
    return { valid: false, error: 'El nombre no debe exceder 80 caracteres.' };
  }

  if (!cleanPhone || !isValidGuatemalaPhone(input.phone)) {
    return {
      valid: false,
      error: 'Por favor ingresa un número de teléfono o WhatsApp válido en Guatemala (8 dígitos o +502).',
    };
  }

  if (rawEmail.length > 0) {
    if (rawEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return { valid: false, error: 'Por favor ingresa una dirección de correo electrónico válida.' };
    }
  }

  if (rawMessage.length > 3000) {
    return { valid: false, error: 'El mensaje no debe superar los 3000 caracteres.' };
  }

  return { valid: true };
}

/**
 * Parsea el texto del área para extraer número estimado en m2
 */
function parseEstimatedArea(raw?: string): number | null {
  if (!raw) return null;
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }
  return null;
}

/**
 * Envía la cotización al Backend Hardened API (/api/leads)
 * con fallback a Supabase si el endpoint HTTP no estuviera disponible.
 */
export async function submitQuoteRequest(
  input: CreateQuoteInput
): Promise<QuoteSubmissionResult> {
  // 1. Detección de Bot / Honeypot: si el campo invisible fue rellenado, simular éxito silencioso
  if (isHoneypotTriggered(input?.honeypot)) {
    if (isDev) {
      console.warn('[Anti-Spam] Envío descartado en cliente por honeypot activado.');
    }
    return {
      success: true,
      droppedByHoneypot: true,
      leadId: 'IYC-2026-HP01',
      whatsappRedirectUrl: 'https://wa.me/50266617592',
    };
  }

  // 2. Validación de entrada en cliente
  const validation = validateQuoteInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error || 'Datos de formulario incompletos.',
    };
  }

  // 3. Control de Rate Limiting en cliente (cooldown de 30s)
  const rateLimit = checkRateLimit('quote_submission');
  if (!rateLimit.allowed) {
    return {
      success: false,
      rateLimited: true,
      error: `Por favor espera ${rateLimit.remainingSeconds} segundos antes de enviar otra solicitud.`,
    };
  }

  const metrosCuadrados = parseEstimatedArea(input.estimatedArea);
  const compositeMessage = [
    input.message ? sanitizeString(input.message, 3000) : '',
    input.spaceType ? `Tipo de espacio: ${sanitizeString(input.spaceType, 100)}` : '',
    input.desiredTimeline ? `Plazo: ${sanitizeString(input.desiredTimeline, 100)}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const apiPayload = {
    nombre: sanitizeString(input.name, 150),
    telefono: sanitizeString(input.phone, 25),
    email: sanitizeString(input.email, 254) || null,
    servicio: sanitizeString(input.service, 150) || 'Pintura Airless',
    ubicacion: sanitizeString(input.location, 200) || 'Carretera a El Salvador',
    metrosCuadrados,
    mensaje: compositeMessage || 'Cotización solicitada desde asistente web.',
    website_hp: input.honeypot || '',
  };

  // 4. Envío primario a /api/leads (Node / PHP Gateway)
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.ok) {
      // Sincronización secundaria opcional con Supabase si está disponible
      if (isSupabaseConfigured) {
        Promise.resolve(
          supabase
            .from('quote_requests')
            .insert([
              {
                name: apiPayload.nombre,
                phone: apiPayload.telefono,
                email: apiPayload.email,
                service: apiPayload.servicio,
                space_type: input.spaceType ? sanitizeString(input.spaceType, 100) : null,
                estimated_area: input.estimatedArea ? sanitizeString(input.estimatedArea, 100) : null,
                desired_timeline: input.desiredTimeline ? sanitizeString(input.desiredTimeline, 100) : null,
                location: apiPayload.ubicacion,
                message: apiPayload.mensaje,
                status: 'new',
                source: input.source || 'website_quote_wizard',
              } as QuoteRequestInsert,
            ])
        )
          .then(() => {
            if (isDev) console.info('[Supabase Sync] Cotización sincronizada:', data.leadId);
          })
          .catch((sbErr) => {
            if (isDev) console.warn('[Supabase Sync Warning] Fallo secundario no crítico:', sbErr);
          });
      }

      return {
        success: true,
        leadId: data.leadId,
        id: data.leadId,
        whatsappRedirectUrl: data.whatsappRedirectUrl,
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        rateLimited: true,
        error: data?.error || 'Has superado el límite de solicitudes. Por favor espera unos minutos o escríbenos a WhatsApp.',
      };
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error,
      };
    }
  } catch (netErr) {
    if (isDev) {
      console.warn('[API Leads Network Exception] Intentando fallback local:', netErr);
    }
  }

  // 5. Fallback secundario si la API HTTP no responde (e.g. Supabase directo)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('quote_requests').insert([
        {
          name: apiPayload.nombre,
          phone: apiPayload.telefono,
          email: apiPayload.email,
          service: apiPayload.servicio,
          space_type: input.spaceType ? sanitizeString(input.spaceType, 100) : null,
          estimated_area: input.estimatedArea ? sanitizeString(input.estimatedArea, 100) : null,
          desired_timeline: input.desiredTimeline ? sanitizeString(input.desiredTimeline, 100) : null,
          location: apiPayload.ubicacion,
          message: apiPayload.mensaje,
          status: 'new',
          source: input.source || 'website_quote_wizard',
        } as QuoteRequestInsert,
      ]);

      if (!error) {
        const fallbackId = 'IYC-2026-SB01';
        return {
          success: true,
          leadId: fallbackId,
          id: fallbackId,
          whatsappRedirectUrl: `https://wa.me/50266617592?text=${encodeURIComponent(`Cotización [${fallbackId}] - ${apiPayload.nombre}`)}`,
        };
      }
    } catch {
      // Ignorar excepción de fallback
    }
  }

  return {
    success: false,
    error: 'No pudimos registrar tu cotización en este momento. Por favor comunícate directamente a nuestro WhatsApp oficial: 6661-7592.',
  };
}
