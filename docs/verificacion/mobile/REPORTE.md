# REPORTE DE VERIFICACIÓN MÓVIL Y ACCESIBILIDAD (V-MOBILE)
### IDEAS-Y-COLORES · ideasycoloresgt.site · Worktree `verify-mobile` · Rama `verify/mobile`

- **Fecha:** 2026-10-27
- **Commit analizado:** `7fe5c6d`
- **Ambiente de prueba:** Local (`http://localhost:4174/`) compilado con `npm run build` y servido mediante preview con compresión emulada.
- **Herramientas:** Lighthouse 12.8.2 (Chromium headless `Chrome 135+`), Puppeteer Core con Chrome nativo (`C:\Program Files\Google\Chrome\Application\chrome.exe`), Node.js v24.20.0.
- **Condición de ejecución:** 3 corridas Lighthouse en serie sin procesos concurrentes de build ni Lighthouse en la máquina.

---

## 1. RESUMEN EJECUTIVO Y VEREDICTO

| Categoría | Estado | Veredicto |
|---|---|---|
| **Lighthouse Mobile (Slow 4G / 4x CPU)** | Mediana: Perf 57 · LCP 6.55s · TBT 282ms · CLS 0.000 · A11y 95 · BP 100 · SEO 100 | **WARN** (Perf y TBT desviados vs claim 67 / 90ms) |
| **Viewports & Responsive (10 viewports)** | Cero overflow horizontal, cero textos cortados, drawer y sticky funcionales | **PASS** |
| **Regresión Crítica LazySection (P1)** | Carga directa 7 anclas, navegación `navigate-section`, CLS scroll 0.0005 | **PASS** |
| **Táctil & Ergonomía (V7)** | Auto-zoom iOS por inputs `text-xs` (12px), tap targets < 44px en paletas/footer | **FAIL (P2)** |
| **Accesibilidad (A11y)** | H1 único, foco visible, pero salto en orden de encabezados (H2 a H4) y contraste bajo en 3 elementos | **FAIL (P2)** |
| **Tipografía & Fuentes (V2)** | Preloads 200 OK, `display=optional` activo, fallback legible y sin CLS | **PASS** |

**VEREDICTO GLOBAL MÓVIL:** **APTO CON RESERVAS**
- Las funcionalidades críticas (LazySection, anclas, responsive, drawer, CLS 0.000, preloads) están en **PASS**.
- Se reportan **FAILs de severidad P2** (no bloqueantes P0/P1) con sus respectivos fixes propuestos para inputs móviles de 12px, saltos de jerarquía en encabezados y contraste en modo oscuro.

---

## 2. AUDITORÍA LIGHTHOUSE MÓVIL (3 CORRIDAS EN SERIE)

**Configuración:** `--form-factor=mobile --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4 --screenEmulation.mobile` sobre puerto 4174.

| Métrica | Corrida 1 | Corrida 2 | Corrida 3 | **Mediana** | **Claim Esperado** | **Tolerancia** | **Resultado** |
|---|---|---|---|---|---|---|---|
| **Performance** | 60 | 57 | 53 | **57** | 67 | ±5 pts (62–72) | **WARN** (-10 pts) |
| **LCP** | 6.55 s | 6.52 s | 6.56 s | **6.55 s** | 5.66 s | ±10% (≤6.23s) / ≤6.5s | **WARN** (+0.89s) |
| **TBT** | 239 ms | 282 ms | 376 ms | **282 ms** | 90 ms | ±50 ms (≤140ms) / ≤200ms | **WARN** (+192ms) |
| **CLS** | 0.000 | 0.000 | 0.000 | **0.000** | 0.000 | +0.01 (≤0.05) | **PASS** (0.000) |
| **FCP** | 5.05 s | 4.95 s | 5.13 s | **5.05 s** | 5.5 s | ±15% (≤6.3s) | **PASS** |
| **Accessibility** | 95 | 95 | 95 | **95** | 95 | Sin caída | **PASS** |
| **Best Practices**| 100 | 100 | 100 | **100** | 100 | Sin caída | **PASS** |
| **SEO** | 100 | 100 | 100 | **100** | 100 | Sin caída | **PASS** |

