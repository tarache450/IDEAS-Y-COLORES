# PROMPT MAESTRO — VERIFICACIÓN DE OPTIMIZACIONES Y PERFORMANCE
### Célula de agentes enlazados (Antigravity IDE + Orca) · ideasycoloresgt.site

> **Cómo usar este documento**
> 1. El **Coordinador** lee todo y ejecuta el bloque 9.1.
> 2. Cada agente recibe su bloque (9.2 / 9.3 / 9.4) al arrancar su worktree.
> 3. Las secciones 1–8 son el contrato común: no se negocian por agente.

---

## 0. MISIÓN

Verificar —**sin re-optimizar**— que las optimizaciones integradas en `main` cumplen exactamente lo que declara el informe, en **escritorio y móvil**, en **local y producción**, y detectar cualquier regresión introducida.

Salida obligatoria: `docs/VERIFICACION-2026-10-27/INFORME.md` con veredicto **APTO / APTO CON RESERVAS / NO APTO**, tabla *claim → medido → tolerancia* y evidencia reproducible.

**Regla de hierro:** verificar no es optimizar. Si encontrás algo mejorable, se reporta como `FINDING` con evidencia y fix propuesto; **no se aplica** hasta que el Coordinador abra un ticket.

---

## 1. OBJETO DE LA VERIFICACIÓN (claims a comprobar)

Commits en `main`: `3c8211b` (perf build), `1f21be9` (UI/lazy/CLS), `9e003fb` (fuentes), `7fe5c6d` (informe).

| # | Cambio implementado | Archivo(s) | Claim a verificar |
|---|---|---|---|
| V1 | `LazySection` con IntersectionObserver 800 px + fallback 3.2 s + evento `navigate-section` | `src/components/ui/LazySection.tsx`, `src/App.tsx` | Baja TBT/LCP sin romper anclas ni carga directa con hash |
| V2 | Fuentes no bloqueantes + preload variable + `display=optional` | `index.html` | CLS 0.000 y sin FOUT perceptible |
| V3 | Preload del hero solo desktop; sin preload del logo | `index.html` | No compite con el LCP móvil |
| V4 | Imágenes recomprimidas | `public/hero-interior-sala.jpg` (79.658 B), `public/projects/futeca-concepcion-{antes,despues}.webp` (152.216 / 167.308 B) | Ninguna imagen > 200 KB; LCP ≤ 120 KB |
| V5 | Brotli + Deflate + caché inmutable | `public/.htaccess` | Producción responde `content-encoding: br` o `gzip` y `cache-control: immutable` en `/assets` |
| V6 | Build es2022, `modulePreload.polyfill:false`, `manualChunks`, middleware gzip de preview | `vite.config.ts` | Bundles y chunks según presupuesto; preview comprime |
| V7 | Táctil/a11y: inputs 16 px, `min-h-[44px]`, h3, `aria-label` | `QuoteForm`, `ContactSection`, `FloatingWhatsApp`, `MoodColorPicker`, `BeforeAfterSlider`, `FloatingColorDock`, `BentoTrustGrid`, `Hero` | Sin auto-zoom iOS, targets ≥ 44 px, a11y ≥ 95 |
| V8 | Resultados declarados | `docs/OPTIMIZACION-2026-10-21/INFORME.md` | Desktop **95** / LCP 1.29 s / CLS 0.002 / TBT 0 ms · Móvil **67** / LCP 5.66 s / CLS 0.000 / TBT 90 ms · A11y 95 · BP 100 · SEO 100 |

**Estado conocido al 2026-10-27:** producción sigue sirviendo el build anterior (`assets/index-arISqkv9.css`, sin `display=optional`). El workflow compila pero **no despliega** porque faltan los secrets FTP. Por lo tanto: la verificación de producción debe marcar `BLOCKED` si el hash no coincide con `main`, no `FAIL`.

---

## 2. ENTORNOS (no mezclar resultados)

