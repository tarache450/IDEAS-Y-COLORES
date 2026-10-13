# IDEAS Y COLORES GT — SNAPSHOT AUDITORÍA INICIAL (BEFORE)
**Fecha:** 2026-10-13  
**Auditoría:** Phase 0 — Production & Architecture Snapshot  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Repositorio GitHub:** https://github.com/tarache450/IDEAS-Y-COLORES.git  
**Branch Activo:** `main`  
**Commit Local HEAD:** `57897b1` (ahead/behind: detrás de `origin/main` por 7 commits, HEAD remoto en `7f53c5c`)  

---

## 1. Identificación del Stack & Entorno

| Componente | Especificación / Versión |
| :--- | :--- |
| **Framework Frontend** | React 19 (`react` ^19.0.1, `react-dom` ^19.0.1) |
| **Build Tool / Bundler** | Vite 6 (`vite` ^6.2.3 / 6.4.3 en runtime) |
| **Runtime & Node.js** | Node.js v22.23.2 LTS |
| **Package Manager** | npm 10.9.8 |
| **Styling & CSS** | Tailwind CSS v4 (`@tailwindcss/vite` ^4.1.14), `tw-animate-css` |
| **Animaciones & 3D/Canvas** | Motion (`motion` ^12.23.24), GSAP (`gsap` ^3.15.0), OGL WebGL (`ogl` ^1.0.11) |
| **Iconografía** | Lucide React (`lucide-react` ^0.546.0) |
| **Tipografía** | Google Fonts: Outfit, Plus Jakarta Sans (`@fontsource-variable/geist` también en pkg) |
| **Backend & Base de Datos** | Supabase (`@supabase/supabase-js` ^2.117.3) |
| **Hosting & Infraestructura** | Hostinger Web Hosting (Apache / LiteSpeed con `.htaccess`), GitHub Actions CI/CD |
| **Servidor Web / Rewrites** | `.htaccess` con forzado HTTPS, canonical 301 www -> non-www, y fallback SPA `index.html` |

---

## 2. Estado de Git y Ramas

- **Branch actual:** `main`
- **Remote `origin/main`:** Commit `7f53c5c` (*feat(branding): add Ultra HD JPG logos with solid white background*)
- **Local `HEAD`:** Commit `57897b1` (*fix(assets): resolve relative asset paths seamlessly for GitHub Pages subpath deployment*)
- **Estado de sincronización:** Local `main` está 7 commits por detrás de `origin/main`.
- **Cambios locales pendientes (Working Tree):**
  - `package.json` y `package-lock.json` (adición de `@supabase/supabase-js`)
  - `.env.example` (documentación de variables Supabase)
  - `src/components/ContactSection.tsx` (integración con `submitQuoteRequest`, honeypot y estados de carga)
  - `src/components/QuoteForm.tsx` (integración con `submitQuoteRequest`, honeypot y reseteo seguro)
- **Archivos sin trackear (Untracked):**
  - `SUPABASE_ARCHITECTURE.md`, `SUPABASE_SETUP.md`
  - `scripts/test-validation.ts`, `scripts/verify-supabase-security.ts`
  - `src/lib/supabase.ts`, `src/services/quotes.ts`, `src/types/database.types.ts`, `supabase/`

---

## 3. Estado de Compilación Inicial

- **`npm run lint` (`tsc --noEmit`):** ✅ 0 errores de tipado TypeScript.
- **`npm run build` (`vite build`):** ✅ Compilación exitosa (5.12s).
- **Advertencias de Bundling inicial:**
  - `dist/assets/index-ARhwo0iS.js` pesa **702.21 kB** (gzip: 194.19 kB), superando el umbral de 500 kB de Vite.
  - OGL, Motion, Lucide y componentes del portal se encuentran empaquetados sin code-splitting agresivo.

---

## 4. Auditoría de Activos e Imágenes (Initial Asset Inventory)

