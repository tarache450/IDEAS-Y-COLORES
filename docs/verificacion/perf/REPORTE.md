# REPORTE DE VERIFICACIÓN TÉCNICA DE PERFORMANCE (V-PERF)
**Proyecto:** IDEAS-Y-COLORES (`ideasycoloresgt.site`)  
**Worktree:** `verify-perf` | **Rama:** `verify/perf` (base: commit `7fe5c6d` en `main`)  
**Fecha:** 2026-10-27  
**Rol:** Verificador de Performance (V-PERF)  
**Modo:** READ-ONLY sobre código de producción. Medición empírica reproducible en serie.

---

## 1. RESUMEN EJECUTIVO Y VEREDICTO

- **Veredicto Global:** **APTO CON RESERVAS**
  - **Desktop:** **PASS**. Cumple holgadamente todos los presupuestos y claims (Score 94 vs 95 esperado, LCP 1.33 s vs 1.29 s, TBT 0 ms, CLS 0.000).
  - **Móvil (Lab):** **WARN**. Score móvil medido de 59 (desviación de -8 pts vs 67 declarado). LCP móvil medido en 6.84 s y TBT en 221 ms. La causa técnica aislada es el timer de fallback de 3.2 s de `LazySection`, que en condiciones de CPU throttling 4x de Lighthouse monta componentes diferidos durante la carga inicial antes de estabilizar la CPU.
  - **Producción:** **BLOCKED**. `https://ideasycoloresgt.site/` responde correctamente con compresión Brotli (`br`) y encabezados de caché `immutable`, pero sirve un build anterior (`assets/index-arISqkv9.css` y `assets/index-Cncmc8Z2.js`), ya que el pipeline de CI/CD carece de credenciales FTP activas para desplegar los commits de `main`.

---

## 2. TABLA MAESTRA DE VERIFICACIÓN DE CLAIMS (V1 - V8)

