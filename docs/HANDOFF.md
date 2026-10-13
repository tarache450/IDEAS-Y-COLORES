# MANUAL DE ENTREGA & HANDOFF DE PRODUCCIÓN
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Cliente / Propietario:** Ideas & Colores GT  
**Fecha de Entrega:** 2026-10-13  
**Estado:** Producción Lista y Verificada  

---

## 1. Ficha del Producto Digital

- **Sitio Web Oficial:** [https://ideasycoloresgt.site](https://ideasycoloresgt.site)
- **Repositorio de Código:** [https://github.com/tarache450/IDEAS-Y-COLORES](https://github.com/tarache450/IDEAS-Y-COLORES)
- **Rama Oficial de Producción:** `main`
- **Hosting / Alojamiento Web:** Hostinger Web Hosting (Servidor Web Apache/LiteSpeed con soporte `.htaccess` y certificado SSL Let's Encrypt activo).
- **Base de Datos & CRM:** Supabase Database (PostgreSQL administrado con autenticación y políticas RLS).
- **Canal de Contacto Principal:** WhatsApp Business (`+502 6661-7592`).

---

## 2. Arquitectura & Flujo de Despliegue (Deploy)

El proyecto utiliza un pipeline automatizado de Integración y Entrega Continua (**CI/CD**) basado en **GitHub Actions**:

```
CAMBIO EN CÓDIGO (Local)
       ↓
npm run lint & npm run build (Validación previa obligatoria)
       ↓
git commit & git push origin main
       ↓
GitHub Actions (Workflow: deploy.yml)
       ↓
Compilación del bundle de producción (Node.js 22 LTS)
       ↓
Despliegue automático vía FTPS seguro a public_html/ de Hostinger
       ↓
Sitio en vivo actualizado en https://ideasycoloresgt.site
```

### Configuración de Secretos en GitHub (Settings → Secrets and variables → Actions):
Para habilitar el despliegue automático continuo vía FTP en GitHub Actions, se configuran las siguientes variables secretas:
1. `HOSTINGER_FTP_SERVER`: Nombre de host FTP de tu cuenta Hostinger (ej: `ftp.ideasycoloresgt.site`).
2. `HOSTINGER_FTP_USERNAME`: Usuario de cuenta FTP en Hostinger.
3. `HOSTINGER_FTP_PASSWORD`: Contraseña asignada para la cuenta FTP.
4. `VITE_SUPABASE_URL`: URL del proyecto Supabase.
5. `VITE_SUPABASE_ANON_KEY`: Clave pública anon de Supabase.

---

## 3. Gestión de Solicitudes de Cotización & CRM

1. **Captación de Clientes:**
   - Cada vez que un usuario completa el Cotizador en 3 pasos o el formulario de contacto directo, el lead se almacena de forma segura e instantánea en la tabla `quote_requests` de Supabase.
   - Cuenta con protección anti-spam silenciosa (Honeypot) para evitar correo no deseado.
2. **Acceso al Panel Administrativo CRM:**
   - Ruta de acceso: [https://ideasycoloresgt.site/admin](https://ideasycoloresgt.site/admin) o [https://ideasycoloresgt.site/#admin](https://ideasycoloresgt.site/#admin).
   - Acceso rápido por teclado: Presionar `Ctrl + Shift + A` (o `Cmd + Shift + A` en Mac) en cualquier parte del sitio web.
   - Enlace directo: Ubicado en el pie de página (Footer), en el enlace discreto *"Acceso Administrativo CRM"*.
3. **Funcionalidades del CRM:**
   - Visualización en tiempo real de leads entrantes.
   - Cambio de estado de la cotización (`Nuevo`, `Contactado`, `En proceso`, `Cotizado`, `Ganado`, `Perdido`).
   - Bitácora de notas internas de seguimiento por cliente.
   - Métricas de conversión y tasa de éxito de cotizaciones.

---

## 4. Cómo Actualizar el Sitio Web en el Futuro

Para realizar cualquier modificación en textos, fotografías o precios, el procedimiento estándar recomendado es:

1. Clonar el repositorio y crear una rama de trabajo.
2. Realizar las ediciones pertinentes en `src/data/content.ts` o componentes específicos.
3. Si agregas fotografías nuevas:
   - Conviértelas a formato **WebP** para mantener la velocidad del sitio.
   - Guárdalas en `public/projects/`, `public/sectors/` o `public/services/`.
4. Ejecutar siempre en tu terminal:
   ```bash
   npm run lint
   npm run build
   ```
5. Si no hay errores, hacer commit y push a la rama `main`:
   ```bash
   git add .
   git commit -m "feat(content): actualizar fotos de proyectos"
   git push origin main
   ```
6. Verificar en [https://ideasycoloresgt.site](https://ideasycoloresgt.site) que los cambios se reflejen correctamente.
