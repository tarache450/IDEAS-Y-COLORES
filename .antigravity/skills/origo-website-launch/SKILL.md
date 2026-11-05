---
name: origo-website-launch
description: Prepara una web para un lanzamiento controlado revisando contenido, SEO, formularios, seguridad, comportamiento en cada dispositivo y capacidad de volver atrás, sin desplegar automáticamente.
license: MIT
---

# ORIGO Website Launch

Usa esta skill cuando una web esté cerca de publicarse y el equipo necesite una revisión final tranquila y basada en evidencia.

## Qué soluciona

Reduce los errores de última hora en metadatos, enlaces, formularios, páginas legales, archivos y configuración del despliegue.

## Antes de revisar

Identifica el entorno de destino, el dominio previsto, el comando de compilación, quién es responsable del despliegue y el alcance aprobado. Nunca pidas, muestres ni guardes credenciales en el informe.

## Lista de comprobación

### Contenido y SEO

- Título, descripción, canonical, Open Graph, favicon, encabezados, textos alternativos, sitemap y robots.
- La llamada a la acción principal, los datos de contacto, los precios, los casos de éxito y los textos legales coinciden con la fuente aprobada.

### Comportamiento del producto

- Navegación, formularios, validaciones, estados de éxito y error, enlaces externos, consentimiento de analítica y comportamiento del error 404.
- Prueba en móvil compacto, tablet y escritorio, en las variantes de tema, con foco por teclado y con movimiento reducido.

### Seguridad y rendimiento

- Ningún secreto en el código, los registros, los archivos compilados ni los archivos públicos.
- Valida las URLs externas y los límites de subida de archivos.
- Confirma la carga diferida, las dimensiones de las imágenes, el almacenamiento en caché y que el resultado de la compilación es realista.

### Control de la publicación

- Registra la versión, el resultado de la compilación, las URLs de prueba rápida, el responsable y la vía para volver atrás.
- No despliegues, no fusiones cambios, no envíes mensajes ni alteres producción sin autorización explícita.

## Entrega

Devuelve `LISTO`, `LISTO CON PENDIENTES` o `BLOQUEADO`, seguido de la evidencia de cada punto, los riesgos sin resolver y la siguiente acción más pequeña. Que la compilación salga sin errores no es, por sí solo, una aprobación para lanzar.
