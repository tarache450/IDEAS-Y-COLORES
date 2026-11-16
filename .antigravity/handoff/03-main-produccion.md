# PROMPT — Rama `main` (producción, escritura mínima)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\main`
- Rama: `main` · **está 16 commits por detrás de `origin/main`**
- Archivo sin trackear: `docs/PROMPT-MAESTRO-VERIFICACION.md` (no borrar)
- Producción sirve `assets/index-Cm1yayIO.js`; el build local de `fix/security-hardening@05667b0` genera el mismo hash.

## Objetivo
Dejar `main` alineada con `origin/main` y demostrar si el build en vivo corresponde al código de `main`, sin tocar producción.

## Pasos obligatorios
1. `git status --short --branch` y `git log --oneline -3`. Reporta el desfase exacto.
2. `git fetch origin` y luego `git merge --ff-only origin/main`. Si el fast-forward falla, **detente**: hay divergencia local y eso es un hallazgo P0 que se reporta, no se fuerza.
3. Tras alinear: `npm run lint` y `npm run build`.
4. Compara el nombre del entry en `dist/index.html` contra el que sirve producción:
   `curl.exe -s https://ideasycoloresgt.site/ | Select-String -Pattern 'assets/index-[^"]+\.js'`
5. Reporta coincidencia exacta o desfase (desfase = `WARN`, no `FAIL`: el deploy depende de secrets FTPS del workflow).
6. Decide qué hacer con el doc sin trackear: **consérvalo** y repórtalo; no lo commitees sin autorización.

## Prohibiciones específicas
- No hagas merge distinto de `--ff-only`.
- No ejecutes el workflow de deploy ni subas nada por FTPS.
- No edites `vite.config.ts`, `public/.htaccess` ni `src/` en esta rama: si algo debe cambiar, lo propone `08-opt-perf.md` y lo integra `02-fix-security-hardening.md`.

## Entregable
Reporte en el formato del contrato, guardado además en
`docs/verificacion/main/REPORTE.md` (créalo si no existe).
