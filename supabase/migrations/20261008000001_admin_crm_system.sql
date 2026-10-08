-- ==============================================================================
-- MIGRATION: 20261008000001_admin_crm_system.sql
-- PURPOSE: Complete CRM backend schema, RLS policies, and admin tracking
-- PROJECT: Ideas & Colores Multi-Servicios (khagzrjxoqwzqrikomrd)
-- ==============================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enhance quote_requests with CRM tracking fields
ALTER TABLE public.quote_requests
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal',
    ADD COLUMN IF NOT EXISTS budget_estimate NUMERIC(12, 2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Create quote_notes for internal CRM activity timeline
CREATE TABLE IF NOT EXISTS public.quote_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_notes ENABLE ROW LEVEL SECURITY;

-- 5. Grant schema and table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- For public visitors (anon): Can ONLY insert new quotes
GRANT INSERT ON TABLE public.quote_requests TO anon;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public.quote_requests FROM anon;
REVOKE ALL ON TABLE public.quote_notes FROM anon;

-- For authenticated staff/admins: Full CRM management capabilities
GRANT ALL PRIVILEGES ON TABLE public.quote_requests TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.quote_notes TO authenticated;

-- 6. Configure RLS Policies on quote_requests
DROP POLICY IF EXISTS "Allow public insert to quote_requests" ON public.quote_requests;
CREATE POLICY "Allow public insert to quote_requests"
    ON public.quote_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admins full access to quote_requests" ON public.quote_requests;
CREATE POLICY "Allow authenticated admins full access to quote_requests"
    ON public.quote_requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Configure RLS Policies on quote_notes
DROP POLICY IF EXISTS "Allow authenticated admins full access to quote_notes" ON public.quote_notes;
CREATE POLICY "Allow authenticated admins full access to quote_notes"
    ON public.quote_notes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_priority ON public.quote_requests (priority);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_notes_quote_id ON public.quote_notes (quote_id, created_at DESC);

-- 9. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER trigger_quote_requests_updated_at
    BEFORE UPDATE ON public.quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Helper view for CRM Dashboard metrics
CREATE OR REPLACE VIEW public.quote_requests_stats AS
SELECT
    count(*) AS total_leads,
    count(*) FILTER (WHERE status = 'new') AS new_leads,
    count(*) FILTER (WHERE status = 'contacted') AS contacted_leads,
    count(*) FILTER (WHERE status = 'in_progress') AS in_progress_leads,
    count(*) FILTER (WHERE status = 'quoted') AS quoted_leads,
    count(*) FILTER (WHERE status = 'won') AS won_leads,
    count(*) FILTER (WHERE status = 'lost') AS lost_leads,
    count(*) FILTER (WHERE created_at >= (now() - interval '30 days')) AS leads_last_30_days,
    COALESCE(sum(budget_estimate) FILTER (WHERE status = 'won'), 0) AS total_won_revenue
FROM public.quote_requests;

GRANT SELECT ON public.quote_requests_stats TO authenticated;