| Entorno | Qué es | Uso |
|---|---|---|
| **A · LOCAL** | `npm run build` de `main` + `npm run preview --port 4173`. Incluye el middleware gzip que emula `.htaccess`. | Medición principal lab |
| **B · PRODUCCIÓN** | `https://ideasycoloresgt.site` (build realmente desplegado) | Red, caché, compresión, TTFB, hash |
| **C · MÓVIL** | Emulador Orca / viewports reales | Ergonomía, overflow, táctil, teclado |

Reglas: nunca comparar métricas de A con B sin declararlo; **lab data ≠ field data** (CrUX tarda ~28 días).

---

## 3. TOPOLOGÍA DE AGENTES Y PERMISOS

| Rol | Worktree / rama | Puede escribir | Prohibido |
|---|---|---|---|
| **Coordinador** | `main` (sesión Orca) | `docs/VERIFICACION-*`, merges | `src/**`, `vite.config.ts` |
| **V-PERF** | `verify-perf` · `verify/perf` | `docs/verificacion/perf/**` (solo lectura de código) | editar código |
| **V-MOBILE** | `verify-mobile` · `verify/mobile` | `docs/verificacion/mobile/**` (solo lectura de código) | editar código |
| **Antigravity** | `verify-ui` · `verify/ui` | `src/**`, `public/**`, `index.html` **solo si hay ticket de fix** | `vite.config.ts`, `.env*`, `package.json` |

**Un archivo, un writer.** Un fix se hace en `verify/fixes`, nunca en `main` durante la verificación. El Coordinador integra después del veredicto.

---

## 4. PROTOCOLO DE COLABORACIÓN (Orca)

- Worktrees independientes desde `main`: `--no-parent`.
- `npm ci` en cada worktree (nacen sin `node_modules`).
- Medición **en serie**: jamás dos Lighthouse simultáneos ni builds corriendo durante la medición.
- Mensajes con formato:

```
[ID] vfy-003
FROM: mobile   TO: perf
CLAIM: V2 (CLS 0.000)
EVIDENCIA: 3 corridas, mediana 0.000 / captura scroll 0-100%
RESULTADO: PASS
DESVIACIÓN: 0.000 (tolerancia 0.05)
```

- `FINDING` = defecto con evidencia y fix propuesto (no aplicado).
- `BLOCKED` = falta acceso/entorno; nunca se convierte en PASS.
- El Coordinador es el único que habla con todos y el único que integra.

---

## 5. MATRIZ DE VERIFICACIÓN

### 5.1 Build y entrega
- [ ] `npm ci`, `npm run lint`, `npm run build` en verde desde un clon limpio.
- [ ] El hash del build local coincide con el que sirve producción (o `BLOCKED`).
- [ ] `dist/` no contiene `docs/`, `entrega/`, `.env`, videos ni evidencia.
- [ ] Sin dependencias nuevas ni cambios de `package.json` no declarados.
- [ ] `npm audit --omit=dev` sin críticos nuevos.

### 5.2 Performance (lab, mediana de 3)
| Métrica | Desktop | Móvil | Tolerancia PASS |
|---|---|---|---|
| Performance | ≥ 95 | ≥ 65 | ±5 pts vs claim |
| LCP | ≤ 1.5 s | ≤ 6.5 s | ±10 % vs claim |
| TBT | ≤ 150 ms | ≤ 200 ms | ±50 ms |
| CLS | ≤ 0.05 | ≤ 0.05 | +0.01 |
| FCP | ≤ 1.2 s | ≤ 5.5 s | ±15 % |
| A11y / BP / SEO | ≥ 95 / 95 / 95 | ≥ 95 / 95 / 95 | sin caída |

Claim de referencia: **desktop 95 · LCP 1.29 · TBT 0 · CLS 0.002** / **móvil 67 · LCP 5.66 · TBT 90 · CLS 0.000**.

**Anti-trampa de medición:** comprobar que el resultado móvil no proviene del middleware de preview. Ejecutar una corrida con `Accept-Encoding: identity` o comparar bytes crudos vs gzip; declarar la diferencia en el informe.

