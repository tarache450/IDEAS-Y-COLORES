---
name: origo-responsive-qa
description: Revisa la experiencia de una web en móvil, tablet y escritorio, informando de los problemas observables de adaptación, accesibilidad y rendimiento percibido, sin dar por hecha ninguna comprobación que no se haya realizado.
license: MIT
---

# ORIGO Responsive QA

Usa esta skill antes de un lanzamiento o después de un cambio visual, cuando una web tenga que funcionar con limpieza en todos los dispositivos.

## Qué soluciona

Convierte comentarios vagos del tipo «se ve roto en el móvil» en un informe priorizado con hallazgos reproducibles y asociados a cada tamaño de pantalla.

## Regla de evidencia

Informa solo de lo que puedas observar en la URL, las capturas, el código o los resultados de pruebas que te hayan dado. Si no has tenido acceso a automatización del navegador, inspección de red o un dispositivo real, marca esa comprobación como no verificada.

## Matriz de revisión

Comprueba al menos:

- Móvil compacto: 320–390 px de ancho.
- Móvil grande o tablet: 768 px de ancho.
- Escritorio: 1280–1440 px de ancho.
- Horizontal, cuando el diseño tenga interacciones laterales.

## Qué revisar

1. Desbordamiento horizontal y contenido cortado.
2. Cabecera, navegación, ventanas emergentes y elementos fijos.
3. Zonas táctiles, estados de foco, etiquetas y acceso por teclado.
4. Tamaño del texto, longitud de línea, contraste y variantes de tema.
5. Imágenes, lienzo, vídeo y alternativas de animación.
6. Orden de carga, peticiones pesadas y saltos visibles del diseño.
7. Formularios, estados de error, enlaces y navegación externa.
8. Comportamiento con movimiento reducido y en modo de bajo consumo.

## Entrega

Devuelve una tabla con tamaño de pantalla, gravedad, evidencia, componente afectado, corrección recomendada y estado de verificación. Prioriza los bloqueos que impiden leer, navegar, contactar o comprar. Termina con una lista corta de comprobaciones para volver a probar.

Nunca afirmes que «se adapta en todas partes» a partir de un solo tamaño de pantalla ni de una versión que no se haya ejecutado.
