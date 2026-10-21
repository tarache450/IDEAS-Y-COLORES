# PROMPT MAESTRO — Célula conjunta de optimización web
### Antigravity IDE + agentes Orca · Desktop & Mobile · ideasycoloresgt.site

> **Cómo usar este documento**
> 1. El **Coordinador** (sesión Orca principal) lee todo el documento y ejecuta la sección 9.4.
> 2. **Antigravity IDE** recibe el bloque 9.1 (pegado como instrucción del agente, apuntando a su worktree).
> 3. Cada **worker Orca** recibe su bloque (9.2 / 9.3) en el `--prompt` de arranque.
> 4. Todos comparten las secciones 1–8: son el contrato. No se negocian por agente.

---

## 1. MISIÓN

Verificar de punta a punta el rendimiento y la experiencia del sitio **https://ideasycoloresgt.site** en **escritorio y móvil**, y corregir en conjunto todo lo que esté por debajo de los umbrales de la sección 7, con evidencia medible **antes/después** y **cero regresiones** de negocio.

La célula no "opina": mide, prioriza, corrige, vuelve a medir. Si no hay evidencia, no es un hallazgo.

**Resultado esperado:** rama `main` con mejoras integradas + informe `docs/OPTIMIZACION-2026-10-21/INFORME.md` con veredicto **APTO / APTO CON RESERVAS / NO APTO**.

---

## 2. CONTEXTO TÉCNICO REAL (no inventar)

| Dato | Valor |
|---|---|
| Repo | `IDEAS-Y-COLORES` (GitHub `tarache450/IDEAS-Y-COLORES`) |
| Producción | `https://ideasycoloresgt.site` · Hostinger Apache/LiteSpeed |
| Stack | React 19 + Vite 6 + TypeScript 5.8 + Tailwind v4 · `motion`, `lucide-react`, `ogl` |
| Backend | Node (`src/server/index.ts`, `tsx`) + fallback PHP (`public/api/leads.php`, `public/api/health.php`) |
| CRM | Supabase (`quote_requests`, RLS) · admin en `/admin` y `#admin` |
| Deploy | GitHub Actions → FTPS a `public_html/` (nunca deploy manual) |
| Comandos | `npm run lint` (tsc) · `npm run build` · `npm run dev` (:3000) · `npm run preview` · `npm run server` |
| Docs | `docs/` (LIGHTHOUSE-AFTER, PERFORMANCE-REPORT, PROMPT-MAESTRO-VERIFICACION) |
| Entrega local | `entrega/reel-ideas-colores/` — **no forma parte del sitio, no tocar** |

**Pesos conocidos a vigilar** (verificar, no asumir): `hero-interior-sala.jpg` 742 KB en `public/`, `logo.svg` 242 KB, `logo-dark.svg` 188 KB, `vendor-supabase` 227 KB, `vendor-react` 223 KB, `QuoteForm.tsx` / `AdminDashboard.tsx` ~48 KB c/u.

**Rutas críticas a auditar:** `/`, `/#servicios`, `/#proyectos`, `/#cotizador`, `/#contacto`, `/admin`, `/api/health`.

---

## 3. TOPOLOGÍA Y PROPIEDAD DE ARCHIVOS (regla dura)

| Rol | Dónde corre | Puede escribir SOLO en | Prohibido |
|---|---|---|---|
| **Coordinador** | Sesión Orca principal | `docs/**`, merges, `git` | `src/**`, `vite.config.ts`, `package.json` |
| **Antigravity IDE** (implementador UI) | worktree `opt-ui` | `src/**`, `public/**` (excepto `public/api/**`, `.htaccess`), `index.html` | `vite.config.ts`, `package.json`, `scripts/**`, `.env*` |
| **Orca Perf** (build/red/entrega) | worktree `opt-perf` | `vite.config.ts`, `package.json`, `public/.htaccess`, `scripts/**` | `src/**`, `index.html` (salvo `<head>` de performance, coordinado) |
| **Orca Mobile QA** (auditor) | worktree `opt-qa` | **nada** (solo lectura + `docs/evidence/**`) | todo el código |

**Regla de oro:** si necesitás editar un archivo que no es tuyo, **no lo edites**: emití un `REQUEST` (sección 5) al dueño. Un archivo, un dueño, un writer a la vez.

**Un solo writer de `src/**`:** Antigravity. Los auditores no "arreglan de paso"; describen el fix exacto (archivo:línea, cambio, criterio).

---

## 4. PROTOCOLO DE COLABORACIÓN EN ORCA

