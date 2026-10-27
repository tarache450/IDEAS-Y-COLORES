# Checklist semanal de seguridad

**Proyecto:** Ideas & Colores Multi-Servicios
**Dominio:** `https://ideasycoloresgt.site`
**Supabase:** `khagzrjxoqwzqrikomrd`
**Uso:** ejecutar una vez por semana. Cada fila debe quedar en PASS, FAIL, NOT_VERIFIED o BLOCKED.

> No ejecutes `scripts/security-audit.ts` ni `scripts/verify-supabase-security.ts` contra producción: insertan/actualizan/borran datos reales. No imprimas secretos.

## 1. Repositorio y secretos

| # | Control | Comando / evidencia | PASS si |
| :--- | :--- | :--- | :--- |
| 1.1 | Rama y estado | `git status -sb`; `git log --oneline -5` | Sabes qué rama y commit auditas; cambios sin commit documentados |
| 1.2 | Secretos versionados | `git grep -n -E "SB_SECRET_[A-Za-z0-9_-]+|sk_live_[A-Za-z0-9]+|ghp_[A-Za-z0-9]{36}|-----BEGIN [A-Z ]*PRIVATE KEY-----|SUPABASE_SERVICE_ROLE_KEY[[:space:]]*=[[:space:]]*[^#[:space:]]" -- . ":(exclude)package-lock.json" ":(exclude)docs/**"` | Sin coincidencias (las palabras `service_role` en documentación no cuentan como secreto) |
| 1.3 | `.env` ignorado | `git ls-files .env .env.local` | Sin salida |
| 1.4 | `.gitignore` estricto | `Get-Content .gitignore` | Incluye `.env*`, `*.pem`, `*.key`, `*.p12`, `.npmrc`, logs |
| 1.5 | Archivos sensibles fuera del bundle | `git ls-files dist public_html` | Sin `.env`, `.sql`, `.log`, `.bak`, `.sh`, `tsconfig.json` |

## 2. Dependencias

| # | Control | Comando | PASS si |
| :--- | :--- | :--- | :--- |
| 2.1 | Producción sin vulnerabilidades | `npm audit --omit=dev` | `found 0 vulnerabilities` |
| 2.2 | Desarrollo sin vulnerabilidades | `npm audit` | `found 0 vulnerabilities` |
| 2.3 | Sin dependencias duplicadas críticas | `npm ls --depth=0` | Sin `UNMET`/`invalid` |
| 2.4 | Lockfile reproducible | `npm ci` | Instala sin errores |

## 3. Código de aplicación

| # | Control | Archivo / comando | PASS si |
| :--- | :--- | :--- | :--- |
| 3.1 | XSS / sanitización | `src/utils/security.ts`; `tests/security.spec.ts` | Etiquetas, protocolos y handlers neutralizados |
| 3.2 | Sin doble escape | `src/services/quotes.ts` usa `sanitizePlainText` para persistir | `&`, comillas y `<` no se guardan como entidades HTML |
| 3.3 | Honeypot | `src/components/QuoteForm.tsx`; `isHoneypotTriggered` | Campo oculto y descarte silencioso |
| 3.4 | Rate limit | `src/services/quotes.ts`; `checkRateLimit` | Cooldown de 30 s y documentado como control de cliente |
| 3.5 | Validación de teléfono | `isValidGuatemalaPhone` | Acepta formatos GT válidos y rechaza basura |
| 3.6 | WhatsApp seguro | `buildSafeWhatsAppUrl`; `window.open(..., 'noopener,noreferrer')` | URL codificada y sin inyección |
| 3.7 | CSV injection | `sanitizeCsvCell` en export del admin | Celdas que empiezan con `= + - @` se prefijan con `'` |
| 3.8 | `target="_blank"` | `npm run test:security` | 0 violaciones de `rel="noopener noreferrer"` |
| 3.9 | Sin HTML peligroso | `rg "dangerouslySetInnerHTML|innerHTML|eval\\(|document\\.write" src` | Sin usos no justificados |
| 3.10 | Auth admin | `src/lib/supabase.ts`; `AdminDashboard.tsx` | Solo login; sin registro público desde la app |
| 3.11 | RLS en migraciones | `supabase/migrations/20261022000000_harden_admin_rls.sql` | `public.is_admin()` y políticas admin-only |
| 3.12 | Fallback Supabase | `src/services/quotes.ts` | En producción, sin configuración devuelve error, no “éxito” falso |

## 4. Configuración Apache / build

| # | Control | Comando / archivo | PASS si |
| :--- | :--- | :--- | :--- |
| 4.1 | HSTS | `Select-String public\\.htaccess -Pattern 'Strict-Transport-Security'` | `max-age=63072000; includeSubDomains; preload` |
| 4.2 | CSP sin scripts inline | `Select-String public\\.htaccess -Pattern 'Content-Security-Policy'` | Sin `script-src ... 'unsafe-inline'`; incluye `script-src-attr 'none'` |
| 4.3 | Hash JSON-LD | Calcular SHA-256 del bloque JSON-LD y comparar con la CSP | Coincide exactamente |
| 4.4 | Permissions-Policy | `Select-String public\\.htaccess -Pattern 'Permissions-Policy'` | Micrófono `(self)`; cámara/geo/pago/USB bloqueados |
| 4.5 | Archivos sensibles | `Select-String public\\.htaccess -Pattern 'FilesMatch'` | Bloquea `.env`, `.git`, `.sql`, `.log`, `.bak`, `.sh`, `tsconfig.json`, `package-lock.json` |
| 4.6 | `dist/.htaccess` | `Compare-Object (Get-Content public\\.htaccess) (Get-Content dist\\.htaccess)` | Sin diferencias |
| 4.7 | Sin `onload` inline | `npm run test:security` | Test de `index.html` en verde |
| 4.8 | Build limpio | `npm run build` | Build exitoso; `dist/font-loader.js` presente |

