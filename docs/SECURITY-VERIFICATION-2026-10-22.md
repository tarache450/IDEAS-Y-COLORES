# VERIFICACIÓN DE SEGURIDAD — 2026-10-22

**Proyecto:** Ideas & Colores Multi-Servicios (`https://ideasycoloresgt.site`)
**Repositorio:** `IDEAS-Y-COLORES`
**Rama:** `fix/security-hardening`
**Alcance:** verificación independiente del endurecimiento de seguridad de la semana pasada y corrección de defectos reales.
**Estado global:** **PASS CON OBSERVACIONES** (código local), **ACCIÓN REQUERIDA** (despliegue y Supabase/DNS).

---

## 1. Resumen ejecutivo

| Resultado | Cantidad |
| :--- | :--- |
| Hallazgos corregidos en código/configuración | 6 |
| Hallazgos corregidos solo en documentación | 2 |
| Riesgos abiertos que requieren despliegue o panel externo | 3 |
| Controles no verificables sin credenciales/red | 4 |

Lo más importante:

1. **RLS permitía que cualquier usuario autenticado del CRM leyera, editara y borrara todos los leads.** Se añadió `public.is_admin()` y una migración para restringir el acceso a administradores reales. **Falta aplicarla en Supabase.**
2. **El sitio en producción no tiene el `.htaccess` endurecido.** Responde con HSTS de 1 año, CSP mínima y `tsconfig.json`/`package-lock.json` accesibles con HTTP 200. El código local ya lo corrige, pero **falta desplegar**.
3. **Los leads con `&`, comillas o `<` se guardaban con entidades HTML** (`&amp;`, `&quot;`), produciendo doble escape en el CRM. Se cambió el almacenamiento a texto plano saneado.
4. **La CSP local permitía `script-src 'unsafe-inline'`** y dependía de un `onload` inline. Se reemplazó por hash SHA-256 del JSON-LD, `script-src-attr 'none'` y un cargador externo `font-loader.js`.
5. **`vite 6.4.3` acumulaba 5 advisories (1 high).** Actualizado a `6.4.5`; `npm audit` reporta 0 vulnerabilidades.
6. **La documentación afirmaba controles que no existían** (bloqueo de `.sql/.log/.bak/.sh/tsconfig.json`, bucket `quote-attachments`, tabla `public.quotes`, `form-action wa.me`, `microphone=()`). Se alineó con la implementación real.

---

## 2. Línea base y verificación final

| Comando | Antes | Después |
| :--- | :--- | :--- |
| `npm run test:security` | 15/15 pass | **20/20 pass** |
| `npx tsc --noEmit` | pass | **pass** |
| `npm run build` | pass | **pass** |
| `npm audit` | 1 high (vite, 5 advisories) | **0 vulnerabilities** |
| `npm run orca:auditor` | 12/12 pass | **12/12 pass** |

Artefactos del build:

- `dist/.htaccess` presente e idéntico a `public/.htaccess`.
- `dist/font-loader.js` presente.
- `dist/index.html` sin `onload=` inline.
- Hash CSP calculado desde `dist/index.html`: `sha256-RahpOtU9YhSSzuutDtalDT4B9HJ9lHtN0zgePHBQFuM=`, presente en `dist/.htaccess`.
- Bundle sin `service_role`; la `anon key` pública sí aparece (esperado por diseño).

---

## 3. Matriz de hallazgos

| ID | Severidad | Hallazgo | Estado |
| :--- | :--- | :--- | :--- |
| SEC-01 | **ALTO** | Políticas RLS `USING (true)` para `authenticated`: cualquier cuenta autenticada tenía acceso total al CRM. | **CORREGIDO en migración** / pendiente de aplicar |
| SEC-02 | **MEDIO** | Doble escape HTML en leads (`&` → `&amp;`, comillas → `&quot;`) por sanear con `sanitizeInput` antes de guardar. | **CORREGIDO** |
| SEC-03 | **MEDIO** | CSP con `script-src 'unsafe-inline'` y `onload` inline para fonts. | **CORREGIDO** |
| SEC-04 | **MEDIO** | `SECURITY.md` declaraba HSTS de 2 años; `.htaccess` usaba 1 año. | **CORREGIDO** (código a 2 años) |
| SEC-05 | **MEDIO** | `.htaccess` no bloqueaba `.sql/.log/.bak/.sh/tsconfig.json/package-lock.json`; en producción esos dos últimos respondían 200. | **CORREGIDO local** / pendiente de desplegar |
| SEC-06 | **MEDIO** | El despliegue live no refleja el `.htaccess` endurecido (CSP mínima, HSTS 1 año, Permissions-Policy antigua). | **ABIERTO** (requiere deploy) |
| SEC-07 | **MEDIO** | Antispoofing de correo incompleto: `.com` sin DMARC; DKIM de `.site` con `p=` vacío; SPF de `.com` apunta a `secureserver.net`, no a Titan/Outlook. | **ABIERTO** (requiere DNS) |
| SEC-08 | **BAJO** | Documentación desalineada: `public.quotes`, `form-action wa.me`, `microphone=()`, bucket `quote-attachments` inexistente. | **CORREGIDO** |
| SEC-09 | **BAJO** | `npm audit` con advisories de Vite (dev server/launch-editor). | **CORREGIDO** |
| SEC-10 | **BAJO** | El rate limit de 30 s es solo cliente y la documentación lo sobrevendía. | **DOCUMENTADO** |
| SEC-11 | **INFO** | `anon key` hardcodeada como fallback en `src/lib/supabase.ts` (clave pública por diseño); `signUpAdmin` sin uso; `insertQuoteRequest` legado sin uso. | **ACEPTADO / INFO** |
| SEC-12 | **INFO** | El log viejo de `.antigravity` reportaba 2 issues; el auditor actual (12 checks) pasa 12/12. | **VERIFICADO** |

