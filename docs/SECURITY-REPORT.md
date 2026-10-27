# SECURITY & SUPABASE ARCHITECTURE AUDIT REPORT
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Fecha:** 2026-10-13  
**Última verificación:** 2026-10-22 (ver `docs/SECURITY-VERIFICATION-2026-10-22.md`)  
**Especialista:** Senior Supabase & Web Security Engineer  

---

> [!IMPORTANT]
> **Privacidad & Políticas de Secreto:**
> Este documento técnico omite intencionalmente cualquier clave privada, credencial maestra (`service_role`) o token de acceso restringido, siguiendo los estándares de seguridad OWASP y SOC2.

---

## 1. Auditoría de Variables de Entorno & Repositorio Git

| Verificación | Resultado | Estado |
| :--- | :--- | :--- |
| **Archivos `.env` en Git** | `git ls-files` confirma que `.env` está en `.gitignore` y **no está rastreado**. Únicamente `.env.example` está versionado como plantilla. | ✅ **VERIFIED** |
| **Escaneo de Secretos en Código** | Búsqueda automatizada de `SERVICE_ROLE`, contraseñas y claves privadas arrojó **0 coincidencias** en archivos fuente. | ✅ **VERIFIED** |
| **Bundle de Producción (`dist/`)** | El empaquetado de Vite no contiene variables de entorno privilegiadas ni credenciales administrativas. | ✅ **VERIFIED** |

---

## 2. Auditoría de Supabase & Row Level Security (RLS)

- **Proyecto Supabase:** `https://khagzrjxoqwzqrikomrd.supabase.co`
- **Tabla Principal de Captación:** `public.quote_requests`
- **Tabla de Bitácora Interna:** `public.quote_notes`

### 2.1. Matriz de Permisos para Usuarios Anónimos (`anon` - Navegador Público)

| Operación SQL | Permiso Esperado | Verificación Real en Base de Datos | Estado de Cumplimiento |
| :--- | :--- | :--- | :--- |
| **`INSERT`** | ✅ Permitido | Ejecución exitosa de formulario de lead con payload sanitizado. | ✅ **VERIFIED** |
| **`SELECT`** | ❌ Denegado | Consulta remota desde cliente anónimo devuelve 0 registros (acceso bloqueado por política RLS). | ✅ **VERIFIED** |
| **`UPDATE`** | ❌ Denegado | Intento de modificación anónima bloqueado por RLS (0 filas modificadas). | ✅ **VERIFIED** |
| **`DELETE`** | ❌ Denegado | Intento de eliminación anónima bloqueado por RLS (0 filas eliminadas). | ✅ **VERIFIED** |

### 2.2. Modelo de Acceso Administrativo (`authenticated` + `is_admin()`)
- Las consultas de lectura, actualización de estatus (`contacted`, `in_progress`, `won`, `lost`) y notas internas están restringidas al portal administrativo (`/admin`).
- **Corrección 2026-10-22:** la política anterior `Allow authenticated admins full access to quote_requests` usaba `USING (true)`, por lo que cualquier usuario autenticado (no solo un administrador) podía leer, modificar o borrar leads. La migración `20261022000000_harden_admin_rls.sql` reemplaza esas políticas por `public.is_admin()`, que exige `app_metadata.role = 'admin'` o un correo corporativo allowlisted. Un JWT `authenticated` por sí solo ya no concede acceso al CRM.
- La verificación en vivo de esta migración queda pendiente de aplicarla en el proyecto Supabase; ver el reporte de verificación 2026-10-22.

---

## 3. Seguridad de Transporte & Cabeceras HTTP (Hostinger `.htaccess`)

1. **Forzado de HTTPS (SSL/TLS):**
   - Redirección 301 obligatoria para cualquier solicitud que ingrese por `http://`.
2. **Redirección Canónica www:**
   - Redirección 301 de `www.ideasycoloresgt.site` a `https://ideasycoloresgt.site`.
3. **Cabeceras de Seguridad Activas:**
   - `X-Content-Type-Options: nosniff` (previene ataques de MIME sniffing).
   - `X-Frame-Options: SAMEORIGIN` (mitiga clickjacking).
   - `X-XSS-Protection: 1; mode=block` (filtro XSS reflectivo para navegadores heredados).
   - `Referrer-Policy: strict-origin-when-cross-origin` (protege la privacidad de URLs).
   - `Permissions-Policy: camera=(), microphone=(self), geolocation=()` (restringe APIs de hardware no utilizadas; el micrófono se habilita únicamente para el propio origin para el "Comando de voz" basado en Web Speech API).
4. **Protección contra Tabnabbing Inverso:**
   - 100% de los hipervínculos con `target="_blank"` implementan `rel="noopener noreferrer"`.
5. **Protección Anti-Spam (Honeypot):**
   - Trampa oculta para bots implementada en cliente y capa de servicio (`src/services/quotes.ts`). Descarta envíos automatizados silenciosamente sin consumir cuota de base de datos.

> [!WARNING]
> **Estado observado en producción el 2026-10-27:** el despliegue live sigue respondiendo con `Strict-Transport-Security: max-age=31536000`, una CSP mínima (`upgrade-insecure-requests`) y `Permissions-Policy: camera=(), microphone=(), geolocation=()`. No refleja el `.htaccess` endurecido del repositorio. Además, `https://ideasycoloresgt.site/tsconfig.json` y `https://ideasycoloresgt.site/package-lock.json` devolvieron **200**; `.env` y `.git/config` devolvieron **403**. El código local ya bloquea esos archivos, pero el cambio requiere despliegue en Hostinger. Ver `docs/SECURITY-VERIFICATION-2026-10-27.md`.

---

## 4. Auditoría de Dependencias & Riesgos Restantes

- **Actualización 2026-10-22:** `vite` se actualizó de `6.4.3` a `6.4.5`. La versión anterior acumulaba cinco advisories (uno `high`) en `launch-editor` y el servidor de desarrollo. `npm audit` ahora reporta **0 vulnerabilidades**.
- **Actualización 2026-10-27:** `jimp@1.6.1` (devDependency) arrastraba 29 advisories `high` vía `zod`. Solo se usaba en `scripts/audit-images.ts` para leer dimensiones; se migró a `sharp` y se eliminó `jimp`. `npm audit` y `npm audit --omit=dev` reportan **0 vulnerabilidades**.
- **Alcance del riesgo anterior:** los advisories de `vite` y `jimp` afectaban a herramientas de desarrollo, no al bundle estático servido en producción. Aun así, se corrigieron para evitar comprometer la máquina de desarrollo.
- **`npm audit` Seguro:** 0 vulnerabilidades conocidas tras las actualizaciones.
- **Recomendación:** repetir `npm audit` en cada ciclo de dependencias y no ejecutar `npm run dev` expuesto a redes no confiables.