## 5. Producción (solo lectura)

| # | Control | Comando | PASS si |
| :--- | :--- | :--- | :--- |
| 5.1 | HSTS live | `curl.exe -sSI https://ideasycoloresgt.site/` | `max-age=63072000` |
| 5.2 | CSP live | idem | CSP completa, sin `unsafe-inline` en scripts |
| 5.3 | Headers base | idem | `X-Frame-Options: SAMEORIGIN`, `nosniff`, `Referrer-Policy` |
| 5.4 | `.env` | `curl.exe -sS -o NUL -w "%{http_code}" https://ideasycoloresgt.site/.env` | `403` (o respuesta sin contenido) |
| 5.5 | `.git/config` | idem `/.git/config` | `403` |
| 5.6 | `tsconfig.json` | idem `/tsconfig.json` | `403` |
| 5.7 | `package-lock.json` | idem `/package-lock.json` | `403` |
| 5.8 | HTTP→HTTPS | `curl.exe -sSI http://ideasycoloresgt.site/` | `301` a `https://ideasycoloresgt.site/` |
| 5.9 | `www`→sin `www` | `curl.exe -sSI https://www.ideasycoloresgt.site/` | `301` a `https://ideasycoloresgt.site/` |
| 5.10 | Sin violaciones CSP | Abrir el sitio en navegador, consola | 0 errores CSP; fonts/JSON-LD/Supabase cargan |

## 6. Supabase / RLS (manual)

| # | Control | Consulta / evidencia | PASS si |
| :--- | :--- | :--- | :--- |
| 6.1 | `is_admin()` existe | `select proname from pg_proc where proname = 'is_admin';` | 1 fila |
| 6.2 | Políticas admin-only | `select policyname, cmd, qual from pg_policies where schemaname='public' and tablename='quote_requests';` | `qual` contiene `is_admin()`; sin `USING (true)` para authenticated |
| 6.3 | `anon` solo INSERT | `select has_table_privilege('anon','public.quote_requests','SELECT'), has_table_privilege('anon','public.quote_requests','INSERT');` | `false, true` |
| 6.4 | Registro público | Dashboard → Authentication → Providers → Email | “Allow new users to sign up” desactivado |
| 6.5 | Admin real | Login con cuenta admin | Puede leer/actualizar leads |
| 6.6 | Usuario no-admin | Login con cuenta de prueba NO admin | No puede leer ni modificar `quote_requests` |
| 6.7 | Vista con RLS | `select reloptions from pg_class where relname='quote_requests_stats';` | Incluye `security_invoker=true` |

## 7. DNS / correo

| # | Control | Comando | PASS si |
| :--- | :--- | :--- | :--- |
| 7.1 | SPF `.site` | `Resolve-DnsName -Name ideasycoloresgt.site -Type TXT` | Política SPF presente y coherente con el proveedor |
| 7.2 | DMARC `.site` | `Resolve-DnsName -Name _dmarc.ideasycoloresgt.site -Type TXT` | `v=DMARC1; p=reject` |
| 7.3 | SPF `.com` | `Resolve-DnsName -Name ideasycoloresgt.com -Type TXT` | Autoriza al proveedor real de correo |
| 7.4 | DMARC `.com` | `Resolve-DnsName -Name _dmarc.ideasycoloresgt.com -Type TXT` | Registro DMARC presente |
| 7.5 | DKIM | `Resolve-DnsName -Name <selector>._domainkey.<dominio> -Type TXT` | Clave pública no vacía (`p=` con valor) |

## 8. Documentación

| # | Control | Evidencia | PASS si |
| :--- | :--- | :--- | :--- |
| 8.1 | `SECURITY.md` vs realidad | Lectura + código/config | Sin afirmaciones falsas ni tablas inexistentes |
| 8.2 | Informe semanal | `docs/SECURITY-VERIFICATION-<fecha>.md` | Existe, con evidencia y estados |
| 8.3 | Controles bloqueados | Informe | Cada `BLOCKED` tiene responsable y paso exacto |
| 8.4 | Regresión de pruebas | `npm run test:security` | 100% verde |

## 9. Cierre semanal

| Campo | Valor |
| :--- | :--- |
| Fecha | |
| Rama / commit | |
| Auditor | |
| Veredicto | PASS / PASS CON OBSERVACIONES / ACCIÓN REQUERIDA |
| Hallazgos críticos/altos | |
| Correcciones aplicadas | |
| Bloqueadores externos | |
| Próxima revisión | |
