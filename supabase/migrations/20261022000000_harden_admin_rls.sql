-- ==============================================================================
-- IDEAS & COLORES MULTI-SERVICIOS GUATEMALA
-- MIGRATION: 20261022000000_harden_admin_rls.sql
-- PURPOSE: Restrict CRM access to real administrators instead of any
--          authenticated Supabase user (previous policies used USING (true)).
-- ==============================================================================

BEGIN;

-- 1. Admin predicate.
--    An authenticated user is admin only when:
--      a) the JWT app_metadata contains role = "admin", or
--      b) the JWT email is one of the corporate admin addresses.
--    app_metadata can only be written with the service_role key, so a user
--    cannot self-assign the admin role from the browser.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR lower(auth.jwt() ->> 'email') IN (
      'gerencia@ideasycoloresgt.com',
      'admin@ideasycoloresgt.site'
    ),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true only for CRM administrators (app_metadata.role=admin or allowlisted email).';

-- 2. Replace the broad "any authenticated user" CRM policies.
DROP POLICY IF EXISTS "Allow authenticated admins full access to quote_requests"
  ON public.quote_requests;
CREATE POLICY "Allow authenticated admins full access to quote_requests"
  ON public.quote_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated admins full access to quote_notes"
  ON public.quote_notes;
CREATE POLICY "Allow authenticated admins full access to quote_notes"
  ON public.quote_notes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Make the stats view respect RLS instead of the view owner's privileges.
ALTER VIEW IF EXISTS public.quote_requests_stats SET (security_invoker = true);
REVOKE ALL ON TABLE public.quote_requests_stats FROM anon;
GRANT SELECT ON TABLE public.quote_requests_stats TO authenticated;

COMMIT;

-- ==============================================================================
-- POST-MIGRATION STEP (manual, required before relying on the new policies):
--
-- Option A (recommended): In Supabase Dashboard -> Authentication -> Users,
-- open the real admin user and set app_metadata:
--   { "role": "admin" }
--
-- Option B: use the SQL editor with the service role:
--   UPDATE auth.users
--      SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
--                              || '{"role":"admin"}'::jsonb
--    WHERE email = 'gerencia@ideasycoloresgt.com';
--
-- Verify with:
--   SELECT public.is_admin();  -- run while authenticated as the admin
-- ==============================================================================
