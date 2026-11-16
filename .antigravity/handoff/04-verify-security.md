# PROMPT — Rama `verify/security` (verificación, read-only)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-security`
- Rama: `verify/security` · commit base `4fe07c8`
- Automatización existente: `npm run verify:security` → `scripts/verify-security-automation.ts`
- Reporte destino: `docs/verificacion/security/REPORTE.md`
- Último veredicto registrado: `APTO` (8/8) el 2026-11-11.

## Objetivo
Re-ejecutar la verificación de seguridad y demostrar que sigue `APTO` sobre la base actual, incluyendo la comparación contra producción.

## Pasos obligatorios
1. `git fetch origin` y `git status --short`. Anota el hash real (`git rev-parse --short HEAD`).
2. `npm run lint` → debe pasar sin errores.
3. `npm run test:security` → reporta número de tests PASS/FAIL.
4. `npm run verify:security` → guarda la salida completa; debe regenerar `docs/verificacion/security/REPORTE.md`.
5. Revisa los 8 controles (SEC-01 … SEC-08) y confirma que ninguno quedó en `PASS` sin evidencia nueva de esta ejecución.
6. Comprueba en producción, en modo lectura: `HTTP/2`, `strict-transport-security`, `x-frame-options`, `x-content-type-options`, `content-security-policy`, `/api/health` = 200, y que no existan `*.bak`, `.env`, `*.map` accesibles.
7. Si algún control falla, clasifícalo P0-P3 y **no lo arregles en esta rama**.

## Prohibiciones específicas
- Solo puedes escribir `docs/verificacion/security/REPORTE.md` y `.antigravity/orca-state.json` (los genera el script). Nada de `src/`, `scripts/`, `public/`, `vite.config.ts`.
- No envíes formularios reales ni golpees `/api/leads` con POST.
- No leas ni imprimas valores de `.env.local`.

## Entregable
Reporte del contrato + confirmación de que `REPORTE.md` quedó regenerado con la fecha y hash de esta ejecución.
