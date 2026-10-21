# REQUESTS DE OPTIMIZACIÓN — Celula de Rendimiento (opt-perf -> opt-ui)

## [ID] opt-perf-001
**FROM:** perf  
**TO:** ui  
**ARCHIVO:** `src/App.tsx` (o router principal)  
**EVIDENCIA:** En el Lighthouse baseline mobile, el bundle inicial incluye `ColorStudioVisualizer.js` (26.5 KB), `PaintCalculator.js` (18 KB), `ProjectsGallery.js` (15.5 KB), `ServicesSection.js` (10.5 KB) en el primer render, elevando el JS parse/eval y el TBT a 307 ms.  
**CAUSA:** Componentes below-the-fold importados directamente de forma estática en lugar de `React.lazy()`.  
**ACCIÓN PROPUESTA:** Convertir `ColorStudioVisualizer`, `PaintCalculator`, `ProjectsGallery`, `FAQSection` a dynamic imports con `React.lazy()` y envolverlos en `<Suspense fallback={<SectionSkeleton />}>`.  
**CRITERIO DE ACEPTACIÓN:** JS inicial <= 65 KB gzip, reducción de TBT móvil <= 200 ms.  
**BLOQUEA A:** Cumplimiento total de umbral de JS inicial de 65 KB gzip.

---

## [ID] opt-perf-002
**FROM:** perf  
**TO:** ui  
**ARCHIVO:** `public/hero-interior-sala.jpg` (724.7 KB), `public/projects/futeca-concepcion-despues.webp` (252.9 KB), `public/projects/futeca-concepcion-antes.webp` (228.9 KB), `public/logo.svg` (236.4 KB)  
**EVIDENCIA:** Cuatro imágenes en `public/` superan el límite de 200 KB establecido en la sección 6 de presupuestos (y `hero-interior-sala.jpg` supera los 120 KB para LCP).  
**CAUSA:** Archivos originales de alta resolución no recomprimidos para web.  
**ACCIÓN PROPUESTA:** Ejecutar el script automatizado provisto por perf `node scripts/optimize-images.cjs` para reducir los pesos a < 120 KB sin pérdida perceptual de calidad, o sustituir los archivos en `public/`.  
**CRITERIO DE ACEPTACIÓN:** Ninguna imagen > 200 KB; imágenes LCP <= 120 KB.  
**BLOQUEA A:** Presupuesto de bytes de imágenes above-the-fold y home total <= 1.2 MB.
