# PROMPT — Rama `DQuan-hub/verify-mobile` (verificación, read-only)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\verify-mobile`
- Rama: `DQuan-hub/verify-mobile` · upstream `origin/DQuan-hub/verify-mobile`
- Reporte destino: `docs/verificacion/mobile/REPORTE.md`
- **Ya existe evidencia sin trackear** en `docs/verificacion/mobile/raw/`:
  `mobile-1.json`, `mobile-2.json`, `mobile-3.json`, `viewports-result.json`, `touch-a11y-result.json`, `lazysection-result.json`, `h1-fallback-result.json`
- También existe el insumo `docs/PROMPT-MAESTRO-VERIFICACION-PERFORMANCE.md` (no borrar).

## Objetivo
Producir el veredicto móvil definitivo (responsive + accesibilidad + Core Web Vitals móvil) consolidando la evidencia existente **y** re-midiendo lo que esté caducado.

## Pasos obligatorios
1. `git status --short --branch` y `git rev-parse --short HEAD`.
2. Lee los `raw/*.json` y extrae: viewport, LCP, CLS, TBT, contraste, tamaños táctiles, overflow horizontal.
3. Marca como **caducada** cualquier evidencia con fecha anterior al último commit de `main`; re-mídela.
4. `npm run lint` y `npm run build`.
5. `npm run preview` y mide en local (puerto de preview) con Lighthouse móvil emulado (Moto G Power, 4G lento) + inspección de viewports 320/375/390/414/768.
6. Comprueba en móvil: sin scroll horizontal, targets táctiles ≥ 44 px, inputs ≥ 16 px (sin auto-zoom iOS), menú hamburguesa operable, `LazySection` con fallback 3.2 s, anclas con `scroll-margin-top`.
7. Contrasta contra producción (`https://ideasycoloresgt.site`) sin escribir nada.

## Prohibiciones específicas
- Solo escribes `docs/verificacion/mobile/REPORTE.md` y añades archivos en `docs/verificacion/mobile/raw/`. **Cero** cambios en `src/`, `public/`, `index.html`.
- No borres ni sobrescribas los `raw/*.json` existentes: añade nuevos con sufijo de fecha (`mobile-4.json`, etc.).
- No uses datos de formulario reales.

## Entregable
Reporte del contrato + tabla de viewports + tabla de CWV móvil (local vs producción) + lista de hallazgos P0-P3 con archivo:línea.
