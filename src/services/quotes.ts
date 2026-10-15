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
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isDev = Boolean(
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production')
);

/**
 * Sanitiza cadenas de texto eliminando bloques de script, estilos, iframes,
 * etiquetas HTML, pseudoprotocolos javascript: y caracteres de control no imprimibles.
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
 * Valida los datos antes de enviarlos a la base de datos
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
  if (cleanName.length > 150) {
    return { valid: false, error: 'El nombre no debe exceder 150 caracteres.' };
  }

  if (!cleanPhone || cleanPhone.length < 6) {
    return { valid: false, error: 'Por favor ingresa un número de teléfono o WhatsApp válido.' };
  }
  if (cleanPhone.length > 30) {
    return { valid: false, error: 'El número de teléfono no debe exceder 30 caracteres.' };
  }

  if (cleanEmail && cleanEmail.length > 0) {
    if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return { valid: false, error: 'Por favor ingresa una dirección de correo electrónico válida.' };
    }
  }

  if (cleanMessage && cleanMessage.length > 3000) {
    return { valid: false, error: 'El mensaje no debe superar los 3000 caracteres.' };
  }

  return { valid: true };
}

/**
 * Envía una solicitud de cotización / lead a Supabase
 */
export async function submitQuoteRequest(
  input: CreateQuoteInput
): Promise<QuoteSubmissionResult> {
  // 1. Detección de Bot / Honeypot: si el campo invisible fue rellenado, simular éxito silencioso
  if (input.honeypot && String(input.honeypot).trim().length > 0) {
    if (isDev) {
      console.warn('[Anti-Spam] Envío descartado por detección de bot (honeypot activado).');
    }
    return { success: true };
  }

  // 2. Validación de entrada en capa de servicio
  const validation = validateQuoteInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error || 'Datos de formulario incompletos.',
    };
  }

  // 3. Sanitización estricta de datos
  const payload: QuoteRequestInsert = {
    name: sanitizeString(input.name),
    phone: sanitizeString(input.phone),
    email: sanitizeString(input.email) || null,
    service: sanitizeString(input.service) || null,
    space_type: sanitizeString(input.spaceType) || null,
    estimated_area: sanitizeString(input.estimatedArea) || null,
    desired_timeline: sanitizeString(input.desiredTimeline) || null,
    location: sanitizeString(input.location) || null,
    message: sanitizeString(input.message) || null,
    status: 'new',
    source: input.source || 'website_quote_form',
  };

  // 4. Si Supabase no está configurado (e.g. variables ausentes en local temporalmente)
  if (!isSupabaseConfigured) {
    if (isDev) {
      console.info(
        '[Supabase Fallback] Variables no configuradas. Simulando recepción de lead:',
        payload
      );
    }
    return {
      success: true,
      id: 'local-fallback-' + Date.now(),
    };
  }

  // 5. Inserción con cliente Supabase (con RLS y tipos)
  try {
    const { error } = await supabase
      .from('quote_requests')
      .insert([payload]);

    if (error) {
      if (isDev) {
        console.error('[Supabase Error] Inserción fallida:', error);
      }
      return {
        success: false,
        error: 'No pudimos registrar tu solicitud en este momento. Inténtalo nuevamente o escríbenos directamente a WhatsApp.',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    if (isDev) {
      console.error('[Supabase Exception]', err);
    }
    return {
      success: false,
      error: 'Ocurrió un error inesperado al procesar la cotización. Inténtalo de nuevo por favor.',
    };
  }
}
