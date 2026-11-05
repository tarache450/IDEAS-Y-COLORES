# IDEAS & COLORES MULTI-SERVICIOS — MASTER PROJECT CONTEXT

> **Master Conversation ID:** `d7e9427f-0fce-4f4f-89a8-ee71102588c4`  
> **Single Chat Lock:** `ACTIVE`  
> **Domain:** https://ideasycoloresgt.site  
> **Corporate Email:** `gerencia@ideasycoloresgt.com`  
> **WhatsApp Routing:** `+502 6661-7592` (`50266617592`)

---

## 1. Stack & Arquitectura Principal
- **Frontend:** React 19.3, TypeScript 5.8, Vite 6.4 (`port 3001`), Tailwind CSS 4.3, Motion 12, OGL, Lucide React.
- **Backend Híbrido (Dual-Runtime):**
  1. **Node.js / TSX Server** ([index.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/index.ts)):
     - `POST /api/leads` → [leadsHandler.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/handlers/leadsHandler.ts)
     - `GET /api/health` → [healthHandler.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/handlers/healthHandler.ts)
     - Validación Zod + teléfono GT (`normalizeGuatemalaPhone`) → [leadSchema.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/validators/leadSchema.ts)
     - Almacenamiento append-only (`data/leads.jsonl`) → [leadStorage.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/services/leadStorage.ts)
     - Notificación SMTP Hostinger Titan (`smtp.hostinger.com:465`) → [mailer.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/services/mailer.ts)
  2. **PHP 8.2+ Fallback Gateway (Hostinger Apache/LiteSpeed):**
     - `public/api/leads.php` & `public/api/health.php`
     - Reglas de reescritura y cabeceras de seguridad en `public/.htaccess`
  3. **Supabase Integration:**
     - Cliente en [supabase.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/lib/supabase.ts) y servicio de cotizaciones en [quotes.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/services/quotes.ts).

---

## 2. Seguridad y Endurecimiento Aplicado
- **CORS:** Origen estricto (`https://ideasycoloresgt.site`, `https://www.ideasycoloresgt.site` + `localhost` en dev) en [cors.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/server/middleware/cors.ts).
- **Rate Limiting:** Máximo 3 envíos cada 10 minutos por IP.
- **Anti-Spam Honeypot:** Campo `website_hp` con respuesta silenciosa `200 OK`.
- **Sanitización:** Strip de HTML/scripts y escape de entidades en [security.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/utils/security.ts).
- **Suite de Pruebas:** `npm run test:security` (`tests/security.spec.ts`).

---

## 3. Módulos de Interfaz y Experiencia (UI/UX)
- **Visualizador Interactivo:** [ColorStudioVisualizer.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/ColorStudioVisualizer.tsx) + [MoodColorPicker.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/MoodColorPicker.tsx) + [FloatingColorDock.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/FloatingColorDock.tsx).
- **Calculadora de Pintura:** [PaintCalculator.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/PaintCalculator.tsx).
- **Comparador Antes/Después:** [BeforeAfterSlider.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/BeforeAfterSlider.tsx).
- **Captación de Leads y Reseñas Google:** [QuoteForm.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/QuoteForm.tsx), [TestimonialsGuaranteesSection.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/TestimonialsGuaranteesSection.tsx), [FloatingWhatsApp.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/FloatingWhatsApp.tsx).
- **Panel Administrativo:** [AdminDashboard.tsx](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/src/components/admin/AdminDashboard.tsx).

---

## 4. Automatización, Imágenes e Imprenta (Scripts)
- **Optimización WebP:** [optimize-images.mjs](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/scripts/optimize-images.mjs) y [optimize-all-images.mjs](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/scripts/optimize-all-images.mjs).
- **Activos de Imprenta 300 DPI (PNG, JPG 4:4:4, TIFF LZW y Gran Formato 6232x3112):** [generate-print-assets.mjs](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/scripts/generate-print-assets.mjs) → exporta en `public/impresion/` y `entrega-logos-cliente/`.
- **Motor ORCA (.antigravity):**
  - `npm run orca:orch` → [orchestrator.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/.antigravity/scripts/orchestrator.ts)
  - `npm run orca:watchdog` → [watchdog.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/.antigravity/scripts/watchdog.ts)
  - `npm run orca:auditor` → [auditor.ts](file:///c:/Users/diego/OneDrive/Escritorio/ia%20chamba/IDEAS-Y-COLORES/.antigravity/scripts/auditor.ts)

---

## 5. Estado Git y Últimos Hitos Consolidados
- `ad9b0b1` — Merge de optimizaciones de `main`, endurecimiento de seguridad y reseñas de Google.
- `8abcbb9` — Enlace a reseñas de Google, eliminación de comando de voz y mejoras de seguridad.
- `c186760` / `7fc5133` / `b291c8a` — Verificación completa Mobile (`V-MOBILE`) y Performance Desktop (`V-PERF`), fuentes precargadas sin CLS y lazy sections.