*Evidencia cruda:* `docs/verificacion/mobile/raw/mobile-{1,2,3}.json`

---

## 3. AUDITORÍA DE VIEWPORTS Y LAYOUT RESPONSIVE

Se ejecutó inspección automatizada en los 10 viewports estipulados validando `document.documentElement.scrollWidth > clientWidth`, elementos con coordenadas fuera del viewport, colapso de sticky header, drawer móvil y truncamiento de textos.

| Viewport | DPR | Scroll Horiz. | Overflow Elementos | Sticky Header | Drawer Móvil | Textos Cortados | Captura | Resultado |
|---|---|---|---|---|---|---|---|---|
| **320×568** | 2 | NO (320px) | 0 reales (blobs con `pointer-events-none`) | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-320x568-hero.png` | **PASS** |
| **360×640** | 3 | NO (360px) | 0 reales | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-360x640-hero.png` | **PASS** |
| **375×667** | 2 | NO (375px) | 0 reales | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-375x667-hero.png` | **PASS** |
| **390×844** | 3 | NO (390px) | 0 reales | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-390x844-hero.png` | **PASS** |
| **430×932** | 3 | NO (430px) | 0 reales | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-430x932-hero.png` | **PASS** |
| **768×1024** | 2 | NO (768px) | 0 reales | `sticky` (top 0px, z-40) | OPENED_OK | 0 | `docs/verificacion/mobile/capturas/vp-768x1024-hero.png` | **PASS** |
| **1024×768** | 2 | NO (1024px)| 0 | `sticky` (top 0px, z-40) | N/A (Desktop nav) | 0 | `docs/verificacion/mobile/capturas/vp-1024x768-hero.png` | **PASS** |
| **1280×800** | 2 | NO (1280px)| 0 | `sticky` (top 0px, z-40) | N/A (Desktop nav) | 0 | `docs/verificacion/mobile/capturas/vp-1280x800-hero.png` | **PASS** |
| **1440×900** | 2 | NO (1440px)| 0 | `sticky` (top 0px, z-40) | N/A (Desktop nav) | 0 | `docs/verificacion/mobile/capturas/vp-1440x900-hero.png` | **PASS** |
| **1920×1080**| 2 | NO (1920px)| 0 | `sticky` (top 0px, z-40) | N/A (Desktop nav) | 0 | `docs/verificacion/mobile/capturas/vp-1920x1080-hero.png` | **PASS** |

---

## 4. REGRESIÓN CRÍTICA DE LAZYSECTION (V1)

Se comprobó que el empaquetado y la carga diferida con `IntersectionObserver (800px)` y fallback de 3.2s no rompen el acceso directo ni la navegación por hash:

### 4.1 Carga directa con Hash (`http://localhost:4174/#<id>`)
Verificado que la sección monta inmediatamente sin depender del observer cuando la URL contiene el hash:

| Ancla | Inmediato (`aria-busy`) | Montado < 1s | Alto final | HTML length | Captura | Resultado |
|---|---|---|---|---|---|---|
| `#servicios` | `true` (skeleton) | Sí (850 ms) | 760 px | 24,454 B | `docs/verificacion/mobile/capturas/hash-servicios.png` | **PASS** |
| `#proyectos` | `true` (skeleton) | Sí (523 ms) | 760 px | 48,035 B | `docs/verificacion/mobile/capturas/hash-proyectos.png` | **PASS** |
| `#cotizar` | `true` (skeleton) | Sí (528 ms) | 760 px | 16,211 B | `docs/verificacion/mobile/capturas/hash-cotizar.png` | **PASS** |
| `#contacto` | `true` (skeleton) | Sí (529 ms) | 760 px | 15,590 B | `docs/verificacion/mobile/capturas/hash-contacto.png` | **PASS** |
| `#faq` | `true` (skeleton) | Sí (530 ms) | 760 px | 14,614 B | `docs/verificacion/mobile/capturas/hash-faq.png` | **PASS** |
| `#estudio-color` | `true` (skeleton) | Sí (539 ms) | 760 px | 22,647 B | `docs/verificacion/mobile/capturas/hash-estudio-color.png` | **PASS** |
| `#calculadora` | `true` (skeleton) | Sí (528 ms) | 760 px | 12,478 B | `docs/verificacion/mobile/capturas/hash-calculadora.png` | **PASS** |

