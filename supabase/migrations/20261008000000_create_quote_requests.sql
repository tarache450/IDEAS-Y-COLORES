-- Migration: Create quote_requests table with Row Level Security (RLS)
-- Created for Ideas & Colores Multi-Servicios Production
-- Project: ideas-colores-production (ref: khagzrjxoqwzqrikomrd)

CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT,
    space_type TEXT,
    estimated_area TEXT,
    desired_timeline TEXT,
    location TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT NOT NULL DEFAULT 'website'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Grant schema usage and table privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES ON TABLE public.quote_requests FROM anon, authenticated;
GRANT INSERT ON TABLE public.quote_requests TO anon, authenticated;

-- Allow anonymous and authenticated visitors to submit quote requests
DROP POLICY IF EXISTS "Allow public insert to quote_requests" ON public.quote_requests;
CREATE POLICY "Allow public insert to quote_requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);
