import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface QuoteRequestPayload {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  space_type?: string;
  estimated_area?: string;
  desired_timeline?: string;
  location?: string;
  message?: string;
  source?: string;
}

/**
 * Inserts a new quote request into the quote_requests table.
 * Honors RLS with return=minimal (no select rights needed for anonymous users).
 */
export async function insertQuoteRequest(payload: QuoteRequestPayload): Promise<{ error: Error | null }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Simulando guardado local (credenciales no detectadas)');
      return { error: null };
    }

    const { error } = await supabase
      .from('quote_requests')
      .insert([
        {
          name: payload.name.trim(),
          phone: payload.phone.trim(),
          email: payload.email?.trim() || null,
          service: payload.service || null,
          space_type: payload.space_type || null,
          estimated_area: payload.estimated_area || null,
          desired_timeline: payload.desired_timeline || null,
          location: payload.location?.trim() || null,
          message: payload.message?.trim() || null,
          status: 'new',
          source: payload.source || 'website',
        },
      ], { returning: 'minimal' } as any);

    if (error) {
      console.error('[Supabase Insert Error]:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    console.error('[Supabase Unexpected Error]:', err);
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
