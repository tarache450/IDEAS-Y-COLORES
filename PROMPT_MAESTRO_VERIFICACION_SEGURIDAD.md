# PROMPT MAESTRO — VERIFICACIÓN Y CORRECCIÓN DE LA SEGURIDAD

**Rol:** Auditor senior de seguridad web + Supabase + DevSecOps.
**Proyecto:** Ideas & Colores Multi-Servicios (`https://ideasycoloresgt.site`).
**Repositorio:** `IDEAS-Y-COLORES`.
**Rama actual:** `fix/security-hardening`.
**Fecha de la auditoría original:** 2026-10-15 / 2026-10-18.
**Objetivo:** Verificar de forma independiente y con evidencia la seguridad implementada la semana pasada. Si encuentras un error real, corrígelo con el cambio mínimo necesario y vuelve a verificar. No asumas que un documento o un test en verde significan que el control funciona.

> **Uso recurrente:** este documento fue el prompt maestro de la revisión inicial. Para la revisión semanal usa `PROMPTS_REVISION_SEGURIDAD_SEMANAL.md` (Prompt B), junto con `docs/security/CHECKLIST-SEMANAL.md` y `docs/security/PLANTILLA-INFORME-SEMANAL.md`.

---

## 1. CONTEXTO QUE DEBES AUDITAR

La semana pasada se hizo un endurecimiento de seguridad sobre este repositorio. Los artefactos principales son:

- `SECURITY.md` — arquitectura de 5 capas (DOM/inputs, anti-bot, transporte/HTTP, Supabase/RLS, DNS/email).
- `docs/SECURITY-REPORT.md` — reporte de auditoría de seguridad y Supabase.
- `src/utils/security.ts` — sanitización XSS, teléfono GT, honeypot, rate limit, ofuscación de correo, WhatsApp, CSV.
- `src/services/quotes.ts` — validación y envío de leads a Supabase.
- `public/.htaccess` — HTTPS, HSTS, CSP, cabeceras, bloqueo de dotfiles, caché.
- `tests/security.spec.ts` — suite de 15 pruebas de seguridad.
- `supabase/migrations/20261015000000_security_constraints_and_rls.sql` — constraints y RLS.
- `scripts/security-audit.ts`, `scripts/verify-supabase-security.ts` — auditorías ejecutables.
- `.antigravity/` — orquestador, watchdog, auditor de checklist y estado (`orca-state.json`).
- Cambios sin commitear en la rama `fix/security-hardening` (revisa `git status` y `git diff`).

**Regla de oro:** cada afirmación de `SECURITY.md` y `docs/SECURITY-REPORT.md` debe contrastarse contra el código/configuración real. Un documento no es evidencia.

---

## 2. REGLAS DE EJECUCIÓN (OBLIGATORIAS)

1. **No inventes resultados.** Si no puedes probar algo (por ejemplo, RLS en vivo sin credenciales o red), marca `NOT_VERIFIED` y explica exactamente qué falta. No lo marques como `PASS`.
2. **Primero reproduce, después corrige.** Antes de tocar un archivo, demuestra el fallo con un comando, un test o una inspección concreta.
3. **Cambios mínimos y seguros.** No reescribas la arquitectura ni hagas refactors cosméticos. No debilites ningún control para “hacer pasar” un test.
4. **No commitees, no hagas push y no despliegues** a Hostinger/Supabase. Solo deja los cambios en el working tree.
5. **No expongas secretos.** Nunca imprimas `.env`, `.env.local`, `service_role`, JWT, contraseñas ni tokens. Si encuentras un secreto versionado, repórtalo sin pegar el valor.
6. **No rompas la UI ni el flujo de cotización.** La web es de producción; conserva el comportamiento visible y el español de los textos.
7. **Idioma del reporte:** español. Nombres de archivos, comandos y código en su idioma original.
8. **Si un “error” resulta ser una falsa alarma del documento**, corrige el documento; si es un defecto de código, corrige el código. Distingue siempre entre ambos.

---

## 3. FASE 0 — LÍNEA BASE (antes de cambiar nada)

Ejecuta y guarda la salida:

```powershell
git status
git branch --show-current
git diff --stat
npm run test:security
npx tsc --noEmit
npm run build
```

Comprueba además:

