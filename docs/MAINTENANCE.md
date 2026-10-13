# PROTOCOLO DE MANTENIMIENTO PREVENTIVO & OPERACIONES
**Proyecto:** Ideas & Colores Multi-Servicios Guatemala  
**Dominio Oficial:** https://ideasycoloresgt.site  
**Periodicidad:** Mensual / Trimestral / Por Modificación  

---

## 1. Mantenimiento Mensual (Rutina Preventiva)

Dedicar aproximadamente 15 a 30 minutos al mes a las siguientes comprobaciones operativas:

- [ ] **Prueba de Formularios en Vivo:**
  - Realizar una cotización de prueba en el Wizard y en el formulario de contacto.
  - Verificar que el lead ingrese al panel administrativo de Supabase (`/admin`).
  - Confirmar que el botón de enlace directo a WhatsApp abra el chat con el mensaje formateado.
- [ ] **Monitoreo de Uptime y Certificado SSL:**
  - Comprobar que el dominio cargue bajo `https://` con candado verde sin advertencias de certificado.
  - Verificar que Let's Encrypt mantenga al menos 30 días de vigencia antes de renovación automática.
- [ ] **Revisión de Enlaces & Canales de Contacto:**
  - Probar llamada al enlace `tel:+50266617592` desde un teléfono móvil.
  - Verificar recepción de correos en `gerencia@ideasycoloresgt.com`.
  - Comprobar que los enlaces a Instagram y Facebook sigan activos y vigentes.
- [ ] **Inspección de Imágenes y Recursos:**
  - Revisar que ninguna fotografía arroje error 404 o muestre artefactos de carga rota.

---

## 2. Mantenimiento Trimestral (Salud Técnica & Seguridad)

- [ ] **Auditoría de Dependencias (`npm audit`):**
  - Ejecutar `npm audit` en el entorno de desarrollo para evaluar parches de seguridad en paquetes de Node.js.
  - Actualizar dependencias secundarias seguras que no introduzcan breaking changes.
- [ ] **Auditoría de Rendimiento Lighthouse:**
  - Ejecutar una prueba de Google Lighthouse sobre la URL de producción.
  - Comprobar que las puntuaciones de Rendimiento, Accesibilidad, Buenas Prácticas y SEO se mantengan >= 90.
- [ ] **Revisión de Base de Datos Supabase:**
  - Verificar el almacenamiento ocupado en la base de datos PostgreSQL.
  - Limpiar leads de prueba o spam residual que se hayan marcado como descartados.
  - Comprobar el estado de las políticas de Row Level Security (RLS).
- [ ] **Revisión en Google Search Console:**
  - Inspeccionar el estado de indexación del sitemap en `/sitemap.xml`.
  - Verificar que no existan errores de rastreo ni páginas huérfanas reportadas.

---

## 3. Protocolo Obligatorio ante Cada Modificación de Código

Siempre que se actualice código, diseño o contenidos, debe seguirse estrictamente este pipeline de estabilización:

```
           EDIT
    (Editar código en local)
            ↓
           TEST
   (Ejecutar pruebas locales)
            ↓
          BUILD
 (npm run lint && npm run build)
            ↓
          COMMIT
(Mensaje descriptivo y profesional)
            ↓
           PUSH
    (git push origin main)
            ↓
          DEPLOY
(GitHub Actions ejecuta despliegue)
            ↓
      PRODUCTION QA
(Abrir https://ideasycoloresgt.site y validar)
```

> [!WARNING]
> Nunca subir cambios a producción si el comando `npm run build` o `npm run lint` reporta errores en local. Resolver siempre los fallos antes de realizar `git push`.
