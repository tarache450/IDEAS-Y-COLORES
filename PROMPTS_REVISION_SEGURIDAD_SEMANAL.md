# Prompts — Revisión semanal de seguridad

**Proyecto:** Ideas & Colores Multi-Servicios (`https://ideasycoloresgt.site`)
**Repositorio:** `IDEAS-Y-COLORES`
**Frecuencia:** semanal (recomendado: lunes por la mañana)
**Rama de trabajo:** `fix/security-hardening` o `main` según corresponda

Este documento contiene prompts listos para copiar y pegar en un agente. La revisión semanal recomendada es el **Prompt B** (audita y corrige). Usa el **Prompt A** cuando solo quieras un dictamen sin cambios, el **Prompt C** después de desplegar y el **Prompt D** ante un incidente.

## Variables para reemplazar

| Variable | Valor |
| :--- | :--- |
| `{{FECHA}}` | Fecha de la revisión, formato `YYYY-MM-DD` |
| `{{RAMA}}` | Rama a auditar, por ejemplo `fix/security-hardening` |
| `{{DOMINIO}}` | `https://ideasycoloresgt.site` |
| `{{SUPABASE_REF}}` | `khagzrjxoqwzqrikomrd` |
| `{{INFORME}}` | `docs/SECURITY-VERIFICATION-{{FECHA}}.md` |

Regla de oro: **una afirmación de seguridad no es evidencia**. Cada resultado debe respaldarse con un comando, una respuesta HTTP, un archivo/línea o una consulta SQL. Si no se puede comprobar, se marca `NOT_VERIFIED`; nunca se asume que “debería funcionar”.

---

## Prompt A — Auditoría semanal (solo lectura)

```text
Actúa como auditor senior de seguridad web, Supabase y configuraciones Apache/Hostinger.

CONTEXTO
- Repositorio: IDEAS-Y-COLORES
- Rama: {{RAMA}}
- Dominio de producción: {{DOMINIO}}
- Proyecto Supabase: {{SUPABASE_REF}}
- Fecha de revisión: {{FECHA}}

OBJETIVO
Realiza una auditoría semanal de seguridad en modo SOLO LECTURA. No modifiques archivos, no hagas commit, no hagas push, no despliegues, no apliques migraciones y no cambies DNS. No ejecutes scripts que inserten, actualicen o borren datos en producción.

REGLAS
1. No imprimas valores de claves, tokens, contraseñas ni cadenas de conexión. Muestra solo el nombre de la variable y el archivo donde aparece.
2. No ejecutes `scripts/security-audit.ts`, `scripts/verify-supabase-security.ts` ni ningún script que escriba en Supabase producción.
3. No consideres la documentación como prueba. Verifica el código, la configuración o la respuesta real.
4. Diferencia claramente: PASS (verificado), FAIL (defecto real), NOT_VERIFIED (sin acceso/evidencia) y BLOCKED (requiere credenciales o panel externo).
5. Si un control solo existe en el cliente (por ejemplo rate limiting), indícalo y no lo presentes como control de servidor.

FASE 1 — LÍNEA BASE DEL REPOSITORIO
Ejecuta y registra:
- `git fetch --all --prune`
- `git status -sb`
- `git log --oneline -5`
- `npm ci`
- `npm run test:security`
- `npx tsc --noEmit`
- `npm run build`
- `npm audit --omit=dev`
- `npm audit`
- `npm run orca:auditor`

FASE 2 — CÓDIGO Y DEPENDENCIAS
Revisa como mínimo:
- `src/utils/security.ts`: sanitización, escape HTML, protocolos peligrosos, teléfonos, honeypot, rate limit, WhatsApp, mailto, CSV.
- `src/services/quotes.ts`: validación, doble escape, fallback de Supabase, manejo de errores.
- `src/lib/supabase.ts`: claves, `signUpAdmin`, `insertQuoteRequest`, sesión admin.
- `src/components/admin/AdminDashboard.tsx`: autenticación, autorización, renderizado de datos, export CSV, `window.open`.
- Todos los `target="_blank"` y sus `rel`.
- `Uso de dangerouslySetInnerHTML`, `innerHTML`, `eval`, `Function`, `document.write`.
- Dependencias con advisories: distingue producción vs desarrollo y justifica el riesgo.
- Secretos versionados: `service_role`, claves privadas, tokens, `.env`.

FASE 3 — CONFIGURACIÓN APACHE / CSP
Revisa `public/.htaccess` y `dist/.htaccess`:
- HSTS: `max-age=63072000; includeSubDomains; preload`.
- CSP: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `form-action 'self'`, `script-src-attr 'none'`.
- `script-src` sin `'unsafe-inline'`; hash SHA-256 del JSON-LD correcto.
- `style-src`, `font-src`, `img-src`, `connect-src`, `frame-src` coherentes con el sitio.
- `Permissions-Policy` coherente con las APIs realmente usadas (micrófono para voz, cámara/geolocalización/pago/USB bloqueados).
- Bloqueo de `.env`, `.git`, `.sql`, `.log`, `.bak`, `.sh`, `.ini`, `.conf`, `.yml`, `.yaml`, `.lock`, `tsconfig.json`, `package-lock.json`.
- Redirecciones HTTP→HTTPS y `www`→sin `www`.
- Que `dist/.htaccess` sea idéntico a `public/.htaccess` después del build.

FASE 4 — PRODUCCIÓN (SOLO LECTURA)
Ejecuta y guarda la evidencia:
- `curl -sSI {{DOMINIO}}/`
- `curl -sSI http://ideasycoloresgt.site/`
- `curl -sSI https://www.ideasycoloresgt.site/`
- Códigos HTTP de `/.env`, `/.git/config`, `/tsconfig.json`, `/package-lock.json`, `/backup.sql`, `/app.log`.
- DNS: SPF, DMARC y DKIM de `ideasycoloresgt.site` y `ideasycoloresgt.com`.
- Compara las cabeceras live con `public/.htaccess`. Si no coinciden, indica que el endurecimiento no está desplegado.

