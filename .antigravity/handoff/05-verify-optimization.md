# PROMPT — Rama `verify/optimization` (verificación, read-only)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-optimization`
- Rama: `verify/optimization` · commit base `4fe07c8`
- Automatización existente: `npm run verify:optimization` → `scripts/verify-optimization-automation.ts`
- Reporte destino: `docs/verificacion/optimization/REPORTE.md`
- Último veredicto registrado: `APTO` (7/7) el 2026-11-15 sobre `fix/security-hardening@05667b0`.

## Objetivo
Re-ejecutar la verificación de optimización sobre la base actual y demostrar los 7 controles con evidencia nueva.

## Pasos obligatorios
1. `git fetch origin`, `git status --short`, `git rev-parse --short HEAD`.
2. `npm run lint`.
3. `npm run build` → anota el `index-*.js` generado y su tamaño gzip.
4. `npm run verify:optimization` → regenera `docs/verificacion/optimization/REPORTE.md`.
5. Revisa y reporta el valor medido de cada control:
   - OPT-01 JS inicial (presupuesto gzip)
   - OPT-02 CSS y fuentes no bloqueantes
   - OPT-03 Lazy loading / code-splitting por sección
   - OPT-04 Presupuesto de imágenes (hero ≤ 120 KB, ninguna raster > 200 KB)
   - OPT-05 `scroll-margin-top`, sin `content-visibility` en secciones, sin IDs duplicados
   - OPT-06 UTF-8 sin mojibake, JSON-LD con Km 21.5 Fraijanes, 6 subpáginas en `sitemap.xml`
   - OPT-07 Producción: HTTP 200, TTFB ≤ 800 ms, `content-encoding` br/gzip, hash del bundle = build local
6. Si OPT-07 falla por hash distinto, verifica primero si `main` está desalineada antes de declarar `FAIL`.
7. Todo hallazgo se reporta como FINDING; **no se corrige aquí**.

## Prohibiciones específicas
- Solo escribes `docs/verificacion/optimization/REPORTE.md`. Cero cambios en `src/`, `public/`, `vite.config.ts`, `index.html`.
- No "optimices de paso" nada que encuentres: eso es trabajo de `08-opt-perf.md`.
- No modifiques imágenes ni generes assets nuevos.

## Entregable
Reporte del contrato + tabla OPT-01…OPT-07 con valor medido, umbral y veredicto.
