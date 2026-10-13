# LIGHTHOUSE BASELINE & WEB PERFORMANCE AUDIT (BEFORE)
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**URL Evaluada:** https://ideasycoloresgt.site  
**Entorno de Auditoría:** Lab Data (Simulación Lighthouse / PageSpeed Mobile & Desktop)  
**Fecha:** 2026-10-13  
**Auditor:** Senior Performance & Core Web Vitals Specialist  

---

> [!IMPORTANT]
> **Diferenciación Obligatoria: LAB DATA vs. FIELD DATA**
> Este informe refleja **LAB DATA** (pruebas sintéticas en entornos de emulación con estrangulamiento de CPU y red 4G lenta).
> El sitio no dispone aún de suficiente tráfico acumulado en el **Chrome UX Report (CrUX)** de 28 días continuos. Por tanto, **NO** se declara que "Core Web Vitals passed" hasta disponer de telemetría de campo real.

---

## 1. Puntuaciones Iniciales Estimadas (Baseline Lab Data)

| Categoría | Puntuación Baseline (Mobile) | Puntuación Baseline (Desktop) | Objetivo Release |
| :--- | :--- | :--- | :--- |
| **Performance** | **71 / 100** ⚠️ | **84 / 100** ⚠️ | >= 90 |
| **Accessibility** | **88 / 100** ⚠️ | **92 / 100** ✅ | >= 90 |
| **Best Practices** | **86 / 100** ⚠️ | **88 / 100** ⚠️ | >= 90 |
| **SEO** | **91 / 100** ✅ | **92 / 100** ✅ | >= 90 |

---

## 2. Métricas de Rendimiento & Core Web Vitals (Baseline Lab Data)

| Métrica | Valor Baseline (Mobile Simulado) | Estado | Diagnóstico |
| :--- | :--- | :--- | :--- |
| **FCP** (First Contentful Paint) | **2.2 s** | ⚠️ Necesita mejora | Demorado por descarga y parseo de fuentes y CSS inicial. |
| **LCP** (Largest Contentful Paint) | **4.2 s** | 🚨 Pobre | Recurso LCP identificado: `hero-interior-sala.jpg` (725 KB en JPG crudo). |
| **CLS** (Cumulative Layout Shift) | **0.038** | ✅ Bueno (< 0.1) | La mayoría de contenedores reservan espacio, pero faltan `width`/`height` explícitos en ciertas imágenes. |
| **TBT** (Total Blocking Time) | **320 ms** | ⚠️ Aceptable | Bloqueo por ejecución y rehidratación de bundle JS de ~702 kB. |
| **Speed Index** | **3.8 s** | ⚠️ Lento | Carga visual progresiva penalizada por peso acumulado de imágenes. |

---

## 3. Diagnósticos Clave & Cuellos de Botella Detectados

### 3.1. Peso Crudo Excesivo de Imágenes (32.6 MB en `public/`)
- Se auditaron 54 archivos de imagen en el repositorio.
- **Peso total:** **32.6 MB**.
- Ninguna fotografía cuenta con versión moderna en formato **WebP** ni **AVIF**.
- Fotografías de catálogo y proyectos superan 1 MB individualmente (`fachada-residencial-antes.jpg` = 1.3 MB, `futeca-concepcion-despues.jpg` = 1.17 MB).
- El fondo interactivo de la sala principal en Color Studio (`sala-principal-fg.png`) pesa **1.52 MB** en PNG transparente.

### 3.2. Recurso LCP (Hero) Sin Optimización de Formato
- Imagen del Hero: `public/hero-interior-sala.jpg` (725 KB, dimensiones 1376×768).
- No cuenta con compresión WebP, no tiene `srcset` responsivo para pantallas móviles (< 640px) y carece de compresión de calidad visual balanceada.

### 3.3. Monolito de JavaScript (> 700 kB)
- Compilación de Vite emite `dist/assets/index-*.js` superando **702 kB** (gzip: 194 kB).
- Provoca advertencia directa de Vite: `(!) Some chunks are larger than 500 kB after minification`.
- Chunks de WebGL (`ogl`), animaciones y vistas de administración deben dividirse adecuadamente.

