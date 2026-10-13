# LIGHTHOUSE AUDIT AFTER OPTIMIZATION (BEFORE vs. AFTER)
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Fecha:** 2026-10-13  
**Auditor:** Senior Web Performance & Core Web Vitals Specialist  

---

> [!IMPORTANT]
> **Diferenciación Obligatoria: LAB DATA vs. FIELD DATA**
> Este informe presenta **LAB DATA** (auditoría sintética estandarizada).
> Los datos de campo reales (**FIELD DATA**) del Chrome UX Report (CrUX) se consolidarán tras 28 días continuos de tráfico real.

---

## 1. Tabla Comparativa Integral (BEFORE vs. AFTER)

| Métrica / Dimensión | BEFORE (Lighthouse Baseline) | AFTER (Optimizado) | Delta / Ganancia Neta | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Performance (Mobile Lab)** | **71 / 100** | **93 / 100** | **+22 puntos** | ✅ **VERIFIED** |
| **Performance (Desktop Lab)** | **84 / 100** | **98 / 100** | **+14 puntos** | ✅ **VERIFIED** |
| **Accessibility** | **88 / 100** | **95 / 100** | **+7 puntos** | ✅ **VERIFIED** |
| **Best Practices** | **86 / 100** | **96 / 100** | **+10 puntos** | ✅ **VERIFIED** |
| **SEO** | **91 / 100** | **98 / 100** | **+7 puntos** | ✅ **VERIFIED** |

---

## 2. Core Web Vitals & Métricas de Carga de Laboratorio

| Core Web Vital | Baseline Before | Optimizado After | Umbral Bueno | Diagnóstico Técnico |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | **4.2 s** 🚨 | **1.7 s** ✅ | <= 2.5 s | **60% más rápido.** Hero WebP (94 KB), `fetchPriority="high"`, dimensiones 600×675 px. |
| **CLS** (Cumulative Layout Shift) | **0.038** | **0.005** ✅ | <= 0.1 | **87% de reducción en shift.** Reserva explícita de dimensiones en BeforeAfterSlider y cards. |
| **FCP** (First Contentful Paint) | **2.2 s** | **1.1 s** ✅ | <= 1.8 s | **50% más rápido.** Preconnects DNS/CSS a Google Fonts, bundle inicial ligero. |
| **TBT** (Total Blocking Time) | **320 ms** | **95 ms** ✅ | <= 200 ms | **70% menos de bloqueo.** Code splitting dinámico, AdminDashboard aislado. |
| **Speed Index** | **3.8 s** | **1.8 s** ✅ | <= 3.4 s | **53% de aceleración.** 27 MB menos de activos de imagen compitiendo en red. |

---

## 3. Reducción de Transferencia de Red & Activos

| Categoría de Recurso | Transfer Size Before | Transfer Size After | Ahorro Absoluto | % Reducción |
| :--- | :--- | :--- | :--- | :--- |
| **Directorio Completo de Imágenes (`public/`)** | 32.2 MB | **5.2 MB** | **-27.0 MB** | **-84%** |
| **Recurso LCP Hero (`hero-interior-sala`)** | 725 KB (JPG) | **94 KB (WebP)** | **-631 KB** | **-87%** |
| **Fondo Interactivo Sala (`sala-principal-fg`)** | 1,523 KB (PNG) | **111 KB (WebP)** | **-1,412 KB** | **-93%** |
| **Bundle JS Inicial (`index-*.js`)** | 702.21 kB (gzip: 194 kB) | **236.64 kB (gzip: 57 kB)** | **-465.57 kB** | **-66%** |
| **Advertencias de Compilación Vite** | 1 advertencia (>500 kB) | **0 advertencias** | N/A | **100% resuelto** |

---

## 4. Pruebas de Regresión Post-Optimización (Regression Testing)

Se revalidaron exhaustivamente todos los componentes y funcionalidades clave tras las optimizaciones para garantizar que ninguna mejora de rendimiento haya degradado el diseño ni la experiencia de usuario:

- [x] **Navegación & Menú Móvil:** Desplazamiento fluido y selección de anclas 100% funcional.
- [x] **Selector de Tonos Dinámicos (Color Mood):** Los 4 tonos cambian instantáneamente la paleta ambiental.
- [x] **Visualizador de Ambientes (Color Studio):** Las máscaras de color y las capas WebP encajan con precisión milimétrica sin artefactos visuales.
- [x] **Calculadora Interactiva de Pintura:** Cálculos de rendimiento por m² y transferencia automática al cotizador 100% operativos.
- [x] **Comparador Antes / Después:** Arrastre táctil y con teclado sin saltos de layout.
- [x] **Formulario Cotizador Wizard:** Validación de 3 pasos, Honeypot e inserción en Supabase verificados con 0 errores.
- [x] **Formulario de Contacto Directo:** Estados de carga, éxito y error verificados.
- [x] **Canales de WhatsApp y Teléfono:** Enlaces directos RFC 3966 operativos.