### 5.3 Transferencia y presupuesto
- [ ] JS inicial (suma de `modulepreload`) ≤ 160 KB gzip; reportar el número real.
- [ ] CSS ≤ 30 KB gzip.
- [ ] Ninguna imagen > 200 KB; LCP ≤ 120 KB.
- [ ] Peso total de home ≤ 1.2 MB sin video.
- [ ] Requests iniciales ≤ 45.
- [ ] Chunks: `vendor-react`, `vendor-motion`, `vendor-icons`, `vendor-supabase` (¿está Supabase fuera de la ruta crítica?).

### 5.4 Red, caché y compresión (producción)
```powershell
curl.exe -sI https://ideasycoloresgt.site/ | Select-String "content-encoding|cache-control|server"
curl.exe -sI https://ideasycoloresgt.site/assets/index-XXXX.css | Select-String "content-encoding|cache-control|expires"
```
- [ ] HTML sin caché agresiva; `/assets/*` con `immutable`.
- [ ] `br` o `gzip` real en HTML/CSS/JS/SVG.
- [ ] HTTPS válido, HTTP/2, sin mixed content.
- [ ] TTFB ≤ 0.8 s móvil / 0.5 s desktop.

### 5.5 Regresiones funcionales (obligatorias)
- [ ] Anclas directas: `/#servicios`, `/#proyectos`, `/#cotizar`, `/#contacto`, `/#faq`, `/#estudio-color`, `/#calculadora` → cargan y hacen scroll a la sección.
- [ ] Carga inicial con hash (`/#proyectos`) monta la sección sin depender del observer.
- [ ] Cotizador 3 pasos + validación; contacto; calculadora; color studio; antes/después; WhatsApp.
- [ ] `navigate-section` dispara el montaje de la sección destino.
- [ ] CLS al hacer scroll completo (los placeholders no deben empujar contenido de forma visible).
- [ ] `/admin` carga y no expone datos; `/api/health` 200 en runtime Node; `POST /api/leads` inválido → 400; honeypot → 200 silencioso.
- [ ] Sin errores en consola ni requests 404/500 en home, anclas y flujos.

### 5.6 Responsive y accesibilidad
Viewports: 320×568, 360×640, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 · DPR 2 y 3.
- [ ] Cero scroll horizontal; cero solapamientos; textos no cortados.
- [ ] Tap targets ≥ 44×44 px; inputs ≥ 16 px en móvil (sin zoom iOS).
- [ ] Drawer/header móvil, sliders táctiles, dock flotante y WhatsApp operables con una mano.
- [ ] Foco visible, navegación por teclado, `prefers-reduced-motion`, contraste AA.
- [ ] Menú y CTAs siguen funcionando con JS lento (LazySection).

### 5.7 SEO y contenido
- [ ] `title`, meta description, canonical, OG/Twitter intactos.
- [ ] JSON-LD válido (Rich Results Test) y `h1` único.
- [ ] El contenido crítico sigue siendo indexable (no depende de interacción).
- [ ] `robots.txt` y `sitemap.xml` 200.
- [ ] No hay `noindex` accidental por entorno.

### 5.8 Fuentes
- [ ] Los 2 `preload` de fuentes devuelven 200 y se usan (no se descargan dos veces).
- [ ] `display=optional` activo; sin swap visible ni CLS por tipografía.
- [ ] Fallback legible y sin saltos de línea raros en H1.

---

## 6. CRITERIOS DE VEREDICTO

| Resultado | Significado |
|---|---|
| **PASS** | Claim reproducido dentro de tolerancia, con comando y evidencia |
| **WARN** | Fuera de tolerancia pero sin impacto funcional/UX; se documenta |
| **FAIL** | Claim no reproducido o regresión funcional/visual real |
| **BLOCKED** | No se puede medir por acceso, entorno o deploy pendiente (nunca PASS) |