FASE 5 — SUPABASE / RLS (si hay acceso de solo lectura)
Verifica sin modificar datos:
- ¿Existe `public.is_admin()`?
- ¿Las políticas de `quote_requests` y `quote_notes` usan `public.is_admin()` o siguen en `USING (true)`?
- ¿`anon` puede hacer `SELECT`, `UPDATE` o `DELETE`? Debe poder solo `INSERT`.
- ¿El registro público de Auth está deshabilitado?
- ¿`quote_requests_stats` usa `security_invoker = true`?
Si no tienes credenciales, marca todo como `BLOCKED` y explica exactamente qué hace falta.

FASE 6 — DOCUMENTACIÓN
Contrasta `SECURITY.md`, `docs/SECURITY-REPORT.md` y los informes anteriores contra la realidad. Señala afirmaciones obsoletas, controles inexistentes y tablas/columnas con nombres incorrectos.

SALIDA OBLIGATORIA
Genera un informe en Markdown con:
1. Resumen ejecutivo y veredicto global.
2. Tabla de línea base con comando y resultado.
3. Tabla de hallazgos: ID, severidad (CRÍTICA/ALTA/MEDIA/BAJA/INFO), estado (PASS/FAIL/NOT_VERIFIED/BLOCKED), evidencia exacta, archivo/línea o URL.
4. Detalle de cada FAIL con reproducción y recomendación.
5. Controles que no pudiste verificar y por qué.
6. Próximos pasos ordenados por riesgo.
No corrijas nada en este prompt.
```

---

## Prompt B — Auditoría + corrección (revisión semanal recomendada)

```text
Actúa como ingeniero senior de seguridad web, Supabase y Apache/Hostinger.

CONTEXTO
- Repositorio: IDEAS-Y-COLORES
- Rama: {{RAMA}}
- Dominio: {{DOMINIO}}
- Proyecto Supabase: {{SUPABASE_REF}}
- Fecha: {{FECHA}}

OBJETIVO
Ejecuta la revisión semanal de seguridad y CORRIGE cualquier defecto real que encuentres. Al terminar, deja el repositorio en un estado verificable y genera el informe {{INFORME}}.

PROHIBIDO
- No hagas commit, push ni despliegue salvo que se te pida explícitamente.
- No cambies DNS, no apliques migraciones en producción ni modifiques datos reales.
- No imprimas secretos, tokens, contraseñas ni claves.
- No desactives ni debilites controles (RLS, CSP, validación, honeypot, sanitización) para “hacer pasar” una prueba.
- No ejecutes scripts que escriban en Supabase producción.
- No cambies dependencias por moda; solo si reducen un riesgo real y no rompen el build.

PROCESO
1. Ejecuta la misma auditoría del Prompt A.
2. Clasifica cada hallazgo en: real, falso positivo, documentación desalineada o no verificable.
3. Corrige primero CRÍTICO y ALTO; después MEDIO; después BAJO.
4. Para cada corrección:
   - Haz el cambio mínimo y consistente con el estilo del proyecto.
   - Añade o ajusta una prueba de regresión cuando sea posible.
   - Actualiza la documentación solo si el comportamiento real cambió.
   - Si la documentación y el código no coinciden, decide cuál es la intención correcta y explica la decisión; no “arregles” la documentación para tapar un control inseguro.
5. Si una corrección requiere credenciales, panel de Hostinger, Supabase Dashboard o DNS, no improvises: marca `BLOCKED` y describe el paso exacto que debe ejecutar una persona.
6. No introduzcas vulnerabilidades nuevas. Revisa tu propio diff antes de terminar.

VERIFICACIÓN FINAL OBLIGATORIA
- `npm run test:security`
- `npx tsc --noEmit`
- `npm run build`
- `npm audit --omit=dev`
- `npm audit`
- `npm run orca:auditor`
- Comparar `dist/.htaccess` con `public/.htaccess`.
- Confirmar que el hash SHA-256 del JSON-LD de `dist/index.html` está en `dist/.htaccess`.
- Confirmar que `dist/index.html` no tiene manejadores inline.

