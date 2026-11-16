# PROMPT — Rama `DQuan-hub/opt-perf` (optimización, escritura permitida)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\opt-perf`
- Rama: `DQuan-hub/opt-perf` · propósito declarado: *"perf: baseline y optimizacion build/red"*
- Working tree limpia al generar este paquete.
- Esta es una rama de **trabajo**, no de verificación: aquí sí puedes tocar código, pero solo lo que reduzca peso o latencia con evidencia before/after.

## Objetivo
Aplicar mejoras de build y red medibles, en commits atómicos, sin cambiar copy, diseño ni comportamiento funcional.

## Alcance permitido
- `vite.config.ts` (chunks, `modulePreload`, target, minificación, compresión de preview)
- `index.html` (preload/prefetch, carga de fuentes, CSS crítico)
- `public/.htaccess` (compresión, caché) — solo si no rompe el fallback PHP
- Carga diferida de componentes ya existentes (`React.lazy`, `LazySection`)
- Peso de imágenes ya presentes en `public/` (recompresión, sin cambiar nombres públicos ni borrar originales)

## Fuera de alcance
- `src/server/**`, `public/api/**` (backend y fallback PHP)
- Textos, precios, marca, identidad visual
- Dependencias nuevas
- Supabase, `.env*`, deploy

## Protocolo de trabajo
1. `git status` limpio + `git rev-parse --short HEAD`. Registra la línea base: tabla de `dist/assets/*` con tamaño y gzip, y Lighthouse móvil+escritorio (mediana de 3).
2. Un cambio por commit lógico **local** (sin `git commit` real: deja el cambio en el working tree y descríbelo; el humano commitea).
3. Después de **cada** cambio: `npm run lint` + `npm run build` + re-medición.
4. Si un cambio no mejora al menos un 5 % en la métrica objetivo o empeora otra, **reviértelo** y anótalo como descartado.
5. Nunca toques dos áreas en el mismo paso: sin refactors mezclados con performance.

## Entregable
Reporte del contrato con tabla before/after por cambio (métrica, antes, después, %), lista de diffs exactos (`git diff --stat`) y lista de ideas descartadas con el motivo.
Guarda copia en `docs/verificacion/perf/OPTIMIZACION.md`.
