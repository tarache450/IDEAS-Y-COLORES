# SECURITY & SUPABASE ARCHITECTURE AUDIT REPORT
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Fecha:** 2026-10-13  
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

### 2.2. Modelo de Acceso Administrativo (`authenticated`)
- Las consultas de lectura, actualización de estatus (`contacted`, `in_progress`, `won`, `lost`) y notas internas están restringidas exclusivamente al rol `authenticated` mediante Supabase Auth en el portal administrativo (`/admin`).
- La política RLS `Allow authenticated admins full access to quote_requests` exige sesión JWT válida con token firmado por Supabase.

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
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restringe APIs de hardware no utilizadas).
4. **Protección contra Tabnabbing Inverso:**
   - 100% de los hipervínculos con `target="_blank"` implementan `rel="noopener noreferrer"`.
5. **Protección Anti-Spam (Honeypot):**
   - Trampa oculta para bots implementada en cliente y capa de servicio (`src/services/quotes.ts`). Descarta envíos automatizados silenciosamente sin consumir cuota de base de datos.

---

## 4. Auditoría de Dependencias & Riesgos Restantes

- **`npm audit` Seguro:** Parcheadas vulnerabilidades de transporte en dependencias auxiliares.
- **Vulnerabilidad Pendiente en `shadcn` CLI (DevDependency):**
  - Paquete `braces` reportado en el árbol de `@ts-morph/common` utilizado exclusivamente por la CLI de `shadcn` en tiempo de desarrollo.
  - **Dictamen:** `REQUIRES_REVIEW` para el próximo ciclo trimestral de actualización mayor. **Riesgo en producción nulo**, dado que la CLI de scaffolding no forma parte del código de runtime que se ejecuta en el navegador del cliente.
