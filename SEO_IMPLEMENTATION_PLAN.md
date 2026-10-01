# SEO Implementation Plan — Ideas & Colores Multi-Servicios

## Contexto y Alcance
- **Empresa:** Ideas & Colores Multi-Servicios
- **Ubicación Principal:** Carretera a El Salvador, Santa Catarina Pinula, Fraijanes, Ciudad de Guatemala (Área Km 14 a Km 25 y cobertura nacional).
- **Teléfono Verificado:** `+502 6661-7592` | WhatsApp: `https://wa.me/50266617592`
- **Stack Técnico:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Vanilla CSS en `index.css`.
- **Arquitectura:** Single Page Application (SPA) con secciones semánticas completas y deploy automatizado a GitHub Pages (`dist/`).

---

## Matriz de Priorización y Plan de Acción

| ID | Prioridad | Área | Archivo(s) | Problema Detectado | Solución Técnica | Riesgo | Impacto |
|---|---|---|---|---|---|---|---|
| **CRIT-01** | 🚨 Prioridad 1 | Crawling | `public/robots.txt` | Inexistente (404 al crawler) | Crear `robots.txt` permitiendo rastreo público y enlazando `sitemap.xml` | Muy bajo | Crítico para indexación |
| **CRIT-02** | 🚨 Prioridad 1 | Indexación | `public/sitemap.xml` | Inexistente (Googlebot no descubre URLs canónicas) | Crear `sitemap.xml` estándar con canónica, frecuencia, prioridad e imágenes destacadas | Muy bajo | Crítico para indexación |
| **CRIT-03** | 🚨 Prioridad 1 | Canonical | `index.html` | Falta `<link rel="canonical">` | Declarar URL canónica formal `https://ideasycoloresgt.com/` | Muy bajo | Evita canibalización y contenido duplicado |
| **CRIT-04** | 🚨 Prioridad 1 | Structured Data | `index.html` | Schema `LocalBusiness` incompleto (faltan servicios, área de servicio, FAQPage, WebSite) | Enriquecer JSON-LD con `HomeAndConstructionBusiness`, `areaServed`, `hasOfferCatalog`, `FAQPage` y `WebSite` | Muy bajo | Rich Snippets y SEO Local de alto impacto |
| **HIGH-01** | ⚠️ Prioridad 2 | Open Graph & Social | `index.html` | Faltan `og:url`, `og:site_name`, `og:image`, `og:image:width`, `og:image:height`, Twitter Card completa | Implementar etiquetas Open Graph y Twitter Cards (`summary_large_image`) con asset optimizado | Muy bajo | Conversión y visualización social en WhatsApp/Facebook |
| **HIGH-02** | ⚠️ Prioridad 2 | Internal Linking | `src/components/Header.tsx`, `src/components/Footer.tsx` | Enlaces del menú y pie de página usan `<button>` sin `href` | Convertir a `<a href="#seccion">` con `onClick` progresivo | Bajo | Crawlability directa de arquitectura interna para Googlebot |
| **HIGH-03** | ⚠️ Prioridad 2 | On-Page Metadata | `index.html` | Title y Description no mencionan zonas locales clave (Carretera a El Salvador, Fraijanes, Santa Catarina Pinula) | Optimizar Title y Meta Description para intención local sin keyword stuffing | Muy bajo | CTR orgánico y posicionamiento geolocalizado |
| **HIGH-04** | ⚠️ Prioridad 2 | Form A11y & CRO | `src/components/QuoteForm.tsx`, `src/components/ContactSection.tsx` | Inputs carecen de `id`, `name`, `htmlFor` y `autoComplete` | Añadir vinculación semántica accesible y atributos autocomplete | Muy bajo | Accesibilidad WCAG 2.1 AA y facilidad de autocompletado |
| **MED-01** | ⚠️ Prioridad 3 | Performance / LCP | `src/components/Hero.tsx`, `index.html` | Falta `fetchpriority="high"`, preconnect a fuentes y Unsplash sin optimizar | Añadir `fetchPriority="high"`, dimensiones explícitas, y preconnects/dns-prefetch | Muy bajo | Mejora métrica LCP (Core Web Vitals) |
| **MED-02** | ⚠️ Prioridad 3 | Performance / Chunking | `vite.config.ts` | Chunk principal JS supera los 590 kB | Configurar `build.rollupOptions.output.manualChunks` para separar vendor (React, Motion, Lucide) | Bajo | Mejora tiempo de carga inicial y cacheo |
| **MED-03** | ⚠️ Prioridad 3 | Image SEO & CLS | `src/components/BrandLogo.tsx`, `SolutionsSection.tsx`, `SectorsSection.tsx` | Falta width/height explícitos y alt texts descriptivos de marca | Definir width/height y optimizar textos alternativos con contexto local | Muy bajo | Prevención de Layout Shift (CLS) |
| **MED-04** | ⚠️ Prioridad 3 | NAP & Dialing | `src/components/ContactSection.tsx` | Enlace telefónico usa texto con espacios en vez de `tel:+50266617592` | Reemplazar por `tel:${BUSINESS_INFO.phoneClean}` | Muy bajo | Marcado telefónico directo en móviles |
| **OPT-01** | 💡 Prioridad 4 | Performance | `src/components/ui/ColorVisualizer.tsx` | Imagen base del visualizador usa `loading="eager"` estando bajo el pliegue | Cambiar a `loading="lazy"` para no competir por ancho de banda con el Hero | Muy bajo | Optimización de ancho de banda y FCP |
| **OPT-02** | 💡 Prioridad 4 | Geo Tags | `index.html` | Faltan geo meta tags para motores y crawlers locales | Agregar `geo.region`, `geo.placename`, `geo.position` e `ICBM` | Muy bajo | Refuerzo de entidad geográfica local |

---

## Fases de Ejecución

- **Fase A (Crawling & Indexación):** Crear `robots.txt` y `sitemap.xml`.
- **Fase B (Head & Metadata):** Actualizar `index.html` con Title, Description, Canonical, OG, Twitter, Geo Tags, Preconnects.
- **Fase C (Structured Data JSON-LD):** Implementar Schemas enriquecidos: LocalBusiness (con NAP verificado, geo, coordenadas, área servida, catálogo de servicios) + WebSite + FAQPage.
- **Fase D (Arquitectura & Internal Linking):** Refactorizar `Header.tsx` y `Footer.tsx` para enlaces `<a>` con anchor texts descriptivos y accesibles.
- **Fase E (Performance & Core Web Vitals):** Optimizar `vite.config.ts` (manualChunks), `Hero.tsx` (LCP fetchpriority="high"), y `ColorVisualizer.tsx` (lazy loading).
- **Fase F (Accesibilidad & Formularios):** Vincular labels e inputs en `QuoteForm.tsx` y `ContactSection.tsx`.
- **Fase G (Image SEO & Layout Stability):** Width/height y alt descriptivos en `BrandLogo.tsx` y componentes de imagen.
- **Fase H (Validación Técnica):** `npm run lint` (`tsc --noEmit`) y `npm run build`.
- **Fase I (Auditoría Final y Documentación):** Elaborar `SEO_AUDIT_REPORT.md` y `SEO_CHANGELOG.md`.