- Que `dist/.htaccess` exista después del build y coincida con `public/.htaccess`.
- Que `.env` y `.env.local` **no** estén rastreados por Git (`git ls-files .env .env.local`).
- Que no haya secretos en `dist/` ni en el bundle público.
- Que el build no introduzca errores nuevos.

Registra la línea base (tests que pasan/fallan, errores de tipos, warnings de build) antes de modificar.

---

## 4. FASE 1 — AUDITORÍA DEL CÓDIGO DE SEGURIDAD

Revisa y prueba, como mínimo:

### 4.1 Sanitización XSS (`src/utils/security.ts`)
- `sanitizeInput` elimina `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, manejadores `on*=`, protocolos `javascript:`, `vbscript:`, `data:` y caracteres de control.
- `escapeHtmlEntities` escapa `& < > " '`.
- **Prueba casos límite:** mayúsculas/mezclas (`JaVaScRiPt:`), etiquetas sin cierre, atributos sin comillas, payloads anidados, `onerror =` con espacios, `<scr<script>ipt>`, Unicode/control chars, `data:text/html`.
- **Posible defecto funcional a verificar:** `sanitizeInput` devuelve entidades HTML (`&amp;`, `&lt;`). Si ese valor se guarda en Supabase y luego se renderiza como texto en React, puede mostrarse doble-escapado (`&amp;` literal) o perder datos. Confirma cómo se muestra en `LeadsDashboard`/`AdminDashboard` y si hay doble sanitización. Si hay doble-escape, corrígelo sin abrir XSS.

### 4.2 Validación de teléfono Guatemala
- Acepta `+502 6661-7592`, `50266617592`, `6661-7592`, `5555 1234`.
- Rechaza letras, SQLi, XSS, longitudes inválidas y prefijos fuera de `2–7`.
- Verifica que `normalizeGuatemalaPhone` no convierta un número inválido en el fallback silenciosamente cuando se usa para WhatsApp.

### 4.3 Honeypot
- `website_hp` existe en `QuoteForm.tsx`, está oculto, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`.
- `isHoneypotTriggered` descarta el envío **antes** de rate limit e inserción.
- Un usuario legítimo con el campo vacío no se ve afectado.

### 4.4 Rate limiting
- `checkRateLimit` aplica 30 s por clave, usa memoria + `sessionStorage`.
- **Verifica el alcance real:** es un control **de cliente**, trivialmente evitable limpiando `sessionStorage`, usando incógnito o llamando la API directamente. Comprueba que la documentación **no** lo presente como protección de servidor. Si se afirma que evita flooding real, corrige la afirmación o documenta el riesgo residual. No intentes “arreglarlo” con más JavaScript de cliente.

### 4.5 Ofuscación del correo corporativo
- `getDeobfuscatedCorporateEmail()` reconstruye `gerencia@ideasycoloresgt.com`.
- `getObfuscatedEmailDisplay()` inserta `\u200B`.
- `buildSafeMailtoUrl()` sanea asunto/cuerpo y codifica correctamente.
- **Busca ocurrencias de correo en texto plano** en `src/`, `index.html` y componentes. Si existen, corrígelas o justifica por qué son aceptables. No cuentes comentarios/tests como fuga de UI.

### 4.6 WhatsApp
- `buildSafeWhatsAppUrl` normaliza el teléfono, sanea el mensaje y usa `encodeURIComponent` (el `&` de “Ideas & Colores” no debe truncar el query).
- Todos los enlaces/CTA usan la función segura.
- `window.open(..., 'noopener,noreferrer')` o `rel="noopener noreferrer"` en enlaces `target="_blank"`.

### 4.7 CSV
- `sanitizeCsvCell` neutraliza `= + - @ \t \r` y escapa comillas.
- Verifica que **todos** los campos exportados pasen por la función, no solo algunos.

### 4.8 Formularios y dashboard
- `QuoteForm.tsx` no envía campos sin sanear.
- `LeadsDashboard.tsx`/`AdminDashboard.tsx` no renderizan HTML crudo del lead (`dangerouslySetInnerHTML`), no filtran datos sensibles y no permiten acciones sin sesión.
- Revisa que no haya `console.log` con datos personales en producción.

---

## 5. FASE 2 — AUDITORÍA HTTP, `.htaccess` Y DOCUMENTACIÓN

Contrasta **línea por línea** `SECURITY.md` con `public/.htaccess`. Ya hay indicios de desalineación; confírmalos y corrige la fuente que esté mal:

| Afirmación documentada | Verificación esperada |
|---|---|
| HSTS `max-age=63072000` | `.htaccess` debe usar el mismo valor, o corregir el documento |
| CSP `form-action 'self' https://wa.me` | `.htaccess` debe incluirlo si es necesario, o corregir el documento |
| `Permissions-Policy: microphone=()` | `.htaccess` usa `microphone=(self)` por el comando de voz; alinear documento y código |
| `public.quotes` en RLS | La tabla real es `quote_requests`; corregir el documento |
| “100% de enlaces con `rel=noopener noreferrer`” | Verificar con búsqueda real; corregir enlaces que falten |
| Bloqueo de `.env`, `.git`, `.sql`, `.log`, `.bak`, `.sh`, `tsconfig.json` | Verificar reglas reales de `.htaccess`; añadir lo que falte sin bloquear assets |
| HTTPS + redirección `www` | Verificar reglas y orden (HTTPS antes que SPA fallback) |
| CSP compatible con la app real | Comprobar que Google Fonts, Supabase (`https://*.supabase.co`, `wss://*.supabase.co`), imágenes, mapas y Web Speech API no queden bloqueados. Si el CSP rompe funcionalidad, corregirlo con el mínimo privilegio necesario |
| `.well-known` | Confirmar que la renovación SSL no queda bloqueada |

