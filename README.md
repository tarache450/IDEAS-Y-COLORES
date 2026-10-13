# Ideas & Colores Multi-Servicios — Guatemala

[![Production Deployment](https://github.com/tarache450/IDEAS-Y-COLORES/actions/workflows/deploy.yml/badge.svg)](https://github.com/tarache450/IDEAS-Y-COLORES/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Production-Live-emerald?style=flat&logo=googlechrome)](https://ideasycoloresgt.site)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20RLS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

Plataforma digital oficial de **Ideas & Colores Multi-Servicios**, empresa especializada en soluciones integrales de pintura arquitectónica, mantenimiento de inmuebles, resinas epóxicas, carpintería a la medida, plomería y remodelación con sede y cobertura en Carretera a El Salvador, Santa Catarina Pinula, Fraijanes y principales zonas de Ciudad de Guatemala.

- **Dominio Oficial:** [https://ideasycoloresgt.site](https://ideasycoloresgt.site)
- **Repositorio:** [https://github.com/tarache450/IDEAS-Y-COLORES](https://github.com/tarache450/IDEAS-Y-COLORES)

---

## 1. Arquitectura & Stack Tecnológico

| Capa | Tecnologías Seleccionadas |
| :--- | :--- |
| **Frontend Core** | React 19 (`react` 19.0.1, `react-dom` 19.0.1) |
| **Lenguaje & Tipado** | TypeScript 5.8 estricto (`tsc --noEmit` en CI) |
| **Build Tool & Bundler** | Vite 6 con code splitting granular y optimización manual de vendor chunks |
| **Estilos & UI System** | Tailwind CSS v4 (`@tailwindcss/vite`), `tw-animate-css` |
| **Animaciones & Visuales** | Motion (`motion`), GSAP (`gsap`), OGL WebGL para lienzos dinámicos interactivos |
| **Iconografía** | Lucide React (`lucide-react`) |
| **Imágenes** | Formato WebP de alta fidelidad optimizado con Sharp (reducción de 84% de ancho de banda) |
| **Base de Datos & Auth** | Supabase Database (PostgreSQL con Row Level Security) |
| **Hosting & Servidor Web**| Hostinger Web Hosting (LiteSpeed / Apache con reglas personalizadas en `.htaccess`) |
| **CI / CD** | GitHub Actions (compilación automática y despliegue FTPS a `public_html/`) |

---

## 2. Requisitos Previos

- **Node.js:** Versión 20 LTS o superior (recomendado Node.js 22 LTS).
- **Gestor de Paquetes:** npm 10+.
- **Git:** Git 2.30+.

---

## 3. Instalación & Entorno de Desarrollo Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tarache450/IDEAS-Y-COLORES.git
   cd IDEAS-Y-COLORES
   ```

2. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copiar `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   Completar las variables requeridas (sin exponer secretos en Git):
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```

4. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador [http://localhost:3000](http://localhost:3000).

---

## 4. Scripts Disponibles

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite en el puerto 3000 |
| `npm run build` | Compila el bundle de producción optimizado en `./dist` |
| `npm run lint` | Ejecuta la verificación estricta de TypeScript (`tsc --noEmit`) |
| `npm run preview` | Previsualiza localmente la compilación de producción de `./dist` |
| `npm run clean` | Elimina la carpeta `./dist` |

---

## 5. Integración con Supabase & Seguridad

La plataforma utiliza Supabase exclusivamente a través de su cliente público anon protegido mediante **Row Level Security (RLS)**:

- **Público Anónimo (`anon`):**
  - `INSERT`: Permitido para captación de clientes (`quote_requests`).
  - `SELECT`, `UPDATE`, `DELETE`: Estrictamente denegados por RLS.
- **Acceso Administrativo (`authenticated`):**
  - Acceso seguro mediante inicio de sesión de personal en el portal administrativo (`/admin`).
  - Permite lectura, filtrado, actualización de estados y creación de notas en tiempo real.
- **Protección Anti-Spam:**
  - Campo Honeypot en cliente y capa de servicio para capturar y descartar bots sin alterar la base de datos.

---

## 6. Documentación Adicional del Proyecto

En el directorio [`docs/`](./docs) encontrarás los informes detallados de la entrega:

- [`docs/FINAL-QA-REPORT.md`](./docs/FINAL-QA-REPORT.md): Matriz de pruebas de calidad y resultados funcionales.
- [`docs/PERFORMANCE-REPORT.md`](./docs/PERFORMANCE-REPORT.md): Comparativa de rendimiento Before vs. After y optimizaciones de Core Web Vitals.
- [`docs/SEO-REPORT.md`](./docs/SEO-REPORT.md): Auditoría de metadatos, sitemap, robots y marcado Schema.org.
- [`docs/SECURITY-REPORT.md`](./docs/SECURITY-REPORT.md): Auditoría de seguridad, políticas RLS y cabeceras HTTP.
- [`docs/HANDOFF.md`](./docs/HANDOFF.md): Manual de entrega y guía operativa para el propietario del proyecto.
- [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md): Rutinas de mantenimiento preventivo mensual y trimestral.
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md): Flujo de CI/CD, configuración de Hostinger y secretos de GitHub.

---

## 7. Contacto & Soporte Oficial

- **Empresa:** Ideas & Colores Multi-Servicios
- **WhatsApp:** [+502 6661-7592](https://wa.me/50266617592)
- **Correo:** [gerencia@ideasycoloresgt.com](mailto:gerencia@ideasycoloresgt.com)
- **Instagram:** [@ideasycoloresgt](https://www.instagram.com/ideasycoloresgt/)
- **Ubicación:** Carretera a El Salvador, Santa Catarina Pinula / Fraijanes, Guatemala
