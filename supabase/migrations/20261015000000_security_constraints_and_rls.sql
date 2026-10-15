-- ==============================================================================
-- IDEAS & COLORES MULTI-SERVICIOS GUATEMALA
-- MIGRATION: 20261015000000_security_constraints_and_rls.sql
-- PURPOSE: Idempotent data integrity constraints and hardened RLS insert policy
-- ==============================================================================

-- 1. Asegurar restricciones de integridad de datos en quote_requests
DO $$
BEGIN
  -- Restricción de longitud de nombre (mínimo 2 caracteres, máximo 150)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_name_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_name_check
      CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 150);
  END IF;

  -- Restricción de longitud de teléfono (mínimo 6 caracteres, máximo 30)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_phone_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_phone_check
      CHECK (char_length(trim(phone)) >= 6 AND char_length(phone) <= 30);
  END IF;

  -- Restricción de validación de formato de correo
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_email_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_email_check
      CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'));
  END IF;

  -- Restricción de longitud máxima de mensaje
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_message_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_message_check
      CHECK (message IS NULL OR char_length(message) <= 3000);
  END IF;

  -- Restricción de estados válidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_status_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_status_check
      CHECK (status IN ('new', 'contacted', 'in_progress', 'quoted', 'won', 'lost'));
  END IF;
END $$;

-- 2. Asegurar que Row Level Security (RLS) esté habilitado
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_notes ENABLE ROW LEVEL SECURITY;

-- 3. Endurecer política de inserción pública con validación de mínimos requeridos
DROP POLICY IF EXISTS "Allow public insert to quote_requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Public anon users can insert quote requests" ON public.quote_requests;

CREATE POLICY "Public anon users can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(name)) >= 2 AND
    char_length(trim(name)) <= 150 AND
    char_length(trim(phone)) >= 6 AND
    char_length(trim(phone)) <= 30
  );

-- 4. Garantizar denegación total (Default Deny) de SELECT / UPDATE / DELETE para anónimos
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public.quote_requests FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.quote_notes FROM anon;