Comprueba también:

- `public/robots.txt`, `public/sitemap.xml` y canonical no se ven afectados por la seguridad.
- `index.html` no contiene secretos, correos en claro ni scripts inline innecesarios.
- `dist/.htaccess` se genera y no queda fuera del deploy.

---

## 6. FASE 3 — SUPABASE, CONSTRAINTS Y RLS

Revisa `supabase/migrations/20261015000000_security_constraints_and_rls.sql` y los scripts de verificación.

1. **Tabla correcta:** `public.quote_requests` (no `public.quotes`).
2. **RLS habilitado** en `quote_requests` y tablas relacionadas (`quote_notes`, perfiles/admin si existen).
3. **`anon`:** solo `INSERT` en `quote_requests`; sin `SELECT`, `UPDATE`, `DELETE`.
4. **`authenticated`:** acceso completo solo si el rol es realmente administrativo. Verifica si la política se basa solo en `auth.role() = 'authenticated'`; si cualquier usuario autenticado (no solo admin) puede leer/editar leads, es un hallazgo y debe corregirse o documentarse como riesgo.
5. **Constraints:** nombre mínimo, teléfono, longitudes, estados permitidos, `source` permitido.
6. **Storage:** si existe bucket `quote-attachments`, verifica políticas, tamaño y MIME; si no existe en el código, corrige la documentación.
7. **Migraciones:** que sean idempotentes/repetibles y no fallen si se aplican dos veces.
8. **Verificación en vivo:** si hay credenciales en `.env`, ejecuta `npx tsx scripts/verify-supabase-security.ts`. Si no hay red o credenciales, marca `NOT_VERIFIED` y no simules PASS.
9. **No uses `service_role` en el cliente.** Confirma que solo se usa la `anon key` pública.

---

## 7. FASE 4 — CALIDAD DE LA SUITE DE PRUEBAS

- `tests/security.spec.ts` debe cubrir XSS, honeypot, rate limit, teléfono, WhatsApp, correo y CSV.
- **Evalúa qué NO cubre:** componentes React, `.htaccess`, CSP, RLS real, doble-escape, enlaces `target="_blank"`, exportación CSV completa, regresiones de UI.
- Añade pruebas solo para defectos reales que corrijas o para cubrir un riesgo crítico no cubierto. No infles la suite con tests triviales.
- Los tests deben fallar si se rompe el control (prueba de mutación mental: si quitas la sanitización, ¿falla el test?).

---

## 8. FASE 5 — CORRECCIONES

Para cada hallazgo:

1. Clasifícalo: `CRÍTICO`, `ALTO`, `MEDIO`, `BAJO`, `DOCUMENTACIÓN` o `FALSA ALARMA`.
2. Describe evidencia (archivo:línea, comando, salida).
3. Aplica el cambio mínimo.
4. Añade/ajusta el test si aplica.
5. Re-ejecuta la verificación.
6. Registra el antes/después.