---

## 4. Detalle de correcciones

### SEC-01 — RLS de administradores (ALTO)

**Evidencia:** `supabase/migrations/20261008000001_admin_crm_system.sql` creaba:

```sql
CREATE POLICY "Allow authenticated admins full access to quote_requests"
  ON public.quote_requests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

`authenticated` en Supabase significa “cualquier usuario con sesión”, no “administrador”. Si el registro público de Auth estuviera habilitado, cualquier persona podría crear una cuenta y acceder a todos los leads y notas.

**Corrección:** `supabase/migrations/20261022000000_harden_admin_rls.sql`:

- Crea `public.is_admin()` (JWT `app_metadata.role = 'admin'` o email corporativo allowlisted).
- Reemplaza ambas políticas por `USING (public.is_admin()) WITH CHECK (public.is_admin())`.
- Marca `quote_requests_stats` como `security_invoker = true` para que respete RLS.
- Revoca el acceso de `anon` a la vista.

**Acción pendiente:** aplicar la migración y asignar `app_metadata = {"role":"admin"}` al usuario administrador real en Supabase Dashboard. Sin ese paso, la política anterior sigue activa.

> **NOT_VERIFIED:** no se ejecutó contra Supabase en vivo para no alterar datos de producción. La migración es idempotente y no borra datos.

### SEC-02 — Doble escape de datos (MEDIO)

**Evidencia:** `src/services/quotes.ts` guardaba `sanitizeInput(...)`, que convierte `&` en `&amp;` y `"` en `&quot;`. React vuelve a escapar al renderizar, así que el CRM mostraba `Ideas &amp; Colores` en lugar de `Ideas & Colores`.

**Corrección:** el almacenamiento usa `sanitizePlainText(...)`, que elimina etiquetas/protocolos/caracteres de control sin entidades HTML. Se añadió prueba de regresión en `tests/security.spec.ts`.

### SEC-03 — CSP e inline scripts (MEDIO)

**Evidencia:** `.htaccess` usaba `script-src 'self' 'unsafe-inline'` e `index.html` usaba `onload="this.media='all'"`.

**Corrección:**

- `script-src 'self' 'sha256-RahpOtU9YhSSzuutDtalDT4B9HJ9lHtN0zgePHBQFuM='`
- `script-src-attr 'none'`
- `public/font-loader.js` activa el stylesheet async sin atributos inline.
- El hash corresponde al bloque JSON-LD de `dist/index.html`; si ese bloque cambia, debe recalcularse.

### SEC-04 — HSTS (MEDIO)

**Corrección:** `public/.htaccess` ahora usa `max-age=63072000` (2 años), igual que `SECURITY.md`.

### SEC-05 — Archivos sensibles (MEDIO)

**Evidencia live (2026-10-22):**

| URL | HTTP |
| :--- | :--- |
| `/.env` | 403 |
| `/.git/config` | 403 |
| `/tsconfig.json` | **200** |
| `/package-lock.json` | **200** |

**Corrección:** regla `FilesMatch` para `.sql`, `.log`, `.bak`, `.sh`, `.ini`, `.conf`, `.yml`, `.yaml`, `.lock`, `tsconfig.json` y `package-lock.json`.

### SEC-06 — Despliegue pendiente (MEDIO/ABIERTO)

Cabeceras live observadas:

```text
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: upgrade-insecure-requests
permissions-policy: camera=(), microphone=(), geolocation=()
```

No coinciden con el `.htaccess` local. El sitio fue modificado por última vez el 2026-10-18; el endurecimiento local aún no está publicado. **Acción:** desplegar `dist/` (incluido `dist/.htaccess`) a Hostinger y repetir `curl -I`.

### SEC-07 — Antispoofing de correo (ABIERTO)

Consultas DNS del 2026-10-22:

