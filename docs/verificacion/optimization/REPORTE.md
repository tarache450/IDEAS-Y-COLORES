# Reporte Automatizado de Verificación de Optimización — Ideas & Colores

- **Fecha:** 2026-11-20T19:38:23.948Z
- **Rama:** `fix/security-hardening` (`3b19395`)
- **Dominio:** https://ideasycoloresgt.site
- **Veredicto:** **APTO**

| ID | Métrica / Control | Meta | Medido | Estado |
| :--- | :--- | :--- | :--- | :--- |
| OPT-01 | Compilación & Typecheck | 0 errores TS y build limpio | tsc=OK, vite build=OK | **PASS** |
| OPT-02 | JS Crítico Inicial (entry + modulepreload, gzip) | ≤ 230 KB gzip (presupuesto total inicial) | 101.6 KB (index-Bb86yEnO.js:28.0 KB, vendor-react-CrxuRM3A.js:67.3 KB, vendor-icons-CO4Rngkd.js:6.3 KB) | **PASS** |
| OPT-03 | CSS Principal (gzip) | ≤ 30 KB gzip | 16.4 KB (index-DUZS_S8A.css) | **PASS** |
| OPT-04 | Presupuesto Imágenes Raster & Hero LCP | Hero ≤ 120 KB; 0 imágenes raster > 200 KB | Hero desktop=35.5 KB, mobile=12.5 KB, >200KB=0 | **PASS** |
| OPT-05 | Integridad Scroll-Margin & Anclas de Navegación | scroll-margin-top activo, sin content-visibility en secciones ni IDs duplicados | scroll_margin=true, content_visibility_bug=false, dup_tool_ids=false | **PASS** |
| OPT-06 | SEO, Codificación UTF-8, Geo Km 21.5 & Sitemap | Sin mojibake, JSON-LD Km 21.5 Fraijanes, 6 subpáginas en sitemap.xml | mojibake=false, km21_5_fraijanes=true, subpages_sitemap=true | **PASS** |
| OPT-07 | Producción: TTFB, Compresión & Sincronización de Build | HTTP 200, TTFB ≤ 800 ms, encoding br/gzip, bundle sincronizado con local | HTTP=200, TTFB=247ms, encoding=br, cache=public, max-age=31536000, immutable, sync=true (live=index-Bb86yEnO.js, local=index-Bb86yEnO.js) | **PASS** |

> Generado automáticamente por `scripts/verify-optimization-automation.ts` (`npm run verify:optimization`).