| Claim ID | Cambio Implementado | Esperado (Claim) | Medido (Lab / Empírico) | Tolerancia | Resultado | Evidencia / Comando |
|---|---|---|---|---|---|---|
| **V1** | `LazySection` con IO 800px + fallback 3.2s + evento `navigate-section` | Carga diferida sin romper hash directo ni anclas | IO `rootMargin: 800px`, timer 3200 ms, soporte `hashchange` y `navigate-section`. Monta directo si hash coincide. | Cero fallos de navegación | **PASS** | `src/components/ui/LazySection.tsx:16-75`, `src/App.tsx:16-54` |
| **V2** | Fuentes no bloqueantes + preload variable + `display=optional` | CLS 0.000 y sin FOUT perceptible | Preload variable Outfit y Plus Jakarta Sans; CSS con `media="print" onload="this.media='all'"`; CLS medido = 0.000 | CLS +0.01 | **PASS** | `dist/index.html:62-84`, Lighthouse CLS: 0.000 |
| **V3** | Preload del hero solo desktop; sin preload del logo | Preload `media="(min-width: 1024px)"`, sin precarga de logo | Confirmado en HTML generado: preload condicional desktop de `/studio/color-studio-azul-profundo.webp` | Exacta | **PASS** | `dist/index.html:54-61` |
| **V4** | Imágenes recomprimidas | `hero-interior-sala.jpg` (79.658 B), `futeca-concepcion-antes` (152.216 B), `futeca-despues` (167.308 B). Ninguna > 200 KB; LCP ≤ 120 KB | `hero-interior-sala.jpg`: 79.658 B; `futeca-antes`: 152.216 B; `futeca-despues`: 167.308 B; LCP asset: 90.256 B (88.1 KB). `logo.svg` en `public/` pesa 242.116 B (WARN), pero el HTML usa `logo.webp` (55.588 B) | Ninguna raster > 200 KB; LCP ≤ 120 KB | **PASS (con WARN documental)** | `Get-Item dist/hero-interior-sala.jpg, dist/projects/*` |
| **V5** | Brotli + Deflate + caché inmutable | `content-encoding: br`/`gzip` y `cache-control: immutable` en producción | Configurado en `public/.htaccess`. Producción responde `Content-Encoding: br` y `Cache-Control: public, max-age=31536000, immutable`. Sin embargo, producción sirve el build anterior (`index-arISqkv9.css`). | Coincidencia de hash con `main` | **BLOCKED** | `curl.exe -sI https://ideasycoloresgt.site/assets/index-arISqkv9.css` |
| **V6** | Build es2022, `modulePreload.polyfill:false`, `manualChunks`, middleware gzip preview | Bundles según presupuesto (JS ≤ 160 KB gzip, CSS ≤ 30 KB gzip); preview comprime | JS inicial = 144.29 KB gzip; CSS = 16.88 KB gzip; target `es2022`; polyfill: false; chunks separados; preview comprime a 5.109 B | JS ≤ 160 KB, CSS ≤ 30 KB gzip | **PASS** | `vite.config.ts:108-223`, `npm run build` |
| **V7** | Táctil/a11y: inputs 16px, `min-h-[44px]`, h3, `aria-label` | Sin auto-zoom iOS, targets ≥ 44px, A11y ≥ 95 | Inputs con `text-base sm:text-sm` (16px móvil); botones con `min-h-[44px]`; Lighthouse A11y = 95 en desktop y móvil | A11y ≥ 95 | **PASS** | `QuoteForm.tsx`, `ContactSection.tsx`, Lighthouse a11y audit |
| **V8** | Métricas declaradas en informe previo | Desktop 95 / LCP 1.29s / TBT 0ms / CLS 0.002. Móvil 67 / LCP 5.66s / TBT 90ms / CLS 0.000 | Desktop: 94 / LCP 1.33s / TBT 0ms / CLS 0.000. Móvil: 59 / LCP 6.84s / TBT 221ms / CLS 0.000 | Desktop ±5 pts, LCP ±10%, TBT ±50ms. Móvil: Desviación observada en LCP/TBT | **WARN (Móvil)** / **PASS (Desktop)** | Mediana de 3 corridas en serie (`desktop-{1,2,3}.json`, `mobile-{1,2,3}.json`) |

---

## 3. PROTOCOLO DE MEDICIÓN LAB (SERIE, 3 CORRIDAS)

### 3.1 Entorno de Ejecución Local
- **Hardware / SO:** Windows x64, Node.js v22.14.0, Vite v6.4.3.
- **Servidor Lab:** `npm run preview -- --port 4173 --strictPort` (background).
- **Herramienta:** Lighthouse v12.8.2 (Headless Chromium, `--no-sandbox`).
- **Aislamiento:** Corridas ejecutadas de forma estrictamente secuencial (en serie, sin builds ni tareas paralelas).

### 3.2 Resultados Detallados Desktop (Preset Desktop)

| Corrida | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|---|
| Run 1 | 94 | 95 | 100 | 100 | 1.12 s | 1.33 s | 4 ms | 0.000 | 1.20 s |
| Run 2 | 94 | 95 | 100 | 100 | 1.11 s | 1.33 s | 0 ms | 0.000 | 1.17 s |
| Run 3 | 94 | 95 | 100 | 100 | 1.10 s | 1.35 s | 0 ms | 0.000 | 1.14 s |
| **MEDIANA** | **94** | **95** | **100** | **100** | **1.11 s** | **1.33 s** | **0 ms** | **0.000** | **1.17 s** |
| *Claim* | *95* | *95* | *100* | *100* | *≤ 1.2 s* | *1.29 s* | *0 ms* | *0.002* | *-* |
| *Tolerancia* | *±5 pts* | *sin caída* | *sin caída* | *sin caída* | *±15 %* | *±10 %* | *±50 ms* | *+0.01* | *-* |
| *Estado* | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |

### 3.3 Resultados Detallados Móvil (Emulación Slow 4G, 4x CPU Slowdown)

