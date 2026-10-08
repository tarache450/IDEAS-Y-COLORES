import { createClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khagzrjxoqwzqrikomrd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYWd6cmp4b3F3enFyaWtvbXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzAwOTUsImV4cCI6MjEwNzA0NjA5NX0.pUav2uMVkrKTs-iL4s5RLvrvLmfqUPnPtxjwsF-sQU0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type QuoteStatus = 'new' | 'contacted' | 'in_progress' | 'quoted' | 'won' | 'lost';
export type QuotePriority = 'low' | 'normal' | 'high' | 'urgent';

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

export interface QuoteRequestRecord {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  space_type: string | null;
  estimated_area: string | null;
  desired_timeline: string | null;
  location: string | null;
  message: string | null;
  status: QuoteStatus;
  priority: QuotePriority;
  source: string;
  budget_estimate: number | null;
  internal_notes: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
}

export interface QuoteNote {
  id: string;
  quote_id: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface QuoteStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  in_progress_leads: number;
  quoted_leads: number;
  won_leads: number;
  lost_leads: number;
  leads_last_30_days: number;
  total_won_revenue: number;
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
          priority: 'normal',
          source: payload.source || 'website',
        },
      ]);

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

// ============================================================================
// ADMIN / CRM METHODS (Requires Authenticated Supabase User)
// ============================================================================

/**
 * Authenticates admin via Supabase Auth
 */
export async function signInAdmin(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { user: null, session: null, error: new Error(error.message) };
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Registers an admin account via Supabase Auth
 */
export async function signUpAdmin(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) return { user: null, session: null, error: new Error(error.message) };
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Signs out current admin
 */
export async function signOutAdmin(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieves current admin session
 */
export async function getAdminSession(): Promise<{ session: Session | null; user: User | null }> {
  const { data } = await supabase.auth.getSession();
  return { session: data.session, user: data.session?.user || null };
}

/**
 * Fetches all quotes for CRM with optional filters
 */
export async function fetchQuoteRequests(options?: {
  status?: string;
  search?: string;
}): Promise<{ data: QuoteRequestRecord[]; error: Error | null }> {
  try {
    let query = supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.search && options.search.trim() !== '') {
      const term = `%${options.search.trim()}%`;
      query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term},location.ilike.${term},service.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Supabase Fetch Error]:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data as QuoteRequestRecord[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Updates a quote request status & internal notes
 */
export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  internalNotes?: string
): Promise<{ error: Error | null }> {
  try {
    const updates: Partial<QuoteRequestRecord> = { status };
    if (status === 'contacted') {
      updates.last_contacted_at = new Date().toISOString();
    }
    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes;
    }

    const { error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', id);

    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Updates full CRM details of a quote
 */
export async function updateQuoteDetails(
  id: string,
  updates: Partial<QuoteRequestRecord>
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', id);

    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Deletes a quote request
 */
export async function deleteQuoteRequest(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', id);

    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetches notes for a specific quote request
 */
export async function fetchQuoteNotes(quoteId: string): Promise<{ data: QuoteNote[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('quote_notes')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: new Error(error.message) };
    return { data: (data as QuoteNote[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Adds an internal note to a quote request
 */
export async function addQuoteNote(
  quoteId: string,
  content: string,
  authorEmail: string
): Promise<{ data: QuoteNote | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('quote_notes')
      .insert([
        {
          quote_id: quoteId,
          content: content.trim(),
          author_email: authorEmail,
        },
      ])
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as QuoteNote, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Computes live CRM statistics
 */
export async function fetchQuoteStats(): Promise<{ stats: QuoteStats; error: Error | null }> {
  const defaultStats: QuoteStats = {
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    in_progress_leads: 0,
    quoted_leads: 0,
    won_leads: 0,
    lost_leads: 0,
    leads_last_30_days: 0,
    total_won_revenue: 0,
  };

  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('status, budget_estimate, created_at');

    if (error) return { stats: defaultStats, error: new Error(error.message) };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats: QuoteStats = (data || []).reduce((acc, row) => {
      acc.total_leads += 1;
      if (row.status === 'new') acc.new_leads += 1;
      else if (row.status === 'contacted') acc.contacted_leads += 1;
      else if (row.status === 'in_progress') acc.in_progress_leads += 1;
      else if (row.status === 'quoted') acc.quoted_leads += 1;
      else if (row.status === 'won') {
        acc.won_leads += 1;
        if (row.budget_estimate) acc.total_won_revenue += Number(row.budget_estimate);
      } else if (row.status === 'lost') acc.lost_leads += 1;

      if (new Date(row.created_at) >= thirtyDaysAgo) {
        acc.leads_last_30_days += 1;
      }
      return acc;
    }, { ...defaultStats });

    return { stats, error: null };
  } catch (err: any) {
    return { stats: defaultStats, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