INFORME {{INFORME}}
Incluye:
1. Resumen ejecutivo (PASS CON OBSERVACIONES / ACCIÓN REQUERIDA).
2. Línea base antes/después.
3. Hallazgos corregidos: ID, severidad, causa, evidencia, archivos cambiados, prueba añadida.
4. Hallazgos abiertos/BLOCKED con el paso exacto para cerrarlos.
5. Riesgos aceptados y por qué.
6. Comandos ejecutados y resultados.
7. Diff resumido.
8. Próxima revisión.

CRITERIO DE ÉXITO
- 0 vulnerabilidades de producción en `npm audit --omit=dev`.
- Suite de seguridad 100% verde.
- Typecheck y build verdes.
- Sin secretos nuevos versionados.
- Sin controles de seguridad debilitados.
- Todo lo que no se pudo verificar queda marcado `NOT_VERIFIED` o `BLOCKED`, nunca inventado.
```

---

## Prompt C — Verificación post-despliegue

```text
Actúa como verificador de seguridad post-despliegue. No modifiques código ni configuración; solo verifica y dictamina GO / NO-GO.

CONTEXTO
- Dominio: {{DOMINIO}}
- Fecha: {{FECHA}}
- Repositorio: IDEAS-Y-COLORES

VERIFICA EN PRODUCCIÓN
1. Cabeceras (`curl -sSI {{DOMINIO}}/`):
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - CSP completa, sin `script-src 'unsafe-inline'`, con `script-src-attr 'none'`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` coherente con el `.htaccess`
2. Hash CSP:
   - Extrae el contenido del `<script type="application/ld+json">` de `https://ideasycoloresgt.site/`.
   - Calcula SHA-256 y confirma que aparece en la CSP.
3. Archivos sensibles: `/.env`, `/.git/config`, `/tsconfig.json`, `/package-lock.json`, `/backup.sql`, `/app.log` deben devolver 403 o una respuesta que no filtre contenido.
4. Redirecciones: HTTP→HTTPS 301; `www`→sin `www` 301; sin bucles.
5. Navegador real:
   - Consola sin violaciones CSP.
   - Google Fonts, JSON-LD, Supabase, mapas e imágenes cargan.
   - El formulario de cotización funciona y no hay errores de CORS.
6. DNS:
   - SPF, DMARC y DKIM de `.site` y `.com`.
   - DMARC de `.com` no debe faltar si se usa ese dominio para correo.
7. Supabase:
   - Un administrador real puede leer/actualizar leads.
   - Un usuario autenticado no-admin NO puede leer ni modificar leads (probar con una cuenta de prueba, sin tocar datos reales).
8. Regresión funcional: carga del sitio, WhatsApp, teléfono, correo, calculadora y formulario.

SALIDA
- Tabla PASS/FAIL/NOT_VERIFIED por control, con evidencia.
- Veredicto GO o NO-GO.
- Si es NO-GO, lista ordenada de bloqueadores y el responsable de cada uno.
```

---

## Prompt D — Incidente o regresión urgente

```text
Actúa como respondedor de incidentes de seguridad.

CONTEXTO
- Repositorio: IDEAS-Y-COLORES
- Dominio: {{DOMINIO}}
- Fecha: {{FECHA}}
- Incidente reportado: [DESCRIBIR]

OBJETIVO
Triar, contener, corregir y verificar el incidente sin destruir evidencia.

PASOS
1. Reproduce el incidente y determina alcance: datos comprometidos, usuarios afectados, ventana temporal.
2. Contén: deshabilita la ruta vulnerable, rota claves si pudieron exponerse, bloquea el vector.
3. No borres logs ni evidencia. Guarda copia antes de cambiar nada.
4. Corrige la causa raíz, no solo el síntoma.
5. Añade prueba de regresión.
6. Verifica que el vector ya no funciona y que no hay regresiones.
7. Redacta postmortem: línea de tiempo, causa raíz, impacto, acciones, prevención.

PROHIBIDO
- No ocultes el incidente.
- No imprimas secretos.
- No hagas commit/push/deploy sin autorización.
- No elimines datos ni logs.
```

---

## Cómo usar estos prompts

| Situación | Prompt |
| :--- | :--- |
| Revisión semanal normal | **B** (audita y corrige) |
| Solo quieres dictamen, sin cambios | **A** |
| Acabas de desplegar | **C** |
| Sospecha de incidente/regresión | **D** |

Checklist operativa: `docs/security/CHECKLIST-SEMANAL.md`
Plantilla de informe: `docs/security/PLANTILLA-INFORME-SEMANAL.md`

## Evidencia mínima aceptable

- **Código:** archivo + línea + fragmento.
- **Configuración:** archivo + directiva exacta.
- **Producción:** comando + salida HTTP/headers.
- **Supabase:** consulta SQL + resultado, o captura del panel.
- **Dependencias:** comando + versión + severidad + alcance (prod/dev).
- **DNS:** tipo de registro + valor + dominio.

Si falta la evidencia, el estado es `NOT_VERIFIED`, no `PASS`.
