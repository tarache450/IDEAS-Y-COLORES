# Verificación de seguridad — {{FECHA}}

**Proyecto:** Ideas & Colores Multi-Servicios (`https://ideasycoloresgt.site`)
**Repositorio:** `IDEAS-Y-COLORES`
**Rama:** `{{RAMA}}`
**Commit auditado:** `{{COMMIT}}`
**Tipo de revisión:** Semanal
**Estado global:** `PASS` / `PASS CON OBSERVACIONES` / `ACCIÓN REQUERIDA`

---

## 1. Resumen ejecutivo

- Veredicto:
- Hallazgos nuevos:
- Hallazgos corregidos:
- Riesgos abiertos:
- Bloqueadores externos:

## 2. Línea base

| Comando | Resultado |
| :--- | :--- |
| `npm ci` | |
| `npm run test:security` | |
| `npx tsc --noEmit` | |
| `npm run build` | |
| `npm audit --omit=dev` | |
| `npm audit` | |
| `npm run orca:auditor` | |

## 3. Hallazgos

| ID | Severidad | Estado | Hallazgo | Evidencia | Archivo / URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SEC-01 | | | | | |

Estados permitidos: `PASS`, `FAIL`, `NOT_VERIFIED`, `BLOCKED`.
Severidades: `CRÍTICA`, `ALTA`, `MEDIA`, `BAJA`, `INFO`.

## 4. Detalle de hallazgos corregidos

### SEC-XX — Título

**Causa:**
**Evidencia:**
**Corrección:**
**Archivos cambiados:**
**Prueba de regresión:**
**Verificación:**

## 5. Hallazgos abiertos o bloqueados

### SEC-XX — Título

**Motivo:**
**Impacto:**
**Qué falta:**
**Responsable:**
**Cómo verificar cuando se cierre:**

## 6. Producción observada

| Control | Esperado | Observado | Estado |
| :--- | :--- | :--- | :--- |
| HSTS | `max-age=63072000` | | |
| CSP | Sin `unsafe-inline` en scripts | | |
| `X-Frame-Options` | `SAMEORIGIN` | | |
| `X-Content-Type-Options` | `nosniff` | | |
| `/.env` | 403 | | |
| `/tsconfig.json` | 403 | | |
| `/package-lock.json` | 403 | | |
| HTTP→HTTPS | 301 | | |
| `www`→sin `www` | 301 | | |
| DMARC `.site` | `p=reject` | | |
| DMARC `.com` | Presente | | |

## 7. Supabase / RLS

| Control | Resultado | Evidencia |
| :--- | :--- | :--- |
| `public.is_admin()` | | |
| Políticas admin-only | | |
| `anon` solo INSERT | | |
| Registro público deshabilitado | | |
| Admin real con acceso | | |
| No-admin sin acceso | | |

## 8. Riesgos aceptados

| Riesgo | Justificación | Revisión |
| :--- | :--- | :--- |
| | | |

## 9. Próximos pasos

1.
2.
3.

## 10. Firma

- Auditor:
- Fecha:
- Próxima revisión:
