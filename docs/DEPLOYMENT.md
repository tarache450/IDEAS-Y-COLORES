# GUÍA DE DESPLIEGUE CONTINUO & CONFIGURACIÓN DE HOSTINGER
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Hosting:** Hostinger Web Hosting  
**CI/CD:** GitHub Actions  

---

## 1. Arquitectura del Despliegue

El despliegue de la aplicación web se ejecuta de forma completamente automatizada a través de GitHub Actions en cada `push` hacia la rama `main`.

### Componentes de la Arquitectura:
1. **GitHub Repository:** Contiene el código fuente versionado en React 19 + TypeScript + Vite.
2. **GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
   - Se activa con cada `push` en la rama `main` o por activación manual (`workflow_dispatch`).
   - Configura Node.js 22 LTS.
   - Ejecuta `npm ci` para instalación limpia de dependencias.
   - Valida tipado estricto con `npm run lint` (`tsc --noEmit`).
   - Compila los artefactos de producción con `npm run build` en el directorio `./dist`.
   - Transfiere los archivos compilados a Hostinger mediante FTPS seguro (`SamKirkland/FTP-Deploy-Action@v4.3.5`).
3. **Hostinger Web Server:**
   - Servidor LiteSpeed/Apache con soporte para `.htaccess`.
   - El archivo `public/.htaccess` es copiado automáticamente a `dist/.htaccess` durante el build.
   - Gestiona la reescritura de URLs para soportar el enrutamiento de la SPA (`index.html`), fuerza HTTPS con código 301, redirige `www` a `non-www`, y aplica cabeceras de seguridad y caché estático.

---

## 2. Variables de Entorno & Secretos Requeridos en GitHub

En tu repositorio de GitHub, dirígete a:  
**Settings** → **Secrets and variables** → **Actions** → **Repository secrets**.

Configura los siguientes secretos:

| Nombre del Secreto | Descripción | Ejemplo / Valor Recomendado |
| :--- | :--- | :--- |
| `HOSTINGER_FTP_SERVER` | Servidor FTP provisto por el panel de Hostinger | `ftp.ideasycoloresgt.site` |
| `HOSTINGER_FTP_USERNAME` | Nombre de usuario de la cuenta FTP en Hostinger | `u123456789` o `deployer@ideasycoloresgt.site` |
| `HOSTINGER_FTP_PASSWORD` | Contraseña asignada para la cuenta FTP | *[Contraseña segura]* |
| `HOSTINGER_SERVER_DIR` | Directorio de destino en el hosting | `public_html/` |
| `VITE_SUPABASE_URL` | URL de tu proyecto en Supabase | `https://khagzrjxoqwzqrikomrd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase con RLS | *[Clave pública anon de Supabase]* |

> [!NOTE]
> El workflow `.github/workflows/deploy.yml` cuenta con fallbacks seguros para `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` incorporados en el paso de compilación, de modo que el bundle siempre compila exitosamente incluso si los secretos de GitHub no se han ingresado aún.

---

## 3. Despliegue Manual Alternativo (Vía Panel hPanel de Hostinger)

Si en alguna ocasión necesitas desplegar manualmente sin utilizar GitHub Actions:

1. Compila el bundle en tu computadora local:
   ```bash
   npm run build
   ```
2. Accede a tu carpeta `dist/`.
3. Comprime todo el contenido de la carpeta `dist/` en un archivo `.zip` (asegúrate de incluir el archivo oculto `.htaccess`).
4. Ingresa a **hPanel** en [https://hostinger.com](https://hostinger.com).
5. Ve a **Administrador de Archivos (File Manager)** → entra en la carpeta `public_html/`.
6. Sube el archivo `.zip` y selecciona **Extraer**.
7. Comprueba en tu navegador abriendo [https://ideasycoloresgt.site](https://ideasycoloresgt.site).