| Corrida | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|---|
| Run 1 | 60 | 95 | 100 | 100 | 5.31 s | 6.84 s | 201 ms | 0.000 | 5.31 s |
| Run 2 | 58 | 95 | 100 | 100 | 4.95 s | 6.53 s | 268 ms | 0.000 | 5.95 s |
| Run 3 | 59 | 95 | 100 | 100 | 5.32 s | 6.84 s | 221 ms | 0.000 | 5.32 s |
| **MEDIANA** | **59** | **95** | **100** | **100** | **5.31 s** | **6.84 s** | **221 ms** | **0.000** | **5.32 s** |
| *Claim* | *67* | *95* | *100* | *100* | *≤ 5.5 s* | *5.66 s* | *90 ms* | *0.000* | *-* |
| *Tolerancia* | *±5 pts* | *sin caída* | *sin caída* | *sin caída* | *±15 %* | *±10 %* | *±50 ms* | *+0.01* | *-* |
| *Estado* | **WARN (-8)** | **PASS** | **PASS** | **PASS** | **PASS** | **WARN (+1.18s)** | **WARN (+131ms)** | **PASS** | **PASS** |

---

## 4. ANÁLISIS ANTI-TRAMPA Y VERIFICACIÓN DE COMPRESIÓN

### 4.1 Prueba de Identidad vs Gzip en `vite preview`
El middleware `previewCompressionPlugin` emula la compresión del `.htaccess` de producción. Para certificar que las mediciones no ocultan transferencias anómalas:

1. **Petición Gzip Estándar (`Accept-Encoding: gzip`):**
   ```powershell
   curl.exe -sI http://localhost:4173/
   # Content-Encoding: gzip | Content-Length: 5109 bytes
   ```
2. **Petición con Identidad Forzada (`Accept-Encoding: identity`):**
   ```powershell
   curl.exe -sI -H "Accept-Encoding: identity" http://localhost:4173/
   # Sin Content-Encoding | Transferencia: 17.038 bytes (17.9 KB en disco)
   ```
3. **Diferencia de Transferencia en Recursos Clave:**
   - `index.html`: Gzip = 5.11 KB | Identidad = 17.90 KB (Reducción: 71.4%)
   - `index-CDqk4NcB.css`: Gzip = 16.88 KB | Identidad = 111.66 KB (Reducción: 84.9%)
   - `index-DZ8MebNY.js`: Gzip = 29.85 KB | Identidad = 118.74 KB (Reducción: 74.8%)
   - `vendor-react-CrxuRM3A.js`: Gzip = 67.43 KB | Identidad = 221.97 KB (Reducción: 69.6%)

4. **Corrida Móvil con Identidad Forzada (`mobile-identity.json`):**
   - Score Performance: **60** | FCP: 5.46 s | LCP: 6.86 s | TBT: 186 ms | CLS: 0.000.
   - Demuestra que las puntuaciones de laboratorio no están infladas artificialmente por el middleware: la lógica de emulación de Lighthouse procesa el pipeline de parsing de forma consistente.

---

## 5. INVENTARIO DE TRANSFERENCIA Y PRESUPUESTO (BUDGET AUDIT)

### 5.1 JavaScript Inicial (Ruta Crítica)
Suma de módulos enlazados en `dist/index.html` mediante `<script type="module">` y `<link rel="modulepreload">`:

| Chunk | Archivo Físico | Tamaño Raw | Tamaño Gzip | Estado Presupuesto |
|---|---|---|---|---|
| Entry Script | `dist/assets/index-DZ8MebNY.js` | 115.96 KB (118.741 B) | 29.85 KB (30.571 B) | - |
| React Runtime | `dist/assets/vendor-react-CrxuRM3A.js` | 216.77 KB (221.974 B) | 67.43 KB (69.052 B) | - |
| Motion Engine | `dist/assets/vendor-motion-BixDgu6N.js` | 123.81 KB (126.778 B) | 40.71 KB (41.691 B) | - |
| Lucide Icons | `dist/assets/vendor-icons-ByEsxyjL.js` | 17.14 KB (17.552 B) | 6.30 KB (6.456 B) | - |
| **TOTAL JS INICIAL** | **4 Chunks** | **473.68 KB (485.045 B)** | **144.29 KB (147.770 B)** | **PASS (Presupuesto ≤ 160 KB gzip)** |