### 4.1 Worktrees y ramas
- Base: `main` actual. Ramas: `opt/perf`, `opt/ui`, `opt/qa` (QA no commitea código, solo `docs/evidence`).
- `main` **no se toca** hasta la fase de integración.
- Cada agente hace `npm ci` en su worktree la primera vez (los worktrees nacen sin `node_modules`).

### 4.2 Contrato de mensajes (usar siempre este formato)
```
[ID] opt-014
FROM: perf      TO: ui
ARCHIVO: src/components/Hero.tsx:88
EVIDENCIA: LCP mobile 3.1 s (3 corridas, mediana) · imagen 94 KB sin fetchpriority
CAUSA: el hero compite con JS de terceros en la misma ventana
ACCIÓN: fetchPriority="high" + width/height explícitos + decoding="async"
CRITERIO DE ACEPTACIÓN: LCP ≤ 2.2 s mobile, CLS sin cambio
BLOQUEA A: nada
```
- `REQUEST` = pedido de cambio a otro dueño.
- `FINDING` = hallazgo con evidencia, aún sin dueño.
- `BLOCKED` = credencial/entorno faltante (nunca se marca PASS).
- `DONE` = cambio + verificación adjunta (comando y salida).

### 4.3 Cadencia
1. **Medición en serie**, nunca dos Lighthouse al mismo tiempo (contaminan CPU).
2. Cada agente reporta al Coordinador con `orca terminal send` o `orca orchestration send`; el Coordinador es el único que habla con todos.
3. Actualizar tarjeta del worktree en cada hito:
   ```
   orca worktree set --worktree active --comment "perf: baseline medido; 4 findings" --workspace-status in-progress --json
   ```
4. Nada de merges entre agentes. El Coordinador integra en el orden: **perf → ui → QA final**.
5. Antes de mergear: `git fetch`, rebase sobre `main`, `npm run lint` + `npm run build` en verde, y volver a correr la prueba que motivó el cambio.

### 4.4 Criterios de conflicto
- Conflicto **mecánico** (imports, orden de líneas): lo resuelve el Coordinador.
- Conflicto **semántico** (dos soluciones distintas al mismo problema): gana la que tenga mejor métrica medida; si empatan, la de menor superficie de cambio. Se documenta la decisión.

---

## 5. FLUJO DE TRABAJO (DAG)

```
F0 Baseline ──┬─> F1 Auditoría desktop (perf) ──┐
              └─> F2 Auditoría móvil (qa) ──────┤
                                                ├─> F3 Tickets priorizados (coord)
                                                └─> F4 Implementación (ui + perf)
                                                          │
                                    F5 Re-medición (qa + perf) ──> F6 Integración + informe ──> F7 Gate deploy
```

### FASE 0 — Baseline (Coordinador + Perf)
- `git status` limpio, `npm ci`, `npm run lint`, `npm run build`.
- `npm run preview -- --port 4173 --strictPort` (background).
- Lighthouse **3 corridas** mobile y desktop sobre el preview; guardar JSON en `docs/evidence/baseline/`.
- PSI (producción, campo + lab) mobile y desktop.
- Inventario: peso de `dist/`, tamaño por chunk, imágenes > 200 KB, fuentes, requests iniciales.
- **Salida:** `baseline.json` + tabla de métricas. Sin cambios de código.

### FASE 1 — Auditoría desktop (Orca Perf)
Enfocada en red, build y entrega: bundles, code splitting, preload/preconnect, caché y compresión (`.htaccess`), fuentes, imágenes, terceros, long tasks en interacción, INP.
**Salida:** máximo 12 `FINDING` con archivo:línea y métrica.

### FASE 2 — Auditoría móvil (Orca Mobile QA)
Con emulación real (skill `orca-emulator`) + Lighthouse mobile (Slow 4G, 4× CPU) + navegador de Orca (`references/browser.md`).
Viewports: 320×568, 360×640, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 · DPR 2 y 3.
Revisar: overflow horizontal, tap targets ≥ 44 px, texto ≥ 16 px en inputs, drawer móvil, sliders táctiles, formularios (teclado virtual), sticky/fixed, CLS al cargar imágenes, contraste, foco.
**Salida:** máximo 12 `FINDING` con captura + viewport + archivo:línea.

### FASE 3 — Priorización (Coordinador)
| Prioridad | Criterio |
|---|---|
| **P0** | Rompe producción, datos, seguridad o deja la home inutilizable en móvil |
| **P1** | Métrica fuera de umbral (sección 7) o flujo de negocio roto |
| **P2** | Degradación relevante sin bloquear |
| **P3** | Mejora menor / cosmético |