### 4.2 Navegación interna (`navigate-section`)
Se emitió el evento personalizado `window.dispatchEvent(new CustomEvent('navigate-section', { detail: id }))`:
- Las 7 anclas reaccionaron forzando el montaje del componente y desplazando el viewport con un offset limpio de 80px (para el header fijo).
- Todas las secciones quedaron completamente hidratadas con `aria-busy` removido.
- Evidencia gráfica: `docs/verificacion/mobile/capturas/nav-event-*.png`. Resultado: **PASS**.

### 4.3 CLS durante scroll completo
- Medición continua de `PerformanceObserver ({ type: 'layout-shift', buffered: true })` durante scroll completo progresivo (0 a 100%):
  - **CLS Acumulado medido:** `0.00054` (Tolerancia: ≤ 0.05).
  - Los contenedores skeleton con `minHeight` previenen cualquier salto visual en la hidratación tardía. Resultado: **PASS**.

---

## 5. REVISIÓN TÁCTIL, TECLADO Y ERGONOMÍA (V7)

### 5.1 Inputs y prevención de Auto-Zoom en iOS
En dispositivos iOS (iPhone Safari), cualquier elemento `input` o `textarea` con `font-size < 16px` fuerza al navegador a realizar un zoom automático que descoloca la interfaz.

- **Total inputs evaluados:** 7 en formulario principal y contacto.
- **Inputs con `font-size >= 16px` (PASS):** 5
- **Inputs con `font-size < 16px` (FAIL):** 2 encontrados en el DOM inicial:
  1. `src/components/ContactSection.tsx:316`: `input[name="phone"]` con clase `text-xs sm:text-sm` (computa a **12px** en pantallas móviles).
  2. `src/components/QuoteForm.tsx:801, 818, 835`: `input[name="phone"]`, `input[name="email"]`, `input[name="location"]` con clase `text-xs sm:text-sm` (computan a **12px** en pantallas móviles).

### 5.2 Objetivos táctiles (Tap Targets >= 44×44 px)
- **WhatsApp Flotante (`FloatingWhatsApp.tsx`):**
  - Dimensiones del trigger principal: `56×56 px` (`w-14 h-14`). **PASS**.
  - Área de toque y botón de cierre táctil en drawer: `44×44 px` efectivos. **PASS**.
- **Dock de Color Flotante (`FloatingColorDock.tsx`):** Operable en móvil, integrado al fondo. **PASS**.
- **Slider Antes/Después (`BeforeAfterSlider.tsx`):**
  - Manejador de eventos táctiles con `onTouchStart`, `onTouchMove` y propiedad CSS `touchAction: 'pan-y'`.
  - Roles ARIA: `role="slider"`, `aria-valuenow`, soporte para teclas flechas, Home y End. **PASS**.
- **Elementos con Tap Target < 44 px detectados (WARN):**
  - Botones de selección de tono en `MoodColorPicker` / `ColorStudioVisualizer`: `h-9` (36 px) y `px-2.5 py-1` (24 px).
  - Enlaces de texto del footer: `16 px` de alto sin padding de toque extendido.
  - Botón Staff CRM en footer: `15 px` de alto.

---

## 6. ACCESIBILIDAD (A11Y - WCAG 2.1 AA)

### 6.1 Encabezados y Estructura Semántica
- **H1 único:** **PASS**. Exactamente 1 elemento `H1` en toda la página (`"Color que transforma espacios."`).
- **Jerarquía de Encabezados (FAIL):**
  - Se detectaron saltos de nivel (`H2` directo a `H4` sin pasar por `H3`):
    - `src/components/Footer.tsx:143`: `<h4>NAVEGACIÓN</h4>`, `<h4>SERVICIOS</h4>`, `<h4>CONTACTO</h4>` están precedidos por `H2` de secciones superiores sin ningún `H3` intermedio en el bloque.
    - `src/components/FAQSection.tsx:166`: Títulos de tarjetas secundarias marcados como `H4`.
  - Este salto fue el causante principal de la penalización en Lighthouse (`heading-order: score 0`).

