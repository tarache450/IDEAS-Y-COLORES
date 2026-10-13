-- ==============================================================================
-- IDEAS & COLORES MULTI-SERVICIOS
-- SUPABASE PRODUCTION DATABASE SCHEMA
-- ==============================================================================
-- Este archivo contiene la definición DDL reproducible completa para Supabase.
-- Ejecutable directamente desde el SQL Editor del dashboard de Supabase o CLI.

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA PRINCIPAL: quote_requests (Solicitudes de Cotización / Leads)
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  service text,
  space_type text,
  estimated_area text,
  desired_timeline text,
  location text,
  message text,
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'website_quote_form',

  -- Restricciones de validación
  CONSTRAINT quote_requests_name_check CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 150),
  CONSTRAINT quote_requests_phone_check CHECK (char_length(trim(phone)) >= 6 AND char_length(phone) <= 30),
  CONSTRAINT quote_requests_email_check CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
  CONSTRAINT quote_requests_message_check CHECK (message IS NULL OR char_length(message) <= 3000),
  CONSTRAINT quote_requests_status_check CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  CONSTRAINT quote_requests_source_check CHECK (source IN ('website_quote_form', 'website_contact_section', 'website'))
);

-- 3. ÍNDICES DE CONSULTA
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);

-- 4. ROW LEVEL SECURITY (RLS) OBLIGATORIO
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACCESO
-- INSERT: Permitido para usuarios anónimos (visitantes web) con datos mínimos válidos
DROP POLICY IF EXISTS "Public anon users can insert quote requests" ON public.quote_requests;
CREATE POLICY "Public anon users can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(name)) >= 2 AND
    char_length(trim(phone)) >= 6
  );

-- SELECT / UPDATE / DELETE:
-- Por defecto en PostgreSQL, habilitar RLS sin políticas para estas acciones
-- las bloquea completamente para el rol 'anon'.
-- Ningún visitante anónimo puede consultar, modificar ni eliminar registros de clientes.