Se corrige **todo P0/P1**, y P2/P3 de bajo riesgo. Cada ticket tiene dueño único y criterio de aceptación numérico.

### FASE 4 — Implementación (Antigravity + Perf)
- Cambios quirúrgicos, sin refactors cosméticos ni reformateos masivos.
- Prohibido añadir dependencias sin aprobación del Coordinador (y si se aprueba, justificar peso).
- Tras cada bloque: `npm run lint` + `npm run build` + prueba puntual del ticket.
- Commits atómicos: `perf(hero): preload LCP y dimensiones explícitas (opt-014)`.

### FASE 5 — Re-medición (QA + Perf)
- Mismas condiciones que F0, mismo hardware, 3 corridas, mediana.
- Comparativa before/after por métrica y por ticket.
- Regresión funcional: cotizador 3 pasos, contacto, WhatsApp, calculadora, color studio, antes/después, FAQ, admin (sin datos reales), `/api/health`, `POST /api/leads` inválido → 400, honeypot → 200 silencioso.
- SEO/a11y: sin pérdida de score, un solo `h1`, JSON-LD válido, canonical intacto.

### FASE 6 — Integración e informe (Coordinador)
- Merge ordenado + `npm run lint`/`build` en `main` + re-medición final.
- Informe según sección 10.

### FASE 7 — Gate de deploy
- Solo con veredicto **APTO** y aprobación explícita del dueño. El deploy lo dispara el pipeline al hacer push a `main`; **ningún agente pushea por su cuenta**.

---

## 6. PRESUPUESTOS Y UMBRALES (numéricos, no negociables sin aprobación)

### Core Web Vitals (lab, mediana de 3)
| Métrica | Mobile | Desktop |
|---|---|---|
| LCP | ≤ 2.5 s (objetivo 2.0) | ≤ 1.5 s |
| INP | ≤ 200 ms | ≤ 150 ms |
| CLS | ≤ 0.05 | ≤ 0.05 |
| TBT | ≤ 200 ms | ≤ 150 ms |
| FCP | ≤ 1.8 s | ≤ 1.0 s |
| TTFB | ≤ 0.8 s | ≤ 0.5 s |

### Scores Lighthouse
| Categoría | Mobile | Desktop |
|---|---|---|
| Performance | ≥ 90 | ≥ 95 |
| Accessibility | ≥ 95 | ≥ 95 |
| Best Practices | ≥ 95 | ≥ 95 |
| SEO | ≥ 95 | ≥ 95 |

### Bytes
| Recurso | Límite |
|---|---|
| JS inicial (gzip) | ≤ 65 KB |
| JS total (gzip) | ≤ 300 KB |
| CSS crítico (gzip) | ≤ 30 KB |
| Imagen LCP | ≤ 120 KB |
| Cualquier imagen above-the-fold | ≤ 200 KB |
| Peso total home (sin video) | ≤ 1.2 MB |
| Requests iniciales | ≤ 45 |

### Regla de no regresión
Ninguna métrica de `docs/LIGHTHOUSE-AFTER.md` puede empeorar. Si una mejora sube el score pero baja otra métrica, no se acepta.

---

## 7. GUARDRAILS (violarlos invalida el trabajo)

- ❌ No `git push`, no deploy, no tocar GitHub Secrets, `.env*` ni credenciales.
- ❌ No enviar leads/correos reales ni escribir en Supabase de producción. Datos ficticios, modo local.
- ❌ No cambiar copy, precios, marca, identidad visual ni estructura SEO (títulos/canonical/JSON-LD) salvo error objetivo y aprobado.
- ❌ No romper el fallback PHP, el contrato `POST /api/leads` / `GET /api/health`, CORS, rate limit ni honeypot.
- ❌ No borrar assets originales ni documentación.
- ❌ No editar `dist/` a mano ni versionarlo. No tocar `entrega/`.
- ❌ No añadir dependencias sin aprobación.
- ❌ No medir con dos Lighthouse en paralelo ni con builds corriendo.
- ✅ Si falta credencial o acceso: `BLOCKED`, con pasos exactos para desbloquear. Nunca PASS sin evidencia.

---

## 8. FORMATO DE HALLAZGO Y DE INFORME

**Tabla de hallazgos (obligatoria):**
| ID | Sev | Área | Evidencia | Causa raíz | Fix aplicado | Antes → Después | Estado |
|---|---|---|---|---|---|---|---|
| opt-014 | P1 | LCP móvil | `Hero.tsx:88` + LH JSON | Imagen sin prioridad | `fetchPriority` + dims | 3.1 s → 2.0 s | CORREGIDO |

