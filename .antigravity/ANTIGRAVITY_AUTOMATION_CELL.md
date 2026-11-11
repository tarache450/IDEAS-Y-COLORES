# CÉLULA DE VERIFICACIÓN AUTOMATIZADA EN ANTIGRAVITY — IDEAS & COLORES

Reemplazo y evolución nativa en **Antigravity IDE** de la topología multi-rama / worktree de Orca (`verify-perf`, `verify-mobile`, `fix/security-hardening`).

## 1. Ramas & Worktrees Aislados

| Rama Git | Worktree Local Antigravity | Rol | Comando Automático |
| :--- | :--- | :--- | :--- |
| `verify/security` | `C:/Users/diego/antigravity/workspaces/IDEAS-Y-COLORES/verify-security` | Verificación de Seguridad & DevSecOps | `npm run verify:security` |
| `verify/optimization` | `C:/Users/diego/antigravity/workspaces/IDEAS-Y-COLORES/verify-optimization` | Verificación de Optimización, Build & SEO | `npm run verify:optimization` |
| `main` | `C:/Users/diego/orca/workspaces/IDEAS-Y-COLORES/main` | Rama de Producción (Hostinger CI/CD) | `npm run build` |
| `fix/security-hardening` | Workspace principal IDE | Rama activa de desarrollo e integración | `npm run dev` |

## 2. Reglas de Operación (Contrato Heredado de Orca)
1. **Solo lectura sobre código en ramas `verify/*`:** Las automatizaciones de verificación auditan, miden y escriben únicamente reportes en `docs/verificacion/security/REPORTE.md` o `docs/verificacion/optimization/REPORTE.md`. Nunca modifican `src/`, `vite.config.ts`, `.env*`, ni despliegan a Hostinger o escriben en Supabase producción.
2. **Evidencia obligatoria:** Toda verificación debe producir comando + salida real (`PASS`, `WARN`, `FAIL` o `BLOCKED`).
3. **Sincronización con `main`:** Antes de auditar, hacer `git fetch origin` y verificar estado contra `origin/main`.
4. **Automatizaciones Programadas en Antigravity (`Automations`):**
   - `Verificación Semanal de Seguridad — Ideas & Colores` (`verify-security`)
   - `Verificación Semanal de Optimización — Ideas & Colores` (`verify-optimization`)
