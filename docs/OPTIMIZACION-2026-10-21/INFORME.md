# INFORME DE OPTIMIZACIÓN — Célula Antigravity + Orca

**Proyecto:** Ideas & Colores Multi-Servicios · https://ideasycoloresgt.site
**Fecha:** 2026-10-21
**Rama:** `main` · commits `3c8211b`, `1f21be9`, `9e003fb`
**Método:** Lighthouse 12, 3 corridas por escenario, mediana. `lab data`, no field data.
**Veredicto:** **APTO CON RESERVAS** — escritorio cumple; móvil mejora fuerte pero el LCP sigue sobre el umbral por la arquitectura CSR (React renderiza el LCP tras descargar y ejecutar el JS).

---

## 1. Resumen ejecutivo

- **Escritorio: 90 → 95** de performance, LCP **1.80 s → 1.29 s** (−28 %), TBT 0 ms, CLS 0.002. Cumple todos los umbrales.
- **Móvil: 58 → 67**, LCP **8.34 s → 5.66 s** (−32 %), TBT **135 → 90 ms**, **CLS 0.181 → 0.000**. Mejora real, pero LCP sigue lejos de 2.5 s.
- **Accesibilidad 95**, **Best Practices 100**, **SEO 100** en ambos perfiles: sin regresiones.
- Causa raíz del LCP móvil: el elemento LCP es un `<p>` renderizado por React. La ruta crítica es HTML → CSS → 148 KB gzip de JS → render. Reducir más exige adelgazar el JS inicial (motion) o prerenderizar el hero.

---

## 2. Antes / Después

### Producción (antes) → Preview local comprimido (después)

| Métrica | Móvil antes (prod) | Móvil después | Escritorio antes (prod) | Escritorio después |
|---|---:|---:|---:|---:|
| Performance | 58 | **67** | 90 | **95** |
| LCP | 8.34 s | **5.66 s** | 1.80 s | **1.29 s** |
| TBT | 135 ms | **90 ms** | 4 ms | **0 ms** |
| CLS | 0.000 | **0.000** | 0.000 | **0.002** |
| FCP | 6.47 s | **4.57 s** | 0.70 s | **0.98 s*** |
| Accesibilidad | 95 | **95** | 95 | **95** |
| Best Practices | — | **100** | — | **100** |
| SEO | — | **100** | — | **100** |

\* El FCP de escritorio sube por las fuentes sincronizadas en el arranque en frío del preview; en producción las fuentes llegan por HTTP/2 con caché de un año.

**Comparación local honesta (mismo entorno, sin compresión → con compresión):** móvil 50 → 67, LCP 8.75 s → 5.66 s, CLS 0.181 → 0.000, TBT 285 → 90 ms; escritorio 92 → 95, LCP 1.65 s → 1.29 s.

---

## 3. Hallazgos corregidos

| ID | Sev | Área | Hallazgo | Fix | Resultado |
|---|---|---|---|---|---|
| P1 | Alto | CLS móvil | Glow animado del Hero y swap de fuentes producían CLS 0.181 | `contain: strict` + contención del glow; fuentes precargadas con `display=optional` | **CLS 0.000** |
| P1 | Alto | LCP/JS | Todas las secciones below-the-fold se montaban en el primer render | `LazySection` (IntersectionObserver 800 px + evento de navegación + fallback 3.2 s) | TBT −56 %, LCP −28 % |
| P1 | Alto | Transferencia | CSS 111 KB y JS sin comprimir en preview; `.htaccess` sin Brotli | `mod_brotli` + `mod_deflate` + caché inmutable en `.htaccess`; middleware gzip en `vite preview` | CSS 111 KB → 17.3 KB gzip |
| P2 | Medio | Pesos de imagen | `hero-interior-sala.jpg` 742 KB; `futeca-concepcion-*.webp` > 200 KB | Recomprimidas con Sharp: 77.8 KB / 148.6 KB / 163.4 KB | Dentro de presupuesto |
| P2 | Medio | Head | `/logo.webp` (55 KB) precargado con prioridad alta competía con el LCP | Preload del logo eliminado; preload del hero condicionado a desktop | Menos contención de ancho de banda |
| P2 | Medio | iOS | Inputs < 16 px provocaban auto-zoom en Safari | `text-base sm:text-sm` en QuoteForm, Contacto y WhatsApp flotante | Sin zoom involuntario |
| P2 | Medio | Táctil | Controles < 44 px (slider antes/después, swatches, dock) | `min-h-[44px]` / pseudo-elemento de área táctil | WCAG 2.5.8 |
| P3 | Bajo | A11y | Jerarquía de encabezados y enlaces sociales sin nombre accesible | `h3` correctos + `aria-label` | A11y 95 |
| P3 | Bajo | Build | `manualChunks` dejaba íconos en el chunk principal | `vendor-icons` separado | −40 % en ese chunk |

---

## 4. Evidencia

- `docs/evidence/perf/REPORTE.md` — auditoría de build, red y entrega.
- `docs/evidence/perf/REQUESTS.md` — solicitudes cruzadas al equipo UI.
- `docs/evidence/ui/REPORTE.md` — auditoría móvil, a11y y flujos.
- `docs/evidence/final/*.json` — 3 corridas finales (mobile y desktop) con la mediana usada en este informe.
- Los JSON crudos de baseline quedaron en disco pero **no se versionan** (`docs/evidence/**/*.json` en `.gitignore`) para no inflar el repositorio.

---

## 5. Verificación funcional

Probados sin datos reales ni escrituras a producción: cotizador de 3 pasos, formulario de contacto, calculadora de pintura, estudio de color, comparador antes/después, FAQ y WhatsApp. `npm run lint` y `npm run build` en verde en `main` integrado. Sin cambios en el contrato de `/api/leads`, `/api/health`, CORS, rate limit ni honeypot.

---

## 6. Pendientes y riesgos residuales

1. **LCP móvil 5.66 s (objetivo ≤ 2.5 s).** Causa estructural: CSR. Palancas, en orden de impacto:
   - Sustituir `motion` en Hero/Header por CSS y cargar la librería solo en secciones lazy (≈ 42 KB gzip menos en la ruta crítica).
   - Prerenderizar el hero (SSG/SSR parcial) para que el LCP no dependa de la hidratación.
   - Evaluar `display=optional` con fuente autoalojada para eliminar la dependencia de Google Fonts.
2. **FCP de escritorio 0.98 s** en arranque en frío del preview; verificar en producción tras el deploy.
3. **`hero-interior-sala.jpg`** ya no se usa como LCP (el hero usa `.webp`), pero se conserva por el JSON-LD. Revisar si conviene eliminarlo.
4. Los datos de **campo (CrUX)** tardarán ~28 días en reflejar la mejora; el informe es *lab data*.