- **APTO:** 0 FAIL en P0/P1, todos los ítems de 5.5 en PASS, métricas dentro de tolerancia.
- **APTO CON RESERVAS:** 0 FAIL P0/P1, con WARN o BLOCKED documentados y plan de cierre.
- **NO APTO:** cualquier FAIL P0/P1, regresión funcional, o métrica principal fuera de tolerancia sin causa explicada.

---

## 7. EVIDENCIA Y REPORTE

```
docs/verificacion/
  perf/{raw,REPORTE.md}
  mobile/{raw,REPORTE.md}
  visual/{capturas,REPORTE.md}
docs/VERIFICACION-2026-10-27/INFORME.md
```
- JSON crudos **no se versionan** (`.gitignore`); sí los `REPORTE.md` y capturas clave.
- Cada fila del informe: `claim | esperado | medido | tolerancia | resultado | evidencia (ruta/comando)`.
- Incluir: versión de Lighthouse, flags, hardware, si había procesos en paralelo, y hash del build medido.

---

## 8. GUARDRAILS

- ❌ No `git push`, no deploy, no tocar secrets, `.env*`, Supabase de producción ni enviar leads reales.
- ❌ No cambiar copy, precios, marca, SEO ni estructura por "mejorar de paso".
- ❌ No declarar PASS sin comando + salida; no usar capturas sin viewport declarado.
- ❌ No medir con dos Lighthouse en paralelo ni con `npm run build` corriendo.
- ❌ No mezclar lab con field ni local con producción.
- ✅ Si falta acceso: `BLOCKED` con los pasos exactos para desbloquear.

---

## 9. PROMPTS LISTOS PARA COPIAR

### 9.1 Coordinador — arranque
```
Sos el COORDINADOR de la verificación de performance de IDEAS-Y-COLORES. No implementás: orquestás, validás evidencia y firmás el veredicto.

1. git fetch && git status && git log --oneline -5. Confirmá que main está en 7fe5c6d o posterior.
2. Creá los worktrees de verificación (read-only):
   orca worktree create --repo id:<repoId> --name verify-perf   --no-parent --agent antigravity --prompt "<brief 9.2>" --json
   orca worktree create --repo id:<repoId> --name verify-mobile --no-parent --agent antigravity --prompt "<brief 9.3>" --json
3. Guardá un handle por agente. Comunicación: orca terminal send / orchestration send.
4. Publicá la matriz de la sección 5 y exigí evidencia por fila.
5. Revisá que cada PASS tenga comando y salida. Lo que no tenga evidencia, vuelve como FAIL/BLOCKED.
6. Escribí docs/VERIFICACION-2026-10-27/INFORME.md con veredicto y tabla claim→medido.
7. No pushees. No mergees fixes sin aprobación del dueño.
```

### 9.2 V-PERF — Performance, build y red (worktree `verify-perf`)
```
Sos el VERIFICADOR DE PERFORMANCE de IDEAS-Y-COLORES. Trabajás en `verify-perf`. SOS READ-ONLY sobre el código: solo escribís en docs/verificacion/perf/**.

VERIFICÁ (no optimices) los claims V1–V8 de docs/PROMPT-MAESTRO-VERIFICACION-PERFORMANCE.md:
1. Clon limpio: npm ci && npm run lint && npm run build. Anotá hash y tamaño de dist.
2. npm run preview -- --port 4173 --strictPort (background). 3 corridas desktop + 3 mobile, mediana, en serie. Guardá JSON en docs/verificacion/perf/raw/.
3. Compará contra: desktop 95 / LCP 1.29 / TBT 0 / CLS 0.002 y móvil 67 / LCP 5.66 / TBT 90 / CLS 0.000.
4. Anti-trampa: repetí una corrida forzando identidad (sin gzip) y explicá la diferencia de bytes.
5. Inventariá JS inicial (modulepreload), CSS gzip, imágenes >200 KB, requests, peso total.
6. Producción: curl -I para content-encoding, cache-control, HTTP/2 y TTFB; compará el hash del build con main (si difiere → BLOCKED, no FAIL).
7. Escribí docs/verificacion/perf/REPORTE.md con tabla claim→medido→tolerancia→resultado y hallazgos.
Formato de mensaje: [ID]/CLAIM/EVIDENCIA/RESULTADO/DESVIACIÓN. No edites código, no pushees.
```

