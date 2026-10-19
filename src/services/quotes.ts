import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeadSource, QuoteRequestInsert } from '../types/database.types';

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
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isDev = Boolean(
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production')
);

/**
 * Sanitiza cadenas de texto eliminando etiquetas HTML, scripts y caracteres de control.
 */
export function sanitizeString(val?: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Valida los datos antes de enviarlos a la API
 */
export function validateQuoteInput(input: CreateQuoteInput): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Datos de solicitud inválidos.' };
  }

  const cleanName = sanitizeString(input.name);
  const cleanPhone = sanitizeString(input.phone);
  const cleanEmail = sanitizeString(input.email);
  const cleanMessage = sanitizeString(input.message);

  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).' };
  }
  if (cleanName.length > 80) {
    return { valid: false, error: 'El nombre no debe exceder 80 caracteres.' };
  }

  if (!cleanPhone || cleanPhone.length < 8) {
    return { valid: false, error: 'Por favor ingresa un número de teléfono o WhatsApp válido en Guatemala.' };
  }

  if (cleanEmail && cleanEmail.length > 0) {
    if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return { valid: false, error: 'Por favor ingresa una dirección de correo electrónico válida.' };
    }
  }

  if (cleanMessage && cleanMessage.length > 500) {
    return { valid: false, error: 'El mensaje no debe superar los 500 caracteres.' };
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
  // 1. Detección de Bot / Honeypot en cliente
  if (input.honeypot && String(input.honeypot).trim().length > 0) {
    if (isDev) {
      console.warn('[Anti-Spam] Envío descartado en cliente por honeypot activado.');
    }
    return {
      success: true,
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

  const metrosCuadrados = parseEstimatedArea(input.estimatedArea);
  const compositeMessage = [
    input.message ? sanitizeString(input.message) : '',
    input.spaceType ? `Tipo de espacio: ${sanitizeString(input.spaceType)}` : '',
    input.desiredTimeline ? `Plazo: ${sanitizeString(input.desiredTimeline)}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const apiPayload = {
    nombre: sanitizeString(input.name),
    telefono: sanitizeString(input.phone),
    email: sanitizeString(input.email) || null,
    servicio: sanitizeString(input.service) || 'Pintura Airless',
    ubicacion: sanitizeString(input.location) || 'Carretera a El Salvador',
    metrosCuadrados,
    mensaje: compositeMessage || 'Cotización solicitada desde asistente web.',
    website_hp: input.honeypot || '',
  };

  // 3. Envío primario a /api/leads (Node / PHP Gateway)
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
                space_type: input.spaceType ? sanitizeString(input.spaceType) : null,
                estimated_area: input.estimatedArea ? sanitizeString(input.estimatedArea) : null,
                desired_timeline: input.desiredTimeline ? sanitizeString(input.desiredTimeline) : null,
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

  // 4. Fallback secundario si la API HTTP no responde (e.g. offline o Supabase directo)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('quote_requests').insert([
        {
          name: apiPayload.nombre,
          phone: apiPayload.telefono,
          email: apiPayload.email,
          service: apiPayload.servicio,
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
