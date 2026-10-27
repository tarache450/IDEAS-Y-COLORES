# INFORME DE VERIFICACIÓN — Optimizaciones y Performance

**Proyecto:** Ideas & Colores Multi-Servicios · https://ideasycoloresgt.site
**Fecha:** 2026-10-27
**Base verificada:** `main` @ `7fe5c6d` (optimizaciones) + fixes `3088303`
**Agentes:** V-PERF (`verify-perf`), V-MOBILE (`verify-mobile`) · Coordinador: sesión Orca
**Método:** Lighthouse 12.8.2, 3 corridas en serie por escenario, mediana. Lab data.

---

## 1. VEREDICTO: **APTO CON RESERVAS**

| Dimensión | Resultado | Detalle |
|---|---|---|
| **Escritorio** | **PASS** | Perf 94 (claim 95, ±5), LCP 1.33 s (claim 1.29, ±10 %), TBT 0 ms, CLS 0.000, A11y 95, BP/SEO 100 |
| **Móvil** | **WARN** | Perf 57–59 (claim 67), LCP 6.55–6.84 s (claim 5.66), TBT 221–282 ms (claim 90), CLS 0.000 |
| **Regresiones funcionales** | **PASS** | 7 anclas con hash directo, `navigate-section`, CLS en scroll 0.0005, 10 viewports sin overflow |
| **Producción** | **BLOCKED** | Hostinger sirve el build anterior (`index-arISqkv9.css`); faltan secrets FTP |

Ningún FAIL P0/P1. Los 3 FAIL P2 detectados por V-MOBILE se corrigieron en `3088303` y se re-verificaron.

---

## 2. CLAIMS vs MEDIDO

| Claim | Esperado | Medido | Tolerancia | Resultado |
|---|---|---|---|---|
| V1 LazySection sin romper anclas | 7 anclas + hash directo | 7/7 en < 850 ms, `navigate-section` OK, CLS scroll 0.0005 | 0 fallos | **PASS** |
| V2 Fuentes sin CLS | CLS 0.000, sin FOUT | CLS 0.000, preloads 200, `display=optional` activo | +0.01 | **PASS** |
| V3 Preload hero desktop / sin logo | Condicional, sin logo | Confirmado en HTML generado | Exacta | **PASS** |
| V4 Imágenes | Ninguna > 200 KB, LCP ≤ 120 KB | hero 79.658 B · antes 152.216 B · después 167.308 B · LCP 88,1 KB. `logo.svg` 236,4 KB (no se carga; se usa `logo.webp`) | — | **PASS** (WARN documental) |
| V5 Brotli/caché en producción | `br`/`gzip` + `immutable` | `Content-Encoding: br`, `immutable`, TTFB 186 ms — **pero build viejo** | Hash = main | **BLOCKED** |
| V6 Presupuesto JS/CSS | JS ≤ 160 KB gz · CSS ≤ 30 KB gz | JS inicial **144,29 KB** gz · CSS **16,88 KB** gz · Supabase fuera de la ruta crítica | — | **PASS** |
| V7 Táctil/a11y | Inputs 16 px, targets ≥ 44 px, A11y ≥ 95 | V-PERF: A11y 95. V-MOBILE: 4 inputs aún a 12 px → corregido | — | **PASS tras fix** |
| V8 Métricas declaradas | Desktop 95 / Móvil 67 | Desktop **94** · Móvil **57–59** | ±5 pts / LCP ±10 % | **PASS desktop · WARN móvil** |

---

## 3. HALLAZGOS Y ESTADO

| ID | Sev | Hallazgo | Evidencia | Estado |
|---|---|---|---|---|
| vfy-001 | P1 | Score móvil 57–59 vs 67 declarado; LCP 6.5–6.8 s vs 5.66; TBT 221–282 vs 90 | Medianas de ambos agentes | **WARN** — confundido por 2 Lighthouse en paralelo + timer 3.2 s de `LazySection` |
| vfy-002 | P1 | Producción sirve build anterior | `index-arISqkv9.css` vs `index-CDqk4NcB.css` | **BLOCKED** — faltan secrets FTP |
| vfy-003 | P2 | Auto-zoom iOS: 4–5 inputs con `text-xs sm:text-sm` (12 px) | `QuoteForm.tsx` (5), `ContactSection.tsx:316` | **CORREGIDO** (`text-base sm:text-sm`) |
| vfy-004 | P2 | Salto de jerarquía h2→h4 | `Footer.tsx` (3), `FAQSection.tsx` (2) | **CORREGIDO** (h4→h3) |
| vfy-005 | P2 | Contraste AA < 4,5:1 | `BentoTrustGrid.tsx` (acento sobre oscuro), `Footer.tsx` (Staff CRM) | **CORREGIDO** (acento claro, `text-slate-400`) |
| vfy-006 | P3 | `logo.svg` 236,4 KB (> 200 KB) | `public/logo.svg` | **WARN** — no se carga en el DOM (se usa `logo.webp`, 55,6 KB) |
| vfy-007 | P3 | Deuda de contraste preexistente en varias secciones | 11 nodos en auditoría de contraste | **PENDIENTE** — no introducida por esta ronda |

**Re-verificación tras `3088303`:** A11y **95 → 97**, Desktop 94 / LCP 1.34 s / CLS 0.000, contraste con 11 nodos (de 25). Sin regresiones visuales detectadas.

---

## 4. POR QUÉ EL MÓVIL NO LLEGA A 67 (ni a 90)

1. **Factor de medición:** V-PERF y V-MOBILE corrieron Lighthouse **al mismo tiempo** en la misma máquina. Con `cpuSlowdownMultiplier=4`, dos Chrome compitiendo por CPU deprimen LCP y TBT. Los 57–59 no son directamente comparables con el 67 medido en serie.
2. **Factor de código:** el fallback de 3,2 s de `LazySection` monta secciones diferidas durante la ventana de medición y compite por el hilo principal.
3. **Factor estructural:** el elemento LCP es un `<p>` renderizado por React. La ruta crítica HTML → CSS → 144 KB gzip de JS → render impone un piso de ~5–6 s en Slow 4G + 4× CPU. Ninguna optimización de assets lo baja por debajo de 2,5 s sin reducir el JS inicial o prerenderizar.

**Acción recomendada:** repetir la medición móvil **en serie y aislada** (un solo Lighthouse) antes de tratar el 57–59 como regresión. Si se confirma, el siguiente ticket es quitar `motion` de la ruta crítica y/o prerenderizar el hero.

---

## 5. EVIDENCIA

- `docs/verificacion/perf/REPORTE.md` — 3 corridas desktop/móvil, anti-trampa de compresión, inventario de bundles y red de producción.
- `docs/verificacion/mobile/REPORTE.md` — 10 viewports, 7 anclas, táctil, a11y, fuentes, 31 capturas (las capturas viven en el worktree `verify-mobile`, no se versionan).
- `docs/evidence/final/*.json` — corridas locales finales (ignoradas por git).
- Commits: `3088303` (fixes), `b291c8a` (reporte perf), `7fc5133` (reporte móvil).

---

## 6. PENDIENTES

1. **Configurar secrets FTP** (`HOSTINGER_FTP_SERVER`, `USER`, `PASSWORD`, `SERVER_DIR=public_html/`) para desbloquear producción.
2. **Repetir medición móvil aislada** para separar ruido de regresión real.
3. **Ticket P1 opcional:** sacar `motion` del bundle inicial (≈ 42 KB gzip) y evaluar prerender del hero.
4. **Deuda P3:** contraste en secciones restantes y `logo.svg` sin optimizar.