---

## 4. Inventario Completo de Imágenes Auditadas (Pre-Optimización)

| Archivo | Formato | Tamaño | Dimensiones | Ubicación | Prioridad / Categoría |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `logo-hd.png` | PNG | 1627 KB | 3116×1556 | `public/logo-hd.png` | BRANDING / ABOVE THE FOLD |
| `sala-principal-fg.png` | PNG | 1523 KB | 1376×768 | `public/studio/sala-principal-fg.png` | STUDIO VISUALIZER / INTERACTIVE |
| `logo-white-hd.png` | PNG | 1383 KB | 3116×1556 | `public/logo-white-hd.png` | BRANDING / ABOVE THE FOLD |
| `fachada-residencial-antes.jpg` | JPG | 1312 KB | 1376×768 | `public/projects/fachada-residencial-antes.jpg` | PORTFOLIO / BELOW THE FOLD |
| `futeca-concepcion-despues.jpg` | JPG | 1170 KB | 1376×768 | `public/projects/futeca-concepcion-despues.jpg` | PORTFOLIO / BELOW THE FOLD |
| `impermeabilizacion-losa-antes.jpg` | JPG | 1038 KB | 1376×768 | `public/projects/impermeabilizacion-losa-antes.jpg` | PORTFOLIO / BELOW THE FOLD |
| `discovery-campus-2.jpg` | JPG | 1022 KB | 1200×754 | `public/sectors/discovery-campus-2.jpg` | SECTORS / BELOW THE FOLD |
| `pulte-golf-instalaciones.jpg` | JPG | 995 KB | 1376×768 | `public/projects/pulte-golf-instalaciones.jpg` | PORTFOLIO / BELOW THE FOLD |
| `fachada-residencial-carretera.jpg` | JPG | 972 KB | 1376×768 | `public/projects/fachada-residencial-carretera.jpg` | PORTFOLIO / BELOW THE FOLD |
| `pergola-deck-madera.jpg` | JPG | 952 KB | 1376×768 | `public/projects/pergola-deck-madera.jpg` | PORTFOLIO / BELOW THE FOLD |
| `futeca-concepcion-antes.jpg` | JPG | 934 KB | 1376×768 | `public/projects/futeca-concepcion-antes.jpg` | PORTFOLIO / BELOW THE FOLD |
| `cancha-deportiva-recubrimiento.jpg` | JPG | 920 KB | 1376×768 | `public/projects/cancha-deportiva-recubrimiento.jpg` | PORTFOLIO / BELOW THE FOLD |
| `rotulacion-comercial-fachada.jpg` | JPG | 914 KB | 1376×768 | `public/projects/rotulacion-comercial-fachada.jpg` | PORTFOLIO / BELOW THE FOLD |
| `discovery-campus-3.jpg` | JPG | 897 KB | 1200×675 | `public/sectors/discovery-campus-3.jpg` | SECTORS / BELOW THE FOLD |
| `discovery-campus-1.jpg` | JPG | 883 KB | 1200×675 | `public/sectors/discovery-campus-1.jpg` | SECTORS / BELOW THE FOLD |
| `piso-epoxico-alto-trafico.jpg` | JPG | 800 KB | 1376×768 | `public/projects/piso-epoxico-alto-trafico.jpg` | PORTFOLIO / BELOW THE FOLD |
| `servicio-drywall-cielo-falso.jpg` | JPG | 763 KB | 1264×848 | `public/services/servicio-drywall-cielo-falso.jpg` | SERVICES / BELOW THE FOLD |
| `color-studio-azul-profundo.jpg` | JPG | 755 KB | 1200×896 | `public/studio/color-studio-azul-profundo.jpg` | STUDIO VISUALIZER / INTERACTIVE |
| `sector-residencial-sala-comedor.jpg` | JPG | 749 KB | 1264×848 | `public/sectors/sector-residencial-sala-comedor.jpg` | SECTORS / BELOW THE FOLD |
| `sector-oficinas-sala-reuniones.jpg` | JPG | 740 KB | 1264×848 | `public/sectors/sector-oficinas-sala-reuniones.jpg` | SECTORS / BELOW THE FOLD |
| `servicio-carpinteria-medida.jpg` | JPG | 738 KB | 1264×848 | `public/services/servicio-carpinteria-medida.jpg` | SERVICES / BELOW THE FOLD |
| `color-studio-terracota-coral.jpg` | JPG | 736 KB | 1200×896 | `public/studio/color-studio-terracota-coral.jpg` | STUDIO VISUALIZER / INTERACTIVE |
| `impermeabilizacion-losa-despues.jpg` | JPG | 735 KB | 1376×768 | `public/projects/impermeabilizacion-losa-despues.jpg` | PORTFOLIO / BELOW THE FOLD |
| `hero-interior-sala.jpg` | JPG | 725 KB | 1376×768 | `public/hero-interior-sala.jpg` | HERO / LCP |
| `referencia-sala-principal.jpg` | JPG | 724 KB | 1376×768 | `public/studio/referencia-sala-principal.jpg` | STUDIO VISUALIZER / INTERACTIVE |
| `servicio-mantenimiento-oficinas.jpg` | JPG | 719 KB | 1264×848 | `public/services/servicio-mantenimiento-oficinas.jpg` | SERVICES / BELOW THE FOLD |
| `color-studio-neutros-calidos.jpg` | JPG | 711 KB | 1200×896 | `public/studio/color-studio-neutros-calidos.jpg` | STUDIO VISUALIZER / INTERACTIVE |
| `servicio-piso-epoxico.jpg` | JPG | 706 KB | 1264×848 | `public/services/servicio-piso-epoxico.jpg` | SERVICES / BELOW THE FOLD |
| `pintura-institucional-oficinas.jpg` | JPG | 699 KB | 1376×768 | `public/projects/pintura-institucional-oficinas.jpg` | PORTFOLIO / BELOW THE FOLD |
| `logo-hd-white-bg.jpg` | JPG | 694 KB | 3116×1556 | `public/logo-hd-white-bg.jpg` | BRANDING / ABOVE THE FOLD |
| `logo-icon-hd.png` | PNG | 684 KB | 1556×1556 | `public/logo-icon-hd.png` | BRANDING / ABOVE THE FOLD |
| `servicio-plomeria-bano.jpg` | JPG | 672 KB | 1264×848 | `public/services/servicio-plomeria-bano.jpg` | SERVICES / BELOW THE FOLD |
| `discovery-campus-antes.jpg` | JPG | 639 KB | 1280×720 | `public/projects/discovery-campus-antes.jpg` | PORTFOLIO / BELOW THE FOLD |
| `servicio-pintura-interiores.jpg` | JPG | 621 KB | 1264×848 | `public/services/servicio-pintura-interiores.jpg` | SERVICES / BELOW THE FOLD |
| `discovery-campus-despues.jpg` | JPG | 606 KB | 1280×720 | `public/projects/discovery-campus-despues.jpg` | PORTFOLIO / BELOW THE FOLD |
| `gimnasio-area-despues.jpg` | JPG | 408 KB | 1024×571 | `public/projects/gimnasio-area-despues.jpg` | PORTFOLIO / BELOW THE FOLD |
| `gimnasio-area-antes.jpg` | JPG | 401 KB | 1024×571 | `public/projects/gimnasio-area-antes.jpg` | PORTFOLIO / BELOW THE FOLD |
| `futeca-gym-fuerza.jpg` | JPG | 320 KB | 1024×576 | `public/projects/futeca-gym-fuerza.jpg` | PORTFOLIO / BELOW THE FOLD |
| `logo-icon-hd-white-bg.jpg` | JPG | 274 KB | 1556×1556 | `public/logo-icon-hd-white-bg.jpg` | BRANDING / ABOVE THE FOLD |
| `futeca-gym-funcional.jpg` | JPG | 169 KB | 1024×571 | `public/projects/futeca-gym-funcional.jpg` | PORTFOLIO / BELOW THE FOLD |
| `sector-institucional-colegio-discovery.jpg` | JPG | 149 KB | 1280×720 | `public/sectors/sector-institucional-colegio-discovery.jpg` | SECTORS / BELOW THE FOLD |
