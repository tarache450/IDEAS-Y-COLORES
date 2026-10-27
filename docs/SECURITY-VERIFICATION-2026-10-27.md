# Verificación de seguridad — 2026-10-27

**Proyecto:** Ideas & Colores Multi-Servicios (`https://ideasycoloresgt.site`)
**Repositorio:** `IDEAS-Y-COLORES`
**Rama:** `fix/security-hardening`
**Commit auditado:** `5b92304` + cambios locales sin commit
**Tipo de revisión:** Semanal
**Estado global:** **PASS CON OBSERVACIONES en código local** / **ACCIÓN REQUERIDA en producción**

---

## 1. Resumen ejecutivo

- **No se encontraron vulnerabilidades nuevas en el código de la aplicación.**
- Se corrigió un riesgo de cadena de suministro en desarrollo: `jimp@1.6.1` arrastraba **29 advisories `high`** vía `zod`. Solo se usaba en `scripts/audit-images.ts`; se migró a `sharp` y se eliminó `jimp`. `npm audit` y `npm audit --omit=dev` quedaron en **0**.
- La suite de seguridad sigue en **20/20**, TypeScript y build pasan, y el auditor interno sigue en **12/12**.
- **El riesgo principal sigue estando fuera del código:** el sitio en producción no tiene desplegado el `.htaccess` endurecido, la migración RLS de administradores no está aplicada y el dominio `.com` sigue sin DMARC.
- Se creó el paquete de revisión semanal: prompts, checklist, plantilla de informe y workflow programado.

## 2. Línea base

| Comando | Resultado |
| :--- | :--- |
| `npm run test:security` | **20/20 pass** |
| `npx tsc --noEmit` | **pass** |
| `npm run build` | **pass** |
| `npm audit --omit=dev` | **0 vulnerabilidades** |
| `npm audit` | **0 vulnerabilidades** (antes: 29 `high` por `jimp`) |
| `npm run orca:auditor` | **12/12 pass** |
| `npx tsx scripts/audit-images.ts` | **pass** con `sharp` |

## 3. Hallazgos

| ID | Severidad | Estado | Hallazgo | Evidencia |
| :--- | :--- | :--- | :--- | :--- |
| SEC-01 | **ALTA (dev)** | **CORREGIDO** | `jimp@1.6.1` con 29 advisories `high` vía `zod` | `npm audit` antes: `29 high`; después: `0` |
| SEC-02 | **ALTA** | **BLOQUEADO** | Producción sigue con el `.htaccess` antiguo: HSTS 1 año, CSP mínima y archivos sensibles accesibles | `curl -I` live del 2026-10-27; ver §4 |
| SEC-03 | **ALTA** | **BLOQUEADO** | Migración `20261022000000_harden_admin_rls.sql` no aplicada en Supabase | No hay credenciales/Service Role en el entorno |
| SEC-04 | **ALTA** | **BLOQUEADO** | `.com` sin DMARC; DKIM de `.site` con `p=` vacío; SPF de `.com` apunta a `secureserver.net` | `Resolve-DnsName` del 2026-10-27; ver §5 |
| SEC-05 | **INFO** | **PASS** | CSP local con hash correcto y `dist/.htaccess` idéntico a `public/.htaccess` | Hash `sha256-RahpOtU9YhSSzuutDtalDT4B9HJ9lHtN0zgePHBQFuM=` |
| SEC-06 | **INFO** | **PASS** | Sin secretos obvios versionados | `git grep` de patrones de claves: sin coincidencias |
| SEC-07 | **INFO** | **PASS** | Revisión semanal documentada y automatizada | `PROMPTS_REVISION_SEGURIDAD_SEMANAL.md`, `docs/security/`, `.github/workflows/security-weekly.yml` |

## 4. Producción observada (2026-10-27)

Cabeceras live:

```http
HTTP/1.1 200 OK
last-modified: Sun, 18 Oct 2026 12:39:56 GMT
content-security-policy: upgrade-insecure-requests
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
```

Archivos sensibles:

| URL | HTTP | Esperado |
| :--- | :--- | :--- |
| `/.env` | 403 | 403 |
| `/.git/config` | 403 | 403 |
| `/tsconfig.json` | **200** | 403 |
| `/package-lock.json` | **200** | 403 |

**Diagnóstico:** el bundle live sigue siendo el del 18 de octubre. El `.htaccess` local endurecido no está publicado. No hay secretos FTP de Hostinger configurados en GitHub Actions; el workflow de deploy solo compila y avisa que faltan `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME` y `HOSTINGER_FTP_PASSWORD`. **No es un defecto del código; es un bloqueo de despliegue.**