| Registro | Resultado |
| :--- | :--- |
| `_dmarc.ideasycoloresgt.site` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=...` ✅ |
| `_dmarc.ideasycoloresgt.com` | **sin registro** ❌ |
| `titan1._domainkey.ideasycoloresgt.site` | `v=DKIM1; p=` (clave vacía) ⚠️ |
| `ideasycoloresgt.com` SPF | `v=spf1 include:secureserver.net -all` ⚠️ (¿Titan/Outlook?) |

El dominio corporativo `.com` es el que aparece en el correo de contacto y no tiene DMARC. Si el correo real está en Microsoft 365 (`NETORGFT9264211.onmicrosoft.com`), el SPF actual (`secureserver.net`) no autoriza a Microsoft y los correos podrían fallar o marcarse como sospechosos. **Requiere revisión en el panel DNS; no se corrigió a ciegas.**

### SEC-08 — Documentación (BAJO)

Corregido en `SECURITY.md` y `docs/SECURITY-REPORT.md`:

- `public.quotes` → `public.quote_requests`.
- `form-action 'self' https://wa.me` → `form-action 'self'` (WhatsApp usa `window.open`, no un formulario).
- `microphone=()` → `microphone=(self)` (comando de voz).
- Eliminada la fila del bucket `quote-attachments` (no existe ni hay subida de archivos).
- Aclarado que el rate limit es de cliente y no un control de servidor.
- Aclarado que `authenticated` por sí solo ya no es admin.

### SEC-09 — Dependencias (BAJO)

`vite` actualizado de `6.4.3` a `6.4.5`. `npm audit` → 0 vulnerabilidades. El lockfile se limpió de dependencias antiguas que no estaban en `package.json` (shadcn/express/etc.).

---

## 5. Pruebas añadidas

`tests/security.spec.ts` pasó de 15 a 20 pruebas:

1. `sanitizePlainText` conserva `&` y comillas sin doble entidad.
2. No elimina palabras legítimas que contienen `data:` como substring (`metadata:`).
3. Todos los `target="_blank"` del código tienen `rel="noopener noreferrer"`.
4. `public/.htaccess` cumple HSTS 2 años, CSP sin `unsafe-inline`, `script-src-attr 'none'`, `frame-ancestors`, `form-action 'self'` y bloqueo de extensiones sensibles.
5. `index.html` no usa manejadores inline y existe `public/font-loader.js`.

---

## 6. Riesgos residuales / NOT_VERIFIED

| Control | Motivo | Cómo verificar |
| :--- | :--- | :--- |
| RLS en vivo | No se aplicó la migración ni se usaron credenciales contra producción. | Aplicar migración, iniciar sesión como admin y como usuario no-admin; probar `SELECT/UPDATE/DELETE`. |
| Cabeceras en producción | El deploy actual es anterior a los cambios. | Desplegar y ejecutar `curl -I https://ideasycoloresgt.site/`. |
| CSP en navegador real | Depende del deploy. | Abrir consola del navegador; confirmar 0 violaciones CSP y que Google Fonts/JSON-LD cargan. |
| DNS/DMARC/DKIM | Requiere panel DNS de Hostinger/registrador. | Corregir `.com` y validar con `dig`/`Resolve-DnsName`. |
| `scripts/security-audit.ts` | Inserta/actualiza/borra leads reales; no se ejecutó para no contaminar producción. | Ejecutar solo contra un proyecto Supabase de staging. |
| Rate limit de servidor | No existe; es cliente. | Implementar rate limiting en Supabase Edge Function/proxy si se necesita mitigación real. |

---

## 7. Archivos modificados/creados

**Modificados:**

- `public/.htaccess` — HSTS 2 años, CSP con hash, `script-src-attr`, Permissions-Policy completa, bloqueo de extensiones sensibles.
- `index.html` — eliminado `onload` inline; cargador externo de fonts.
- `src/services/quotes.ts` — almacenamiento con `sanitizePlainText`; error explícito si Supabase no está configurado en producción.
- `tests/security.spec.ts` — 4 pruebas nuevas.
- `SECURITY.md` — alineado con la implementación real y nuevo modelo RLS.
- `docs/SECURITY-REPORT.md` — fecha, RLS, dependencias y advertencia de estado live.
- `package.json` / `package-lock.json` — `vite@6.4.5`.

**Creados:**

- `public/font-loader.js`
- `supabase/migrations/20261022000000_harden_admin_rls.sql`
- `docs/SECURITY-VERIFICATION-2026-10-22.md` (este documento)
- `PROMPT_MAESTRO_VERIFICACION_SEGURIDAD.md`

---

## 8. Siguientes pasos (en orden)

1. **Aplicar** `20261022000000_harden_admin_rls.sql` en Supabase.
2. **Asignar** `app_metadata = {"role":"admin"}` al usuario administrador.
3. **Desplegar** `dist/` completo (incluido `.htaccess`) a Hostinger.
4. Verificar headers y archivos sensibles con `curl`.
5. Corregir DMARC/DKIM/SPF del dominio `.com` con el proveedor real de correo.
6. Confirmar en navegador que no hay violaciones CSP.
7. Opcional: mover el rate limiting a servidor (Edge Function) si se requiere anti-abuso real.
