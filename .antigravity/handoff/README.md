# Handoff Antigravity ← Orca · IDEAS-Y-COLORES

Paquete de prompts para que los agentes de **Antigravity IDE** trabajen sobre las ramas que ya existen en Orca. No crea worktrees nuevos ni ramas nuevas: usa exactamente las que hay.

## 1. Inventario real (verificado)

| # | Rama | Worktree absoluto | Tipo | Prompt |
|---|---|---|---|---|
| 1 | `fix/security-hardening` | `C:\Users\diego\OneDrive\Escritorio\ia chamba\IDEAS-Y-COLORES` | Integración (escritura) | `02-fix-security-hardening.md` |
| 2 | `main` | `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\main` | Producción (escritura mínima) | `03-main-produccion.md` |
| 3 | `verify/security` | `C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-security` | Verificación read-only | `04-verify-security.md` |
| 4 | `verify/optimization` | `C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-optimization` | Verificación read-only | `05-verify-optimization.md` |
| 5 | `DQuan-hub/verify-mobile` | `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\verify-mobile` | Verificación read-only | `06-verify-mobile.md` |
| 6 | `DQuan-hub/verify-perf` | `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\verify-perf` | Verificación read-only | `07-verify-perf.md` |
| 7 | `DQuan-hub/opt-perf` | `C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\opt-perf` | Optimización (escritura) | `08-opt-perf.md` |

Estado al generar este paquete: `lint` OK, `build` OK (`index-Cm1yayIO.js` = build en vivo), checklist ORCA 12/12 PASS, veredictos de seguridad y optimización `APTO`.

## 2. Cómo lanzar (3 formas)

**A. Desde Antigravity IDE** (recomendado): abre el worktree como carpeta (`File → Open Folder`), luego pega `CONTRATO-COMUN.md` + el prompt de tu rama como primer mensaje del agente.

**B. Desde Orca CLI** (lanza el agente dentro del worktree correcto):

```powershell
orca agent launch --agent <agente> --worktree path:"C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-security" --surface chat
orca agent launch --agent <agente> --worktree path:"C:\Users\diego\antigravity\workspaces\IDEAS-Y-COLORES\verify-optimization" --surface chat
orca agent launch --agent <agente> --worktree path:"C:\Users\diego\orca\workspaces\IDEAS-Y-COLORES\main" --surface terminal
```

**C. Solo abrir el worktree en Orca**:

```powershell
orca worktree activate --worktree branch:verify/security
```

## 3. Orden de ejecución

1. `03-main-produccion.md` — primero, porque `main` está **16 commits por detrás de `origin/main`** y el resto de verificaciones debe comparar contra la base correcta.
2. `04-verify-security.md` y `05-verify-optimization.md` en paralelo (automatizaciones existentes).
3. `06-verify-mobile.md` y `07-verify-perf.md` en paralelo (evidencia medida con Lighthouse/Chrome).
4. `08-opt-perf.md` solo si hay hallazgos P1/P2 de performance que justifiquen tocar código.
5. `02-fix-security-hardening.md` al final: es la rama de integración donde se consolidan los fixes aprobados.

## 4. Reglas de la célula

- Un worktree = un agente. Jamás dos agentes sobre el mismo worktree.
- Las ramas `verify/*` y `DQuan-hub/verify-*` **no modifican código**: solo su reporte.
- Nadie hace `push`, `commit` ni deploy. El humano integra.
- Si un agente detecta un fallo P0, no lo arregla en su rama de verificación: lo reporta y espera.

## 5. Archivos que este paquete deja sin tocar

- `docs/PROMPT-MAESTRO-VERIFICACION.md` (sin trackear en `main`)
- `docs/PROMPT-MAESTRO-VERIFICACION-PERFORMANCE.md` (sin trackear en `verify-mobile` y `verify-perf`)
- `docs/verificacion/mobile/raw/*.json` (evidencia sin trackear)

No los borres: son insumos de la célula.
