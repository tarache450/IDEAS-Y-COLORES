# IDEAS & COLORES MULTI-SERVICIOS — PRODUCTION DEPLOYMENT MANUAL

## 1. Architecture Overview

```text
ANTIGRAVITY / LOCAL DEVELOPMENT
            │
            │ git commit + push
            ▼
         GITHUB (main)
            │
            │ GitHub Actions (.github/workflows/deploy.yml)
            ▼
        HOSTINGER (public_html)
            │
            ▼
  https://ideasycoloresgt.site

─────────────────────────────────────────────────────────────

WEB FRONTEND (Browser)
            │
            │ Quote wizard & Contact form (Write-Only RLS)
            ▼
    SUPABASE PRODUCTION
  (Table: quote_requests)
```

---

## 2. Repository & Branch
- **Remote URL:** `https://github.com/tarache450/IDEAS-Y-COLORES.git`
- **Production Branch:** `main`
- **Trigger:** Automatic deployment on every `push` to `main`.

---

## 3. Build & Compilation
- **Framework:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **Node Version:** Node.js 22+ (LTS)
- **Install Command:** `npm ci`
- **Validation Command:** `npm run lint` (`tsc --noEmit`)
- **Build Command:** `npm run build` (`vite build`)
- **Output Directory:** `dist/`
- **Routing Support:** Single-Page Application (SPA) with `public/.htaccess` rewrite rules and fallback.

---

## 4. Environment Variables
Configured as **GitHub Repository Secrets** (`Settings > Secrets and variables > Actions`):

| Variable | Description | Exposed in Frontend? |
|---|---|---|
| `VITE_SUPABASE_URL` | Endpoint URL del proyecto Supabase | Sí (Pública) |
| `VITE_SUPABASE_ANON_KEY` | Llave anónima pública de Supabase | Sí (Pública con RLS) |
| `HOSTINGER_FTP_SERVER` | Servidor FTP de Hostinger (ej. `2.57.91.91` o `ftp.ideasycoloresgt.site`) | No (Solo en GitHub Actions) |
| `HOSTINGER_FTP_USERNAME` | Usuario FTP de Hostinger | No (Solo en GitHub Actions) |
| `HOSTINGER_FTP_PASSWORD` | Contraseña FTP de Hostinger | No (Solo en GitHub Actions) |
| `HOSTINGER_SERVER_DIR` | Directorio destino en Hostinger (`public_html/`) | No (Solo en GitHub Actions) |

> ⚠️ **Seguridad:** NUNCA almacenar ni exponer `SERVICE_ROLE_KEY`, contraseñas de PostgreSQL ni credenciales de hosting en archivos rastreados por Git.

---

## 5. Supabase Production Infrastructure
- **Proyecto:** `ideaycoloresgt` (Ref: `khagzrjxoqwzqrikomrd`)
- **Región:** `eu-west-1`
- **Motor de Base de Datos:** PostgreSQL 17
- **Tabla:** `public.quote_requests`
  - `id`: UUID (Primary Key, `gen_random_uuid()`)
  - `created_at`: TIMESTAMP WITH TIME ZONE (`now()`)
  - `name`: TEXT NOT NULL
  - `phone`: TEXT NOT NULL
  - `email`: TEXT
  - `service`: TEXT
  - `space_type`: TEXT
  - `estimated_area`: TEXT
  - `desired_timeline`: TEXT
  - `location`: TEXT
  - `message`: TEXT
  - `status`: TEXT DEFAULT `'new'`
  - `source`: TEXT DEFAULT `'website'`
- **Seguridad RLS (Row Level Security):**
  - `INSERT`: Permitido para visitantes anónimos y autenticados (`WITH CHECK (true)`).
  - `SELECT`: **DENEGADO** (Protección estricta contra extracción masiva de leads).
  - `UPDATE`: **DENEGADO**.
  - `DELETE`: **DENEGADO**.
- **Migraciones Versionadas:** `supabase/migrations/20261008000000_create_quote_requests.sql`

---

## 6. Hostinger Web Server & Hosting
- **Tipo de Hosting:** Hostinger Web Hosting con LiteSpeed/Apache.
- **Ruta de Despliegue:** `public_html/`
- **Mecanismo de Despliegue:** CI/CD automatizado vía GitHub Actions mediante FTPS seguro (`SamKirkland/FTP-Deploy-Action`).
- **Servidor Web Configuración (`.htaccess`):**
  - Forzado automático de HTTPS (301 Permanent Redirect).
  - Redirección canónica `www.ideasycoloresgt.site` → `https://ideasycoloresgt.site`.
  - Fallback SPA para evitar errores 404 en subrutas.
  - Cabeceras de seguridad (`nosniff`, `SAMEORIGIN`, `XSS protection`).
  - Cache-Control y Expires optimizados para assets estáticos.

---

## 7. DNS & Dominio
- **Dominio Oficial:** `https://ideasycoloresgt.site`
- **Versión Canónica:** Root non-www (`https://ideasycoloresgt.site/`)
- **Nameservers:** `ns1.dns-parking.com`, `ns2.dns-parking.com` / `dns.hostinger.com`
- **Registros DNS Activos:**
  - `A` record: `ideasycoloresgt.site` → `2.57.91.91` (Hostinger IP)
  - `CNAME` record: `www.ideasycoloresgt.site` → `ideasycoloresgt.site`

---

## 8. SSL / HTTPS
- **Proveedor:** Hostinger Let's Encrypt / Sectigo Wildcard SSL.
- **Estado:** Activo y validado con TLS 1.3 sin advertencias de certificado ni contenido mixto.

---

## 9. Flujo de Continuous Deployment (Automático)
Cada vez que realices un cambio en tu entorno local (Antigravity):
```bash
git add .
git commit -m "feat/fix: descripción del cambio"
git push origin main
```
1. GitHub recibe el commit en `main`.
2. El workflow `deploy.yml` se dispara en segundos.
3. Se descarga Node.js 22 y se instalan dependencias con `npm ci`.
4. Se ejecutan los chequeos de TypeScript (`npm run lint`).
5. Se compila la build de producción (`npm run build`).
6. La carpeta `dist/` se sincroniza atómicamente a `public_html/` en Hostinger.
7. La web oficial se actualiza de inmediato sin necesidad de tocar el File Manager.

---

## 10. Procedimiento de Rollback (Reversión)
Si un cambio introducido en producción presenta fallos inesperados:
```bash
# Opción 1: Revertir el último commit de forma limpia
git revert HEAD -m 1
git push origin main

# Opción 2: Revertir a un commit específico anterior
git revert <commit-hash>
git push origin main
```
GitHub Actions ejecutará inmediatamente la compilación de la versión restaurada y la publicará en Hostinger.
