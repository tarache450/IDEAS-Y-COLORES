# PRODUCTION CHECKLIST — IDEAS & COLORES MULTI-SERVICIOS

| Componente / Verificación | Estado | Detalle Técnico |
|---|---|---|
| **SUPABASE PROJECT** | ✅ VERIFIED | Proyecto `ideaycoloresgt` (`khagzrjxoqwzqrikomrd`), región `eu-west-1`, status `ACTIVE_HEALTHY` |
| **DATABASE** | ✅ VERIFIED | PostgreSQL 17 ga con tabla `public.quote_requests` estructurada con UUID y Timezone-aware |
| **RLS (ROW LEVEL SECURITY)** | ✅ VERIFIED | RLS activo. Política de inserción pública habilitada. Consultas SELECT, UPDATE y DELETE bloqueadas con HTTP 403/42501 |
| **FORM TEST (SUPABASE)** | ✅ VERIFIED | Inserción real ejecutada y validada en PostgreSQL (lead ID `4cc8d800-4678-4da7-a625-9fa28f1ae3d4`) |
| **GITHUB REPOSITORY** | ✅ VERIFIED | Repositorio remoto `https://github.com/tarache450/IDEAS-Y-COLORES.git` |
| **NO SECRETS COMMITTED** | ✅ VERIFIED | Auditoría limpia. `.env.local` excluido por `.gitignore`, solo `.env.example` en seguimiento |
| **DATABASE MIGRATION** | ✅ VERIFIED | Estructura versionada en `supabase/migrations/20261008000000_create_quote_requests.sql` |
| **FORM INTEGRATION** | ✅ VERIFIED | `QuoteForm.tsx` y `ContactSection.tsx` conectados con estados idle, loading, success y error |
| **PRODUCTION BUILD** | ✅ VERIFIED | `npm run lint` pasa sin advertencias; `npm run build` genera `dist/` en 3.01s |
| **OLD DOMAIN CLEANUP** | ✅ VERIFIED | `ideasycoloresgt.com` sustituido por `ideasycoloresgt.site` en `index.html`, `sitemap.xml`, `robots.txt`, `content.ts` |
| **DNS ROOT (A RECORD)** | ✅ VERIFIED | `ideasycoloresgt.site` resuelve a IP `2.57.91.91` (Hostinger) con DNS autoritativo `dns.hostinger.com` |
| **DNS WWW (CNAME)** | ✅ VERIFIED | `www.ideasycoloresgt.site` resuelve vía CNAME a `ideasycoloresgt.site` |
| **SSL / HTTPS** | ✅ VERIFIED | Certificado SSL activo en Hostinger para `https://ideasycoloresgt.site` (HTTP 200) |
| **SERVER CONFIG (.htaccess)** | ✅ VERIFIED | Redirección 301 HTTPS forzado, redirección 301 www a non-www, y fallback SPA para evitar 404 |
| **CI/CD WORKFLOW** | ✅ CONFIGURED | `.github/workflows/deploy.yml` configurado con pipeline `checkout -> setup-node -> lint -> build -> FTPS deploy` |
| **HOSTINGER CREDENTIALS** | ⏳ REQUIRES USER ACTION | Cargar credenciales FTP de Hostinger en GitHub Secrets (`HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`) |
| **MAIN PUSHED** | ⏳ READY TO PUSH | Preparado para commit y push a `main` |
| **FIRST PRODUCTION DEPLOY** | ⏳ PENDING PUSH/SECRET | Disparado automáticamente al hacer push con los secretos configurados |
| **AUTO DEPLOY TEST** | ⏳ PENDING FIRST DEPLOY | Prueba incremental obligatoria tras primer despliegue exitoso |
| **FINAL PRODUCTION QA** | ⏳ PENDING FIRST DEPLOY | Inspección en vivo sobre `https://ideasycoloresgt.site` |