### 6.2 Contraste de Color (WCAG AA 4.5:1)
Se identificaron 3 elementos con ratio de contraste insuficiente en modo oscuro:
1. `src/components/BentoTrustGrid.tsx`: Botón "Solicitar visita técnica" (`#0059ff` sobre `#020618` → ratio 3.71:1, esperado 4.5:1).
2. `src/components/ServicesSection.tsx`: `span.text-xs` (`#90a1b9` sobre fondo blanco `#ffffff` → ratio 2.63:1, esperado 4.5:1).
3. `src/components/Footer.tsx:210`: Botón `🔒 Staff CRM` (`#45556c` sobre `#020618` → ratio 2.65:1, esperado 4.5:1).

### 6.3 Foco Visible y Reduced Motion
- `:focus-visible` activo con outline azul 2px y ring visible (`src/index.css:32`). **PASS**.
- `prefers-reduced-motion` contemplado en animaciones de Tailwind y CSS. **PASS**.

---

## 7. VERIFICACIÓN DE TIPOGRAFÍAS Y FUENTES (V2)

1. **Preload de fuentes:**
   - `https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtq.woff2` → **HTTP 200 OK** (32.2 KB, max-age=31536000).
   - `https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2` → **HTTP 200 OK** (27.3 KB, max-age=31536000).
2. **`display=optional`:**
   - Presente en `index.html:85` y `index.html:92`.
   - Evita FOUT o flashes de texto con retrasos de red móvil.
3. **Comportamiento del Fallback del H1:**
   - Se probó bloqueando el dominio de fuentes de Google en emulador móvil.
   - El H1 utiliza el stack del sistema (`Outfit, Plus Jakarta Sans, sans-serif`) ocupando exactamente el mismo layout (`fontSize: 36px`, `lineHeight: 37.4px`), sin desbordes de palabra ni saltos de línea adicionales.
   - Evidencia: `docs/verificacion/mobile/capturas/h1-system-fallback.png`. **PASS**.

---

## 8. HALLAZGOS Y FIXES PROPUESTOS (SIN APLICAR - READ-ONLY)

A continuación se listan los defectos encontrados con su archivo, línea y código de solución propuesto para el equipo de implementación (`verify-ui` / ticket del Coordinador):

### FINDING 1 · Inputs móviles con tamaño menor a 16px (Auto-zoom iOS)
- **Severidad:** Media (UX móvil)
- **Archivos:**
  - `src/components/ContactSection.tsx:316`
  - `src/components/QuoteForm.tsx:801, 818, 835`
- **Diagnóstico:** Los inputs tienen `className="... text-xs sm:text-sm ..."` lo que asigna `12px` en pantallas menores a 640px. Al tocar el input en iPhone Safari, la pantalla hace zoom involuntario.
- **Fix propuesto:**
  Reemplazar la clase `text-xs sm:text-sm` por `text-base sm:text-sm` (o `text-[16px] sm:text-sm`) en los inputs correspondientes para mantener 16px en móvil y 14px en desktop.

### FINDING 2 · Salto de orden jerárquico de encabezados (A11y `heading-order`)
- **Severidad:** Baja (A11y score)
- **Archivos:**
  - `src/components/Footer.tsx:143, 168, 192`
  - `src/components/FAQSection.tsx:166`
- **Diagnóstico:** Se usan etiquetas `<h4>` directamente bajo secciones que terminaron en `<h2>`, omitiendo el nivel `<h3>`.
- **Fix propuesto:**
  En `Footer.tsx`, cambiar las etiquetas `<h4>` de las columnas ("NAVEGACIÓN", "SERVICIOS", "CONTACTO") a `<h3>` o a `<p className="font-bold text-xs uppercase ...">` con aria-label si no representan una nueva sección del documento.