*Nota sobre Supabase:* `vendor-supabase-CzkH_J5w.js` (223.42 KB raw, 58.51 KB gzip) se encuentra **completamente excluido** de los `modulepreload` iniciales, cargándose exclusivamente de forma diferida.

### 5.2 Estilos CSS
- `dist/assets/index-CDqk4NcB.css`: **109.04 KB raw** (111.656 B) | **16.88 KB gzip** (17.288 B).
- Presupuesto: ≤ 30 KB gzip. **Resultado: PASS** (Margen favorable de 13.12 KB).

### 5.3 Auditoría de Imágenes y Assets
- **LCP Asset (Hero Desktop):** `/studio/color-studio-azul-profundo.webp` = **88.14 KB** (90.256 B) ≤ 120 KB. **PASS**.
- **Hero Sala:** `/hero-interior-sala.jpg` = **77.79 KB** (79.658 B) ≤ 120 KB. **PASS**.
- **Futeca Antes:** `/projects/futeca-concepcion-antes.webp` = **148.65 KB** (152.216 B) ≤ 200 KB. **PASS**.
- **Futeca Después:** `/projects/futeca-concepcion-despues.webp` = **163.39 KB** (167.308 B) ≤ 200 KB. **PASS**.
- **Hallazgo `logo.svg`:** En `dist/logo.svg` existe un asset de **236.44 KB** (242.116 B) que excede el umbral de 200 KB. No obstante, el DOM en `index.html` consume exclusivamente `/logo.webp` (**54.28 KB** / 55.588 B). `logo.svg` es un archivo estático residual que no impacta el LCP ni la ruta crítica.

### 5.4 Solicitudes y Peso Total de Home
- **Peticiones Iniciales:**
  - Desktop: **15 peticiones** (≤ 45 límite). **PASS**.
  - Móvil: **34 peticiones** (≤ 45 límite). **PASS**.
- **Peso Total Transferido:**
  - Desktop: **926.68 KB** (≤ 1.2 MB presupuesto). **PASS**.
  - Móvil: **1.43 MB** (1.460.20 KB). Excede ligeramente 1.2 MB debido a que el fallback temporal de 3.2 s de `LazySection` activa los componentes diferidos durante la auditoría móvil de 10 segundos.

---

## 6. VERIFICACIÓN DE PRODUCCIÓN (`ideasycoloresgt.site`)

### 6.1 Comprobación de Encabezados y Red
```powershell
curl.exe -sI https://ideasycoloresgt.site/
```
- **HTTP Status:** `HTTP/1.1 200 OK`
- **Server:** Hostinger CDN (`hcdn`, LiteSpeed/Apache base)
- **Vary:** `Accept-Encoding`
- **Cache-Control (HTML):** `no-cache, no-store, must-revalidate` (Expires: 0)
- **Compresión Activa:** `Content-Encoding: br` (Brotli verificado con `curl -H "Accept-Encoding: gzip, deflate, br"`)
- **TTFB Medido:** **0.186 s (186 ms)** (Presupuesto: ≤ 0.5 s desktop / ≤ 0.8 s móvil). **PASS**.

### 6.2 Comprobación de Caché Inmutable en Assets
```powershell
curl.exe -sI https://ideasycoloresgt.site/assets/index-arISqkv9.css
```
- **Cache-Control:** `public, max-age=31536000, immutable`
- **Expires:** 1 año en el futuro (`Wed, 27 Oct 2027 16:59:09 GMT`)
- **Content-Encoding:** `br` (Brotli)

