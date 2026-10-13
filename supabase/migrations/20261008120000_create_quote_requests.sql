-- Migration: 20261008120000_create_quote_requests.sql
-- Description: Creación de tabla de solicitudes de cotización (leads) con RLS y validaciones

-- 1. Crear tabla principal de solicitudes / leads
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

  -- Restricciones de validación de datos
  CONSTRAINT quote_requests_name_check CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 150),
  CONSTRAINT quote_requests_phone_check CHECK (char_length(trim(phone)) >= 6 AND char_length(phone) <= 30),
  CONSTRAINT quote_requests_email_check CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
  CONSTRAINT quote_requests_message_check CHECK (message IS NULL OR char_length(message) <= 3000),
  CONSTRAINT quote_requests_status_check CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  CONSTRAINT quote_requests_source_check CHECK (source IN ('website_quote_form', 'website_contact_section', 'website'))
);

-- 2. Índices de rendimiento mínimos (sin sobreingeniería)
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);

-- 3. Habilitar Row Level Security (RLS) Obligatorio
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- 4. Política de inserción pública para visitantes anónimos
-- Permite únicamente registrar nuevas solicitudes con campos mínimos válidos.
DROP POLICY IF EXISTS "Public anon users can insert quote requests" ON public.quote_requests;
CREATE POLICY "Public anon users can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(name)) >= 2 AND
    char_length(trim(phone)) >= 6
  );

-- 5. Seguridad: Ninguna política SELECT, UPDATE o DELETE es concedida al rol 'anon'.
-- Bajo PostgreSQL RLS, la ausencia de políticas para un comando resulta en DENEGACIÓN TOTAL (Default Deny).
-- Esto garantiza:
--   INSERT ✅
--   SELECT ❌ (Denegado para anon)
--   UPDATE ❌ (Denegado para anon)
--   DELETE ❌ (Denegado para anon)
