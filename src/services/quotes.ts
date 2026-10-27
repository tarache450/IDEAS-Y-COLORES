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
 * Elimina etiquetas/bloques ejecutables, pseudoprotocolos y caracteres de control,
 * pero NO convierte `&`, `<`, `>` ni comillas en entidades HTML. React ya escapa
 * al renderizar; escapar en la entrada provoca doble escape en el CRM.
 */
export function sanitizeString(val?: unknown, maxLength = 3000): string {
  return sanitizePlainText(val, maxLength);
}

/**
 * Valida los datos antes de enviarlos a la base de datos
 */
export function validateQuoteInput(input: CreateQuoteInput): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Datos de solicitud inválidos.' };
  }

  const rawName = typeof input.name === 'string' ? input.name.trim() : '';
  const rawMessage = typeof input.message === 'string' ? input.message.trim() : '';
  const rawEmail = typeof input.email === 'string' ? input.email.trim() : '';

  if (rawName.length > 150) {
    return { valid: false, error: 'El nombre no debe exceder 150 caracteres.' };
  }

  const cleanName = sanitizePlainText(input.name, 150);
  const cleanPhone = sanitizePlainText(input.phone, 25);
  const cleanEmail = sanitizePlainText(input.email, 254);

  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Por favor ingresa tu nombre completo (mínimo 2 caracteres).' };
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
 * Envía una solicitud de cotización / lead a Supabase
 */
export async function submitQuoteRequest(
  input: CreateQuoteInput
): Promise<QuoteSubmissionResult> {
  // 1. Detección de Bot / Honeypot: si el campo invisible fue rellenado, simular éxito silencioso sin consumir rate limit ni insertar en BD
  if (isHoneypotTriggered(input?.honeypot)) {
    if (isDev) {
      console.warn('[Anti-Spam] Envío descartado por detección de bot (honeypot activado).');
    }
    return { success: true, droppedByHoneypot: true };
  }

  // 2. Validación de entrada en capa de servicio
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

  // 4. Sanitización estricta de datos
  const payload: QuoteRequestInsert = {
    name: sanitizePlainText(input.name, 150),
    phone: sanitizePlainText(input.phone, 25),
    email: sanitizePlainText(input.email, 254) || null,
    service: sanitizePlainText(input.service, 150) || null,
    space_type: sanitizePlainText(input.spaceType, 100) || null,
    estimated_area: sanitizePlainText(input.estimatedArea, 100) || null,
    desired_timeline: sanitizePlainText(input.desiredTimeline, 100) || null,
    location: sanitizePlainText(input.location, 200) || null,
    message: sanitizePlainText(input.message, 3000) || null,
    status: 'new',
    source: input.source || 'website_quote_form',
  };

  // 5. Si Supabase no está configurado: simular solo en desarrollo.
  // En producción un fallback "exitoso" perdería el lead silenciosamente.
  if (!isSupabaseConfigured) {
    if (isDev) {
      console.info(
        '[Supabase Fallback] Variables no configuradas. Simulando recepción de lead:',
        payload
      );
      return {
        success: true,
        id: 'local-fallback-' + Date.now(),
      };
    }

    return {
      success: false,
      error: 'El sistema de cotizaciones no está configurado. Escríbenos directamente por WhatsApp.',
    };
  }

  // 6. Inserción con cliente Supabase (con RLS y tipos)
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