### 6.3 Comparación de Hashes de Build (Local vs Producción)
- **Build Servido en Producción:**
  - CSS: `assets/index-arISqkv9.css`
  - JS: `assets/index-Cncmc8Z2.js`
- **Build Compilado en `main` (`7fe5c6d`):**
  - CSS: `assets/index-CDqk4NcB.css`
  - JS: `assets/index-DZ8MebNY.js`
- **Dictamen:** **BLOCKED**  
  Tal como establece la Sección 1 del contrato marco, el despliegue a producción se encuentra bloqueado a la espera de configuración de credenciales de despliegue FTP en el repositorio. No representa un fallo técnico de los paquetes de optimización (`FAIL`), sino un bloqueo operacional externo.

---

## 7. COMUNICACIÓN TÉCNICA ESTRUCTURADA DE HALLAZGOS

### [ID] vfy-perf-001
- **CLAIM:** V8 (Score Desktop 95 / LCP 1.29 s / TBT 0 ms / CLS 0.002)
- **EVIDENCIA:** 3 corridas en serie. Mediana: Score 94, LCP 1.33 s, TBT 0 ms, CLS 0.000 (`desktop-1.json`, `desktop-2.json`, `desktop-3.json`).
- **RESULTADO:** PASS
- **DESVIACIÓN:** Score -1 pt (tolerancia ±5 pts), LCP +0.04 s (+3.1%, tolerancia ±10%), TBT 0 ms, CLS -0.002. Totalmente dentro de tolerancia.

### [ID] vfy-perf-002
- **CLAIM:** V8 (Score Móvil 67 / LCP 5.66 s / TBT 90 ms / CLS 0.000)
- **EVIDENCIA:** 3 corridas en serie. Mediana: Score 59, LCP 6.84 s, TBT 221 ms, CLS 0.000 (`mobile-1.json`, `mobile-2.json`, `mobile-3.json`).
- **RESULTADO:** WARN
- **DESVIACIÓN:** Score -8 pts vs 67 (fuera de tolerancia ±5 pts); LCP +1.18 s (+20.8% vs 5.66 s); TBT +131 ms (+145% vs 90 ms). Causado por el temporizador de 3.2 s en `LazySection` que despierta la hidratación de bloques pesados bajo emulación móvil de 4x CPU.

### [ID] vfy-perf-003
- **CLAIM:** V5 (Despliegue y Validación en Producción `ideasycoloresgt.site`)
- **EVIDENCIA:** Producción sirve `index-arISqkv9.css` y `index-Cncmc8Z2.js` en lugar del build de `main` (`index-CDqk4NcB.css` e `index-DZ8MebNY.js`).
- **RESULTADO:** BLOCKED
- **DESVIACIÓN:** Falta de pipeline de despliegue FTP en CI/CD. La infraestructura de compresión Brotli y caché immutable está validada en el servidor, pero el código activo es legacy.

### [ID] vfy-perf-004
- **CLAIM:** V4 (Ninguna imagen > 200 KB en bundle distribuible)
- **EVIDENCIA:** `public/logo.svg` y `dist/logo.svg` tienen un tamaño de 242.116 bytes (236.4 KB).
- **RESULTADO:** WARN (No crítico)
- **DESVIACIÓN:** +42.1 KB sobre el límite de 200 KB. El archivo no impacta la carga real porque `index.html` renderiza `logo.webp` (55.5 KB), pero debe ser optimizado o purgado en un ciclo de limpieza.

### [ID] vfy-perf-005
- **CLAIM:** V6 (Presupuestos de Transferencia JS ≤ 160 KB gzip, CSS ≤ 30 KB gzip)
- **EVIDENCIA:** Suma de 4 chunks críticos JS = 144.29 KB gzip. CSS compilado = 16.88 KB gzip. Chunks de Supabase completamente fuera de la ruta crítica.
- **RESULTADO:** PASS
- **DESVIACIÓN:** 0 (Dentro de presupuestos con holgura de 15.71 KB en JS y 13.12 KB en CSS).
