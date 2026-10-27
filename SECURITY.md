# ORCA Security Architecture — IDEAS & COLORES (`https://ideasycoloresgt.site/`)

This document defines the 5-layer defense-in-depth security architecture implemented for **Ideas & Colores Multi-Servicios** (`https://ideasycoloresgt.site/` and corporate mail domain `ideasycoloresgt.com`).

---

## Layer 1: DOM & Input Hardening (`src/utils/security.ts`)

All user-supplied data across the quotation form (`QuoteForm.tsx`), lead dashboard (`LeadsDashboard.tsx`), and contact endpoints passes through strict validation and sanitization utilities before processing, persistence, or external redirection:

1. **XSS & Script Block Neutralization (`sanitizeInput`, `sanitizePlainText` & `escapeHtmlEntities`)**:
   - Strips executable tags (`<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`), inline event handlers (`onerror=`, `onload=`, `onclick=`, etc.), dangerous pseudo-protocols (`javascript:`, `vbscript:`, `data:`), and ASCII control characters.
   - `sanitizeInput` escapes all remaining HTML special characters (`&`, `<`, `>`, `"`, `'`) into safe HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`) for HTML/DOM contexts.
   - **Persistence uses `sanitizePlainText`, which strips executable content but does NOT HTML-encode `&`, `<`, `>` or quotes.** React escapes text at render time; encoding on input would double-escape values such as “Ideas & Colores” in the CRM.
   - Protocol matching is word-boundary aware, so legitimate text like `metadata:` is not mangled.
2. **Safe WhatsApp Redirect Construction (`buildSafeWhatsAppUrl`)**:
   - Normalizes Guatemala phone numbers to E.164 digits (`50266617592`) via `normalizeGuatemalaPhone`.
   - Strips HTML/script payloads via `sanitizePlainText` and applies `encodeURIComponent` so special characters like `&` in `"Ideas & Colores"` are properly encoded (`Ideas%20%26%20Colores`) without truncating the WhatsApp query string or enabling open redirects.
3. **Guatemala Phone Format Validation (`isValidGuatemalaPhone`)**:
   - Enforces Guatemala's 8-digit numbering plan starting with `2–7` and optional `+502` / `502` country code (`^(?:\+?502[\s()-]*)?[2-7]\d{3}[\s-]*\d{4}$`), rejecting SQLi/XSS payloads and malformed numbers.
4. **File Upload MIME & Size Validation**:
   - Client-side attachment checks enforce an explicit allowlist of safe image/document MIME types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and strict maximum file size caps to prevent arbitrary executable uploads or storage exhaustion.
5. **CSV Formula Injection Guard (`sanitizeCsvCell`)**:
   - Protects administrative CSV exports in `LeadsDashboard.tsx` against DDE / spreadsheet macro execution by prefixing any cell starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a single quote (`'`) and escaping embedded double quotes (`""`).

---

## Layer 2: Bot & Abuse Mitigation

1. **Hidden Honeypot Trap (`website_hp` / `isHoneypotTriggered`)**:
   - An off-screen, `tabIndex={-1}`, `aria-hidden="true"`, `autoComplete="off"` field (`website_hp`) is embedded in the quotation form.
   - Any automated bot that populates `website_hp` is immediately detected by `isHoneypotTriggered()` and silently dropped without hitting Supabase or triggering WhatsApp redirects.
2. **Client-Side Rate Limiting (`checkRateLimit` — 30s Cooldown)**:
   - Enforces a 30,000ms (`DEFAULT_RATE_LIMIT_COOLDOWN_MS`) cooldown per action key (`quote_submission`), backed by both in-memory state and `window.sessionStorage` (`orca_rl_quote_submission`).
   - Reduces accidental double submissions and naive automated loops. **It is not a server-side security control**: it can be bypassed by clearing `sessionStorage`, using a private window, or calling the Supabase REST endpoint directly. The authoritative controls are Supabase RLS, database constraints, and provider-level rate limiting.