**No cambies** estos comportamientos sin justificarlo: flujo de cotización, textos en español, diseño, SEO, enlaces de WhatsApp, accesibilidad del formulario.

---

## 9. FASE 6 — RE-VERIFICACIÓN Y CRITERIOS DE ACEPTACIÓN

Al final deben pasar:

```powershell
npm run test:security
npx tsc --noEmit
npm run build
```

Y además:

- `dist/.htaccess` presente y coherente con `public/.htaccess`.
- Cero secretos rastreados o incluidos en `dist/`.
- Cero afirmaciones de `SECURITY.md` que contradigan el código/configuración.
- Todos los hallazgos corregidos o explícitamente aceptados como riesgo residual con justificación.
- Reporte final generado en `docs/SECURITY-VERIFICATION-2026-10-22.md` (o fecha real de ejecución).

---

## 10. FORMATO DEL REPORTE FINAL

Genera `docs/SECURITY-VERIFICATION-<AAAA-MM-DD>.md` con:

1. **Resumen ejecutivo:** estado global (`PASS`, `PASS CON OBSERVACIONES`, `FAIL`), número de hallazgos por severidad.
2. **Línea base:** rama, commit, estado del working tree, salida resumida de tests/tsc/build.
3. **Matriz de verificación:** una fila por control, con `PASS` / `FAIL` / `NOT_VERIFIED`, evidencia y archivo/línea.
4. **Hallazgos:** ID, severidad, descripción, evidencia, impacto, corrección aplicada, test de regresión.
5. **Diferencias documento vs. realidad:** tabla de afirmaciones corregidas.
6. **Riesgos residuales:** lo que no se puede resolver en cliente (rate limit, RLS si no hay credenciales, DNS/SPF/DKIM/DMARC, headers en producción).
7. **Diff resumido:** archivos modificados y por qué.
8. **Comandos ejecutados y resultado:** tests, tsc, build, auditorías.
9. **Siguientes pasos recomendados:** verificación en producción con `curl -I`, RLS en dashboard, DNS, etc.

---

## 11. HIPÓTESIS CONCRETAS A CONFIRMAR O DESCARTAR

No las des por ciertas; verifica cada una:

1. `SECURITY.md` declara HSTS de 2 años (`63072000`) pero `.htaccess` usa 1 año (`31536000`).
2. `SECURITY.md` declara `form-action 'self' https://wa.me` pero `.htaccess` solo permite `'self'`.
3. `SECURITY.md` declara `microphone=()` pero `.htaccess` habilita `microphone=(self)`.
4. `SECURITY.md` habla de `public.quotes` pero el código usa `public.quote_requests`.
5. El rate limit de 30 s es solo cliente y puede evadirse; la documentación podría estar sobrevendiendo la protección.
6. `sanitizeInput` guarda entidades HTML y el dashboard podría mostrarlas doble-escapeadas.
7. El checklist de `.antigravity` reporta correo en texto plano y enlaces `target="_blank"` sin `rel`; confirma si siguen existiendo y si son reales.
8. La política RLS de `authenticated` podría permitir que cualquier usuario autenticado (no solo admin) gestione leads.
9. `scripts/security-audit.ts` puede estar usando una tabla/columna o un cliente distinto al real.
10. La CSP podría bloquear Supabase Realtime (`wss://`), fuentes, mapas o el comando de voz.
11. `Permissions-Policy` y CSP deben ser coherentes con las funciones reales del sitio (comando de voz, mapas, WhatsApp).
12. Los tests actuales no cubren `.htaccess`, CSP, RLS ni componentes; no confundas “15 tests en verde” con “seguridad verificada”.

---

## 12. ENTREGABLE ESPERADO

Al terminar, responde con:

- Estado global y lista de hallazgos.
- Qué corregiste (archivos y cambios).
- Qué quedó `NOT_VERIFIED` y por qué.
- Salida final de `npm run test:security`, `npx tsc --noEmit` y `npm run build`.
- Ruta del reporte generado.

**Empieza ahora por la Fase 0. No modifiques nada hasta tener la línea base.**