### FINDING 3 · Contraste insuficiente en textos y botones oscuros
- **Severidad:** Baja (WCAG AA)
- **Archivos:**
  - `src/components/BentoTrustGrid.tsx:112`: texto azul sobre fondo oscuro `#020618`. Cambiar de `text-blue-600` a `text-blue-400` para alcanzar ratio > 4.5:1.
  - `src/components/ServicesSection.tsx:128`: `text-slate-400` sobre blanco. Cambiar a `text-slate-600` para alcanzar ratio 4.5:1.
  - `src/components/Footer.tsx:210`: `text-slate-600` en botón Staff CRM sobre `#020618`. Cambiar a `text-slate-400`.

---

## 9. MATRIZ FORMAL DE REGISTRO

```
[VFY-MOB-001]/LIGHTHOUSE/docs/verificacion/mobile/raw/mobile-{1,2,3}.json/WARN/Perf: 57 vs 67 (-10 pts), LCP: 6.55s vs 5.66s (+0.89s), TBT: 282ms vs 90ms (+192ms), CLS: 0.000 (PASS)
[VFY-MOB-002]/320x568/docs/verificacion/mobile/capturas/vp-320x568-hero.png/PASS/scrollWidth=320, sin overflow, drawer abre OK
[VFY-MOB-003]/360x640/docs/verificacion/mobile/capturas/vp-360x640-hero.png/PASS/scrollWidth=360, sin overflow, drawer abre OK
[VFY-MOB-004]/375x667/docs/verificacion/mobile/capturas/vp-375x667-hero.png/PASS/scrollWidth=375, sin overflow, drawer abre OK
[VFY-MOB-005]/390x844/docs/verificacion/mobile/capturas/vp-390x844-hero.png/PASS/scrollWidth=390, sin overflow, drawer abre OK
[VFY-MOB-006]/430x932/docs/verificacion/mobile/capturas/vp-430x932-hero.png/PASS/scrollWidth=430, sin overflow, drawer abre OK
[VFY-MOB-007]/768x1024/docs/verificacion/mobile/capturas/vp-768x1024-hero.png/PASS/scrollWidth=768, sin overflow, drawer abre OK
[VFY-MOB-008]/1024x768/docs/verificacion/mobile/capturas/vp-1024x768-hero.png/PASS/scrollWidth=1024, sin overflow, sticky OK
[VFY-MOB-009]/1280x800/docs/verificacion/mobile/capturas/vp-1280x800-hero.png/PASS/scrollWidth=1280, sin overflow, sticky OK
[VFY-MOB-010]/1440x900/docs/verificacion/mobile/capturas/vp-1440x900-hero.png/PASS/scrollWidth=1440, sin overflow, sticky OK
[VFY-MOB-011]/1920x1080/docs/verificacion/mobile/capturas/vp-1920x1080-hero.png/PASS/scrollWidth=1920, sin overflow, sticky OK
[VFY-MOB-012]/LAZY-HASH/docs/verificacion/mobile/capturas/hash-*.png/PASS/7 anclas montan de inmediato con hash (520ms-850ms)
[VFY-MOB-013]/LAZY-NAV/docs/verificacion/mobile/capturas/nav-event-*.png/PASS/navigate-section activa LazySection y scroll con offset 80px
[VFY-MOB-014]/SCROLL-CLS/docs/verificacion/mobile/raw/lazysection-result.json/PASS/CLS acumulado medido 0.0005 durante scroll 0-100%
[VFY-MOB-015]/TOUCH-INPUTS/src/components/ContactSection.tsx:316/FAIL/input phone a 12px (text-xs) provoca zoom en iOS Safari
[VFY-MOB-016]/A11Y-HEADINGS/src/components/Footer.tsx:143/FAIL/salto H2 a H4 sin H3 intermedio en footer
[VFY-MOB-017]/FONTS-PRELOAD/index.html:69,76/PASS/ambas fuentes responden HTTP 200 OK y display=optional activo
```