3. **Corporate Email Obfuscation (`getDeobfuscatedCorporateEmail` & `getObfuscatedEmailDisplay`)**:
   - Prevents static HTML/source harvesters from scraping `gerencia@ideasycoloresgt.com`.
   - Reconstructs the address at runtime from ASCII char codes and injects zero-width spaces (`\u200B`) into visual DOM text while generating clean `mailto:` links on click via `buildSafeMailtoUrl()`.

---

## Layer 3: Transport & HTTP Security Headers (`public/.htaccess`)

Deployed directly to Hostinger Apache/LiteSpeed web root (`public/.htaccess`):

- **Forced HTTPS (301 Permanent Redirect)**: Redirects all plaintext HTTP traffic to `https://%{HTTP_HOST}%{REQUEST_URI}`.
- **HTTP Strict Transport Security (HSTS)**: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2-year enforcement).
- **Content Security Policy (CSP)**:
  - Restricts `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, `base-uri 'self'`, `form-action 'self'`, `script-src-attr 'none'`, and `upgrade-insecure-requests`.
  - **No `'unsafe-inline'` for scripts.** The only inline script block (Schema.org JSON-LD) is allowlisted by SHA-256 hash; the hash must be recomputed if that block changes.
  - Explicitly allowlists only required origins (Google Fonts, Supabase `*.supabase.co`, Unsplash portfolio CDN).
  - WhatsApp is opened with `window.open(..., 'noopener,noreferrer')`, not an HTML form, so `form-action` does not need `wa.me`.
- **Anti-Clickjacking & MIME Sniffing**:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
- **Permissions-Policy**: Disables unused browser hardware APIs (`camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()`). Microphone is limited to the site itself (`microphone=(self)`) because the quotation form includes the optional Web Speech API voice command; it is not exposed to iframes.
- **Dotfile & Sensitive File Blocking**: Blocks access to hidden files (`^\.` such as `.env`, `.git`) except `.well-known/` (for Let's Encrypt SSL renewal), disables directory browsing (`Options -Indexes`), and blocks `.sql`, `.log`, `.bak`, `.sh`, and `tsconfig.json` files.

---

## Layer 4: Database & Authentication Security (Supabase RLS)

Database access is governed by strict Row-Level Security (RLS) policies in `supabase/migrations/` (notably `20261015000000_security_constraints_and_rls.sql` and `20261022000000_harden_admin_rls.sql`):

| Role | Table / Bucket | Permitted Operations | Security Constraint |
| :--- | :--- | :--- | :--- |
| `anon` (Public Visitor) | `public.quote_requests` | `INSERT` only | Cannot `SELECT`, `UPDATE`, or `DELETE` any leads. |
| `authenticated` (CRM Admin) | `public.quote_requests` | `SELECT`, `UPDATE`, `DELETE` | Requires a valid Supabase JWT **and** `public.is_admin()` = true (`app_metadata.role = 'admin'` or an allowlisted corporate email). A merely authenticated user is not an admin. |
| `authenticated` (CRM Admin) | `public.quote_notes` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Same `public.is_admin()` predicate. |

> **No storage bucket is currently implemented.** The quotation form does not upload attachments, so there are no `storage.objects` policies to verify. The previous reference to a `quote-attachments` bucket was removed as inaccurate.

- **No Service-Role Keys in Client Bundle**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public anon JWT enforced by RLS) are used in the frontend. The `.env` file is excluded via `.gitignore` and blocked at the web server level via `.htaccess`.

---

## Layer 5: DNS & Email Anti-Spoofing Policy (`ideasycoloresgt.site` & `ideasycoloresgt.com`)

Configure the following DNS TXT records in **Hostinger DNS Zone Editor** for both `ideasycoloresgt.site` and `ideasycoloresgt.com` to prevent phishing, domain spoofing, and unauthorized email relay:

### 1. SPF (Sender Policy Framework)
Authorizes only Hostinger Titan/Webmail servers (or Google Workspace if applicable) and hard-fails (`-all`) all unauthorized senders:
```dns
Type: TXT
Name: @
Value: "v=spf1 include:spf.titan.email ~all"
TTL: 3600
```
*(Once all legitimate mail senders are verified in production, tighten `~all` to `-all`.)*

### 2. DKIM (DomainKeys Identified Mail)
Enable DKIM signing in **Hostinger hPanel → Emails → Email Deliverability** to publish the cryptographic public key:
```dns
Type: TXT
Name: titan1._domainkey
Value: "v=DKIM1; k=rsa; p=<PUBLIC_KEY_FROM_HOSTINGER_HPANEL>"
TTL: 3600
```

### 3. DMARC (Domain-based Message Authentication, Reporting & Conformance)
Enforces quarantine/rejection of unaligned spoofed messages and sends aggregate forensic reports to corporate management:
```dns
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; pct=100; rua=mailto:gerencia@ideasycoloresgt.com; adkim=s; aspf=s"
TTL: 3600
```

---

## Pre-Deployment Security Checklist for Hostinger

- [ ] **1. Run Automated Security Test Suite**: Execute `npx tsx --test tests/security.spec.ts` and verify 100% pass rate across XSS, Honeypot, Rate Limiting, Phone Validation, WhatsApp URL encoding, and CSV injection tests.
- [ ] **2. Verify Production Build Artifacts**: Run `npm run build` and confirm `dist/.htaccess` is present in the output bundle before uploading to Hostinger `public_html/`.
- [ ] **3. Environment Variables Isolation**: Confirm `.env` is **not** committed to Git or uploaded to `public_html/`. Inject `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time only.
- [ ] **4. Apply the Admin RLS Migration**: Apply `supabase/migrations/20261022000000_harden_admin_rls.sql` and set `app_metadata = {"role":"admin"}` on the real admin user (or keep an allowlisted corporate email). Without this step, the previous "any authenticated user" policy remains active.
- [ ] **5. Validate Supabase RLS Policies**: In Supabase Dashboard → Authentication → Policies, verify RLS is **Enabled** on `public.quote_requests` and `public.quote_notes`, that `anon` has **no** `SELECT`, `UPDATE`, or `DELETE` privileges, and that the admin policies call `public.is_admin()`.
- [ ] **6. Verify HTTPS & Security Headers Live**: After deploying to `https://ideasycoloresgt.site/`, run `curl -I https://ideasycoloresgt.site/` and confirm `Strict-Transport-Security` (2 years), `Content-Security-Policy` (no `script-src 'unsafe-inline'`), `X-Frame-Options: SAMEORIGIN`, and `X-Content-Type-Options: nosniff` are returned.
- [ ] **7. Verify Sensitive File Blocking**: Test `https://ideasycoloresgt.site/.env`, `https://ideasycoloresgt.site/tsconfig.json`, and `https://ideasycoloresgt.site/package-lock.json`; confirm `403 Forbidden` (or a non-leaking SPA response). `tsconfig.json` and `package-lock.json` are blocked by explicit `FilesMatch` rules, not by the `.lock` extension rule.
- [ ] **8. Verify SPF, DKIM, and DMARC Records**: In Hostinger DNS Zone Editor, confirm SPF, DKIM, and `_dmarc` TXT records are active for both `ideasycoloresgt.site` and `ideasycoloresgt.com`.

---

## Revisión semanal de seguridad

La revisión semanal se ejecuta con los prompts de `PROMPTS_REVISION_SEGURIDAD_SEMANAL.md` y la checklist `docs/security/CHECKLIST-SEMANAL.md`. El informe de cada semana se guarda como `docs/SECURITY-VERIFICATION-<YYYY-MM-DD>.md` usando `docs/security/PLANTILLA-INFORME-SEMANAL.md`.

Flujo recomendado:

1. Copiar el **Prompt B** (auditoría + corrección) y ejecutarlo semanalmente.
2. Corregir solo defectos reales; no debilitar controles para hacer pasar pruebas.
3. Ejecutar `npm run test:security`, `npx tsc --noEmit`, `npm run build`, `npm audit` y `npm run orca:auditor`.
4. Después de cada despliegue, ejecutar el **Prompt C** (verificación post-despliegue).
5. Adjuntar el informe semanal y registrar los `BLOCKED` con responsable y paso exacto.

El workflow `.github/workflows/security-weekly.yml` ejecuta automáticamente los chequeos de código y dependencias cada lunes, y publica un resumen informativo de cabeceras live y DNS.