### 9.3 V-MOBILE — Móvil, responsive y a11y (worktree `verify-mobile`)
```
Sos el VERIFICADOR MÓVIL / A11Y de IDEAS-Y-COLORES. Trabajás en `verify-mobile`. READ-ONLY sobre código: solo docs/verificacion/mobile/**.

VERIFICÁ:
1. Lighthouse mobile (Slow 4G, 4x CPU) 3 corridas, mediana. Compará con 67 / LCP 5.66 / CLS 0 / TBT 90.
2. Emulador Orca + navegador embebido en 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 (DPR 2/3): overflow, solapamientos, textos cortados.
3. Regresión de LazySection: anclas #servicios #proyectos #cotizar #contacto #faq #estudio-color #calculadora, carga directa con hash y navegación interna. Capturá CLS durante el scroll completo.
4. Táctil: targets ≥44 px, inputs ≥16 px, drawer, sliders, dock y WhatsApp. Teclado virtual y foco.
5. A11y: teclado, foco visible, contraste AA, labels/aria, prefers-reduced-motion, h1 único.
6. Fuentes: preload 200, sin FOUT/CLS, fallback legible en H1.
7. Escribí docs/verificacion/mobile/REPORTE.md con viewport + captura + archivo:línea + resultado.
No edites código, no pushees. Si algo falla, proponé el fix exacto sin aplicarlo.
```

### 9.4 Antigravity — Verificación visual y fixes (worktree `verify-ui`)
```
Sos el VERIFICADOR VISUAL e IMPLEMENTADOR de fixes de IDEAS-Y-COLORES. Trabajás en `verify-ui` (rama verify/ui). Único writer de src/**, public/** e index.html, SOLO para tickets aprobados por el Coordinador.

FASE 1 — VERIFICAR (sin tocar código):
- Desktop y móvil: home completa, hero, secciones lazy al hacer scroll, anclas, cotizador, contacto, admin.
- Confirmá que LazySection no rompe el layout ni las anclas, y que los placeholders no generan saltos visibles.
- Revisá foco, contraste, tipografía (display=optional), imágenes recomprimidas y tap targets.
- Entregá FINDINGS con archivo:línea + captura + fix propuesto. Nada más.

FASE 2 — solo si el Coordinador aprueba un ticket:
- Cambio mínimo, npm run lint + npm run build + verificación puntual.
- Commit en verify/fixes. NO push, NO deploy, NO cambios de copy/precios/SEO.
```

---

## 10. ANEXO — COMANDOS

```powershell
# Build reproducible
npm ci; npm run lint; npm run build
Get-ChildItem dist -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 Name,Length

# Preview (compresión emulada)
npm run preview -- --port 4173 --strictPort

# Lighthouse (3 corridas, mediana)
npx --yes lighthouse@12 http://localhost:4173/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=docs/verificacion/perf/raw/desktop-1.json --chrome-flags="--headless=new --no-sandbox"
npx --yes lighthouse@12 http://localhost:4173/ --form-factor=mobile --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4 --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=docs/verificacion/perf/raw/mobile-1.json --chrome-flags="--headless=new --no-sandbox"

# Red y compresión reales
curl.exe -sI https://ideasycoloresgt.site/ | Select-String "HTTP/|content-encoding|cache-control|server"
curl.exe -s -o NUL -w "size_download=%{size_download} time_ttfb=%{time_starttransfer}`n" https://ideasycoloresgt.site/

# Producción: ¿build nuevo o viejo?
curl.exe -s https://ideasycoloresgt.site/ | Select-String "assets/index-.*\.(css|js)"
```

**Condiciones de medición:** misma máquina, sin builds ni Lighthouse en paralelo, 3 corridas, mediana, guardar JSON crudo y declarar flags. Separar siempre lab (Lighthouse) de field (CrUX/PSI); no prometer mejoras de campo antes de 28 días.