## 5. DNS observado (2026-10-27)

| Registro | Resultado | Estado |
| :--- | :--- | :--- |
| SPF `ideasycoloresgt.site` | `v=spf1 -all` | PASS (el dominio no envía correo) |
| DMARC `_dmarc.ideasycoloresgt.site` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:gerencia@ideasycoloresgt.com` | PASS |
| SPF `ideasycoloresgt.com` | `v=spf1 include:secureserver.net -all` | **REVISAR**: no autoriza a Microsoft 365 (`NETORGFT9264211.onmicrosoft.com`) |
| DMARC `_dmarc.ideasycoloresgt.com` | Sin registro | **FAIL** |
| DKIM `titan1._domainkey.ideasycoloresgt.site` | `v=DKIM1; p=` (clave vacía) | **FAIL/REVISAR** |
| DKIM `titan1._domainkey.ideasycoloresgt.com` | Sin registro | **FAIL/REVISAR** |

El correo corporativo visible es `gerencia@ideasycoloresgt.com`; ese dominio es el que más necesita DMARC y DKIM correctos. No se modificó DNS porque requiere acceso al panel y confirmar el proveedor real de correo.

## 6. Corrección aplicada: `jimp` → `sharp`

**Antes:** `jimp@1.6.1` era devDependency y se usaba únicamente en `scripts/audit-images.ts` para obtener `width`/`height` de JPG/PNG. Su árbol incluía `zod@3.25.76`, afectado por `GHSA-mrhx-c7xc-m3w5` (agotamiento de memoria), y 28 advisories transitivos más.

**Después:**

- `scripts/audit-images.ts` usa `sharp(fullPath).metadata()`.
- `jimp` se eliminó de `package.json` y `package-lock.json`.
- El script sigue funcionando y reporta dimensiones correctamente.
- `npm audit --omit=dev` y `npm audit` → **0 vulnerabilidades**.

No hubo impacto en producción: `jimp` no formaba parte del bundle del navegador.

## 7. Archivos creados/modificados en esta revisión

**Creados:**

- `PROMPTS_REVISION_SEGURIDAD_SEMANAL.md` — prompts A/B/C/D para revisión semanal, corrección, post-deploy e incidentes.
- `docs/security/CHECKLIST-SEMANAL.md` — checklist operativa con comandos y criterios PASS/FAIL.
- `docs/security/PLANTILLA-INFORME-SEMANAL.md` — plantilla del informe.
- `.github/workflows/security-weekly.yml` — ejecución automática semanal (lunes 13:00 UTC) de tests, typecheck, build, audits y resumen live/DNS.
- `docs/SECURITY-VERIFICATION-2026-10-27.md` — este informe.

**Modificados:**

- `scripts/audit-images.ts` — migrado de `jimp` a `sharp`.
- `package.json` / `package-lock.json` — eliminado `jimp`.
- `SECURITY.md` — añadida la sección de revisión semanal.
- `docs/SECURITY-REPORT.md` — estado live actualizado al 2026-10-27 y nota de eliminación de `jimp`.

## 8. Riesgos abiertos / BLOCKED

| Riesgo | Por qué está abierto | Acción exacta |
| :--- | :--- | :--- |
| Deploy sin endurecimiento | No hay credenciales FTP/Hostinger en el entorno ni secretos en GitHub | Configurar `HOSTINGER_FTP_*` o subir `dist/` manualmente; luego ejecutar Prompt C |
| RLS de administradores | No hay Service Role/DB password ni acceso al dashboard de Supabase | Aplicar la migración y asignar `app_metadata.role=admin`; verificar con cuenta no-admin |
| Correo `.com` | No hay acceso al panel DNS | Añadir DMARC, corregir SPF para el proveedor real y publicar DKIM |
| Rate limit real | Solo existe en cliente | Si se necesita anti-abuso, implementar en Edge Function/proxy |

## 9. Próximos pasos

1. **Desplegar** `dist/` completo, incluido `.htaccess`, a Hostinger.
2. **Aplicar** `supabase/migrations/20261022000000_harden_admin_rls.sql` y configurar el admin real.
3. **Corregir DNS** de `ideasycoloresgt.com` (SPF/DMARC/DKIM) con el proveedor de correo real.
4. Ejecutar el **Prompt C** post-despliegue y confirmar cabeceras + 403 de archivos sensibles.
5. A partir de ahora, ejecutar el **Prompt B** cada lunes y guardar el informe con la plantilla.

## 10. Firma

- Auditor: revisión automatizada + revisión manual asistida
- Fecha: 2026-10-27
- Próxima revisión: 2026-11-03
