# PROMPT — Rama `fix/security-hardening` (integración, escritura)

> Pega antes `CONTRATO-COMUN.md`.

## Contexto
- Worktree: `C:\Users\diego\OneDrive\Escritorio\ia chamba\IDEAS-Y-COLORES` (ruta con espacios: cítala siempre entre comillas)
- Rama: `fix/security-hardening` · HEAD `05667b0`
- Estado: `lint` OK, `build` OK (`index-Cm1yayIO.js`, idéntico al build en vivo), checklist ORCA 12/12 PASS.
- Modificado sin commitear: `docs/verificacion/optimization/REPORTE.md` (solo métricas TTFB). Consérvalo.
- Es la rama donde **se integran** los fixes aprobados por las ramas de verificación y optimización.

## Objetivo
Mantener la rama verde y aplicar aquí, uno por uno, los fixes aprobados por el Coordinador, con re-verificación después de cada uno.

## Reglas de integración
1. **Nada entra sin ticket.** Solo aplicas hallazgos que el Coordinador te haya pasado con formato `FINDING-<id>`. Si te piden "arreglar todo lo que veas", recházalo: no es tu alcance.
2. Un fix = un cambio mínimo y localizado. Nada de refactors de acompañamiento.
3. Si el fix toca backend (`src/server/**`, `public/api/**`), exige prueba explícita de que el contrato `POST /api/leads` y `GET /api/health` no cambia.
4. Si el fix toca seguridad (CSP, CORS, rate limit, honeypot, sanitización), es P0/P1: re-ejecuta `npm run test:security` además de `lint` y `build`.
5. No commitees ni hagas push: deja el cambio en el working tree, describe el diff y espera aprobación humana.

## Checklist de cierre (obligatorio en cada entrega)
```
[ ] npm run lint      → 0 errores
[ ] npm run build     → OK, sin warnings nuevos
[ ] npm run test:security → 20/20 PASS (si tocaste seguridad)
[ ] Sin cambios en .env*, credenciales o deploy
[ ] Checklist ORCA: npx tsx .antigravity/scripts/auditor.ts → PASSED
```

## Hallazgos conocidos a vigilar
- `EMAIL_OBFUSCATION_CHECK` falló dos veces el 2026-11-11 (INC-AUD-1794419056331 / INC-AUD-1794419087645). Ahora pasa; si vuelve a fallar, es P1.
- `main` está 16 commits por detrás de `origin/main`: no arrastres ese desfase a esta rama sin decisión explícita.
- `package.json` define `dev` en puerto **3001**; cualquier documento que diga 3000 está desactualizado.

## Entregable
Reporte del contrato + diff exacto + evidencia de re-verificación por fix aplicado.
