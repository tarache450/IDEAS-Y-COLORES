# PROMPT — Rama `DQuan-hub/verify-perf` (verificación, read-only)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\verify-perf`
- Rama: `DQuan-hub/verify-perf` · sin upstream
- Reporte destino: `docs/verificacion/perf/REPORTE.md`
- Insumo sin trackear: `docs/PROMPT-MAESTRO-VERIFICACION-PERFORMANCE.md` (no borrar).

## Objetivo
Veredicto de performance **escritorio** (red, build, CWV) contra el build real, sin re-optimizar nada.

## Pasos obligatorios
1. `git status --short --branch`, `git rev-parse --short HEAD`, `git log --oneline -3`.
2. `git fetch origin` y compara tu base con `origin/main` (`git rev-list --left-right --count HEAD...origin/main`).
3. `npm run lint` y `npm run build` → registra tabla de chunks con tamaño gzip (`dist/assets/*`).
4. `npm run preview` y mide Lighthouse escritorio (preset desktop) 3 veces; reporta mediana, no el mejor intento.
5. Mide el presupuesto de red del HTML inicial: número de requests bloqueantes, peso total transferido, `preload`/`prefetch` presentes.
6. Producción, solo lectura: `TTFB`, `content-encoding`, `cache-control` de `/assets/*`, hash del entry.
7. Contrato de claims: para cada uno de V1…V8 del documento `PROMPT-MAESTRO-VERIFICACION-PERFORMANCE.md`, produce la fila `claim → medido → tolerancia → veredicto`.

## Prohibiciones específicas
- Solo escribes `docs/verificacion/perf/REPORTE.md`. Cero cambios en `src/`, `vite.config.ts`, `index.html`, `public/`.
- No toques `dist/` manualmente ni borres builds.
- No cambies `manualChunks` ni el target de build "para mejorar" una métrica: eso se propone y lo decide el humano.

## Entregable
Reporte del contrato + tabla claim→medido→tolerancia + top 5 oportunidades ordenadas por impacto/esfuerzo.
