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
 * Valida los datos antes de enviarlos a la base de datos
 */
export function validateQuoteInput(input: CreateQuoteInput): { valid: boolean; error?: string } {
  const cleanName = input.name.trim();
  const cleanPhone = input.phone.trim();
  const cleanEmail = input.email?.trim();

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

  if (input.message && input.message.length > 3000) {
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
  if (input.honeypot && input.honeypot.trim().length > 0) {
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

  // 3. Sanitización de datos
  const payload: QuoteRequestInsert = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    service: input.service?.trim() || null,
    space_type: input.spaceType?.trim() || null,
    estimated_area: input.estimatedArea?.trim() || null,
    desired_timeline: input.desiredTimeline?.trim() || null,
    location: input.location?.trim() || null,
    message: input.message?.trim() || null,
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