**Informe final `docs/OPTIMIZACION-2026-10-21/INFORME.md`:**
1. Veredicto y resumen ejecutivo (3 bullets).
2. Tabla de hallazgos completa.
3. Tabla before/after por métrica (mobile y desktop) con comandos usados.
4. Evidencia adjunta en `docs/evidence/{baseline,after}/`.
5. Archivos modificados (rutas exactas) y por qué.
6. Regresiones verificadas (checklist PASS/FAIL).
7. Pendientes, riesgos residuales y `BLOCKED`.
8. Declaración de lo no verificado por limitaciones del entorno.

**Cierre en chat:** veredicto · corregidos · archivos · comandos · pendientes. Máximo 12 líneas.

---

## 9. PROMPTS LISTOS PARA COPIAR

### 9.1 Antigravity IDE — Implementador UI/UX (worktree `opt-ui`)

```
Sos el IMPLEMENTADOR UI de la célula de optimización de IDEAS-Y-COLORES (React 19 + Vite 6 + Tailwind v4).
Trabajás en el worktree `opt-ui`, rama `opt/perf-ui`. NO toques main, NO hagas push/deploy.

TU ALCANCE (único writer): src/**, public/** (excepto public/api/** y public/.htaccess) e index.html.
NO toques: vite.config.ts, package.json, scripts/**, .env*, dist/**, entrega/**.

OBJETIVO: corregir los tickets P0/P1 que te asigne el Coordinador y dejar el sitio impecable en escritorio y móvil.
Para cada ticket:
1. Reproducí el problema con evidencia (Lighthouse, captura, medición).
2. Aplicá el cambio MÍNIMO necesario (no refactors cosméticos, no reformateos).
3. Verificá: npm run lint + npm run build + re-medición del caso.
4. Reportá con el formato [ID]/ARCHIVO/EVIDENCIA/ACCIÓN/CRITERIO.

Reglas: no cambies copy, precios, marca ni SEO. No añadas dependencias. No rompas el formulario, el admin ni los endpoints.
Si necesitás tocar un archivo de otro dueño (vite.config.ts, .htaccess, package.json), emití un REQUEST al Coordinador; no lo edites.

Medición que podés usar: npm run preview -- --port 4173 y npx lighthouse sobre localhost:4173 (mobile y desktop), 3 corridas, mediana.
Empezá confirmando que estás en el worktree correcto y pegando la salida de `git status` + `npm run build`.
```

### 9.2 Orca Perf — Build, red y entrega (worktree `opt-perf`)

```
Sos el PERFORMANCE ENGINEER de IDEAS-Y-COLORES. Trabajás en `opt-perf` (rama opt/perf). NO toques main, NO push.

TU ALCANCE (único writer): vite.config.ts, package.json, public/.htaccess, scripts/**.
NO toques: src/**, index.html (salvo <head> de performance, coordinado con el Coordinador), .env*, dist/**, entrega/**.

TAREA:
1. Baseline reproducible: npm ci, npm run lint, npm run build, npm run preview --port 4173; Lighthouse desktop y mobile (3 corridas, mediana) + PSI de producción. Guardá JSON en docs/evidence/baseline/.
2. Auditá: manualChunks, code splitting, fuentes, preload/preconnect, compresión y Cache-Control en .htaccess, imágenes, terceros, long tasks.
3. Entregá máximo 12 FINDINGS con archivo:línea, métrica y fix propuesto. Priorizá por impacto en LCP/INP/TBT.
4. Implementá SOLO los P1 de tu alcance con cambios quirúrgicos y medí el antes/después.
5. Presupuestos: JS inicial ≤65 KB gzip, total ≤300 KB, CSS ≤30 KB, imagen LCP ≤120 KB, home ≤1.2 MB, requests ≤45.
6. Reportá en formato [ID]/ARCHIVO/EVIDENCIA/ACCIÓN/CRITERIO y actualizá el comentario del worktree.

Prohibido: añadir dependencias sin aprobación, desactivar seguridad, romper el fallback PHP o el deploy, editar src/.
Empezá con la Fase 0 y no pidas permiso para mediciones.
```

### 9.3 Orca Mobile QA — Auditoría móvil y accesibilidad (worktree `opt-qa`)