- **Total de imágenes en `public/`:** 38 archivos visuales pesados.
- **Peso total aproximado:** > 30 MB en crudo.
- **Formatos utilizados:** JPG y PNG crudos, sin conversión optimizada a WebP o AVIF.
- **Recursos críticos detectados:**
  - `hero-interior-sala.jpg`: **725 KB** (candidato LCP Hero en homepage).
  - `public/projects/`: 18 fotografías JPG con pesos entre **600 KB y 1.3 MB** cada una (ej. `fachada-residencial-antes.jpg` = 1.3 MB, `futeca-concepcion-despues.jpg` = 1.1 MB).
  - `public/sectors/`: 6 imágenes JPG (entre 740 KB y 1.0 MB cada una).
  - `public/services/`: 6 imágenes JPG (entre 620 KB y 763 KB cada una).
  - `public/studio/`: `sala-principal-fg.png` = **1.5 MB**, fotos de color studio > 700 KB.
  - Dimensiones no adaptativas: No se emplea `srcset` ni `picture` para imágenes responsive.

---

## 5. Auditoría de SEO Inicial

- **Dominio Canónico Oficial:** `https://ideasycoloresgt.site`
- **Discrepancias de Dominio encontradas:**
  - En la rama local base todavía existían referencias residuales al dominio antiguo `ideasycoloresgt.com` en `robots.txt`, `sitemap.xml`, `src/data/content.ts` (línea 33: `website: 'www.ideasycoloresgt.com'`). En `origin/main` ya se había iniciado la corrección a `.site`.
- **Estructura de Headings:**
  - H1 único presente en Hero.
  - H2 y H3 estructurados para cada sección (Soluciones, Sectores, Calculadora, Galería, Preguntas Frecuentes).
- **Robots.txt & Sitemap.xml:**
  - `/robots.txt` activo permitiendo rastreo (`Allow: /`).
  - `/sitemap.xml` estructurado con URLs HTTPS y metadatos de imágenes.
- **Structured Data (Schema.org):**
  - Implementación con `@graph` conteniendo `HomeAndConstructionBusiness`, `WebSite`, `OfferCatalog` y `FAQPage`.
- **Open Graph & Twitter Cards:**
  - Presentes con metadatos descriptivos en `index.html`.

---

## 6. Auditoría de Seguridad & Supabase Inicial

- **Variables de Entorno:**
  - `.env` contiene variables locales y está correctamente ignorado en `.gitignore`.
  - `.env.example` documenta las variables sin exponer secretos.
  - Ningún secreto ni `service_role_key` se encuentra trackeado en Git.
- **Conexión a Supabase:**
  - Proyecto activo: `https://khagzrjxoqwzqrikomrd.supabase.co`
  - Clave pública anon verificada.
- **Auditoría de Row Level Security (RLS) en `quote_requests`:**
  - `INSERT` anónimo: ✅ Permitido (leads pueden enviar solicitudes).
  - `SELECT` anónimo: ✅ Denegado (0 registros filtrados, protección estricta de privacidad).
  - `UPDATE` anónimo: ✅ Denegado (bloqueado por RLS).
  - `DELETE` anónimo: ✅ Denegado (bloqueado por RLS).
  - Validación de campos: Frontend implementa validación con sanitización y Honeypot anti-spam.

---

## 7. Problemas Detectados Inicialmente (Resumen Before)

1. **Desincronización de Git:** El clon local está 7 commits por detrás de `origin/main`. Hay que unificar de forma limpia sin perder el trabajo local de validaciones y honeypot.
2. **Peso Excesivo de Imágenes:** Más de 30 MB en imágenes JPG/PNG de alta resolución sin compresión WebP, afectando el LCP y tiempo de carga móvil.
3. **Tamaño del Bundle JS:** Chunks de Vite superan 700 kB; se requiere code-splitting y optimización de vendor chunks.
4. **Dominio Antiguo Residual:** Referencias a `.com` en `src/data/content.ts` y sincronización de sitemap/robots.
5. **Accesibilidad:** Touch targets y etiquetas de accesibilidad en formularios interactivos y selectores de color requieren verificación exhaustiva.
6. **Manejo de Errores y Estados de Carga:** Los formularios necesitan consistencia visual entre feedback de éxito, loading spinners y fallbacks si la red falla.