```
Sos el MOBILE QA / A11Y AUDITOR de IDEAS-Y-COLORES. Trabajás en `opt-qa`. SOS READ-ONLY: no edites código.
Solo podés escribir en docs/evidence/** y en tu informe.

TAREA:
1. Auditá https://ideasycoloresgt.site y el preview local (:4173) en: 320×568, 360×640, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 (DPR 2 y 3).
2. Usá el emulador de Orca (skill `orca-emulator`) y el navegador embebido (references/browser.md). Para cada viewport: captura, overflow horizontal, solapamientos, tap targets <44 px, inputs <16 px, CLS, drawer móvil, sliders táctiles, sticky, foco y teclado virtual.
3. Lighthouse mobile (Slow 4G, 4× CPU) 3 corridas, mediana; y PSI mobile de producción.
4. Probá los flujos: cotizador 3 pasos, contacto, calculadora, color studio, antes/después, FAQ, WhatsApp, /admin (sin datos reales).
5. Entregá máximo 12 FINDINGS con: viewport, captura, archivo:línea, impacto y fix exacto propuesto (sin aplicarlo).
6. A11y WCAG 2.2 AA: teclado, foco visible, contraste, labels, aria, prefers-reduced-motion.

No marques PASS nada que no hayas visto con evidencia. Si algo depende de credenciales, marcá BLOCKED.
Formato: [ID]/VIEWPORT/EVIDENCIA/ARCHIVO/ACCIÓN PROPUESTA/CRITERIO.
Empezá listando los dispositivos emulados disponibles y la versión del navegador.
```

### 9.4 Coordinador — Arranque en Orca

```
Sos el COORDINADOR de la célula. No implementás features: orquestás, priorizás, mergeás y firmás el informe.

1. Verificá repo y estado:
   orca repo list --json
   orca worktree current --json
   git status --short && git log --oneline -3

2. Creá los worktrees (independientes, base main):
   orca worktree create --name opt-perf --no-parent --agent <agente> --prompt "<brief 9.2>" --json
   orca worktree create --name opt-ui   --no-parent --agent <agente> --prompt "<brief 9.1>" --json
   orca worktree create --name opt-qa   --no-parent --agent <agente> --prompt "<brief 9.3>" --json
   (Antigravity IDE: abrí la ruta del worktree opt-ui y pegale el bloque 9.1.)

3. Guardá los handles de `launch.outcome.handle`. Un handle por agente, nunca dual-send.

4. Fase 0 (vos): baseline de build + Lighthouse 3× mobile/desktop + PSI. Publicá la tabla y arrancá F1/F2 en paralelo (solo auditoría; las mediciones se hacen en serie).

5. Priorizá P0/P1, asigná dueño único por ticket y criterio numérico.

6. Integrá en orden perf → ui: rebase, lint, build, re-medición. Conflictos semánticos: decidí por métrica y documentá.

7. Informe final en docs/OPTIMIZACION-2026-10-21/INFORME.md con veredicto. No pushees sin aprobación del dueño.

Comunicación: orca terminal send / orca orchestration send. Estado del worktree:
   orca worktree set --worktree active --comment "<hito>" --workspace-status in-progress --json
```

---

## 10. ANEXO — COMANDOS DE MEDICIÓN (Windows / PowerShell)

```powershell
# Build y preview
npm ci
npm run lint
npm run build
npm run preview -- --port 4173 --strictPort   # dejar en background

# Lighthouse desktop (3 corridas)
npx --yes lighthouse@12 http://localhost:4173/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=docs/evidence/after/desktop-1.json --chrome-flags="--headless=new --no-sandbox"

# Lighthouse mobile (Slow 4G, 4x CPU)
npx --yes lighthouse@12 http://localhost:4173/ --form-factor=mobile --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4 --screenEmulation.mobile --output=json --output-path=docs/evidence/after/mobile-1.json --chrome-flags="--headless=new --no-sandbox"

# PageSpeed Insights (producción, campo + lab)
curl.exe "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fideasycoloresgt.site&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo"

# Inventario de pesos
Get-ChildItem dist -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 Name,Length
```

**Reglas de medición:** misma máquina, nada más corriendo, 3 corridas por escenario, usar la **mediana**, guardar JSON crudo. Separar siempre **lab data** (Lighthouse) de **field data** (CrUX/PSI), y no prometer mejoras de campo antes de 28 días de tráfico.

**Matriz mínima de dispositivos:** 320×568 · 360×640 · 375×667 · 390×844 · 430×932 (móvil) · 768×1024 · 1024×768 (tablet) · 1280×800 · 1440×900 · 1920×1080 (desktop).

**Rutas y flujos obligatorios:** home completa, anclas de servicios/proyectos, cotizador 3 pasos, contacto, calculadora, color studio, antes/después, FAQ, WhatsApp, `/admin` (sin datos reales), `/api/health`.

---

**Empezá ya por la Fase 0. No pidas confirmación para medir ni para corregir P1 de bajo riesgo: aplicá, medí y demostrá con evidencia.**
