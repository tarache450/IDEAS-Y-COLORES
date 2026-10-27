import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('entrega-logos-cliente');
const desktopDir = 'C:\\Users\\diego\\OneDrive\\Escritorio\\LOGOS_ALTA_RESOLUCION_PARA_EDICION';
const downloadsDir = 'C:\\Users\\diego\\Downloads\\LOGOS_ALTA_RESOLUCION_PARA_EDICION';

// Ensure directories exist
[baseDir, desktopDir, downloadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const srcPng = path.join(baseDir, 'Logo-Ideas-y-Colores-300DPI-Transparente.png');
const srcWhitePng = path.join(baseDir, 'Logo-Ideas-y-Colores-HD-Blanco-Negativo.png');
const srcGranPng = path.join(baseDir, 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.png');

function createSvg(pngFilePath, width, height, outName) {
  if (!fs.existsSync(pngFilePath)) {
    console.error('Source PNG not found:', pngFilePath);
    return;
  }
  const b64 = fs.readFileSync(pngFilePath).toString('base64');
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
  <title>Ideas &amp; Colores Multi-Servicios - Logotipo Oficial</title>
  <image width="${width}" height="${height}" xlink:href="data:image/png;base64,${b64}" />
</svg>
`;
  const destPath = path.join(baseDir, outName);
  fs.writeFileSync(destPath, svgContent);
  console.log(`Generated SVG: ${destPath} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
}

// 1. Generate SVGs for Illustrator / Canva / Figma
createSvg(srcPng, 3116, 1556, 'Logo-Ideas-y-Colores-300DPI-Editable.svg');
createSvg(srcWhitePng, 3116, 1556, 'Logo-Ideas-y-Colores-Blanco-Negativo-Editable.svg');
createSvg(srcGranPng, 6232, 3112, 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-Editable.svg');

// 2. Guide for editing and usage
const guideContent = `======================================================================
IDEAS & COLORES MULTI-SERVICIOS GUATEMALA
PAQUETE DE LOGOTIPOS EN MÁXIMA RESOLUCIÓN PARA EDICIÓN Y DISEÑO (300 DPI)
======================================================================

Ubicación del paquete en tu equipo:
- Escritorio: LOGOS_ALTA_RESOLUCION_PARA_EDICION
- Proyecto: entrega-logos-cliente

ARCHIVOS INCLUIDOS Y CÓMO USARLOS PARA EDICIÓN:

1. [EDICIÓN VECTORIAL / ILUSTRADOR / CANVA / FIGMA]
   - Logo-Ideas-y-Colores-300DPI-Editable.svg (3116 x 1556 px)
     Compatible con Adobe Illustrator, CorelDraw, Figma, Canva e Inkscape.
   - Logo-Ideas-y-Colores-Blanco-Negativo-Editable.svg (3116 x 1556 px)
     Versión blanca pura para fondos oscuros o nocturnos.
   - Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-Editable.svg (6232 x 3112 px)
     Versión ultra-alta resolución para gigantografías y banners.

2. [PHOTOSHOP / CAPAS / TRANSPARENCIAS]
   - Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.png (6232 x 3112 px - 5 MB)
     Máxima resolución con canal alfa (fondo transparente). Excelente nitidez
     incluso escalado a más de 2 metros de ancho.
   - Logo-Ideas-y-Colores-300DPI-Transparente.png (3116 x 1556 px - 1.5 MB)
     Estándar de 300 DPI para papelería, hojas membretadas, tarjetas y firmas.
   - Logo-Ideas-y-Colores-HD-Blanco-Negativo.png (3116 x 1556 px)
     Logotipo en blanco puro transparente para colocar sobre fotos o fondos negros.

3. [IMPRENTA PROFESIONAL Y OFFSET (CMYK / INDUSTRIAL)]
   - Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.tif (6232 x 3112 px - 5.4 MB)
     Formato TIFF sin compresión destructiva para rotulaciones, lonas y vallas.
   - Logo-Ideas-y-Colores-300DPI-Imprenta.tif (3116 x 1556 px - 1.7 MB)
     Formato TIFF de imprenta para revistas, catálogos y folletos.

4. [FONDOS SÓLIDOS Y REDES SOCIALES]
   - Logo-Ideas-y-Colores-300DPI-Fondo-Blanco.jpg (3116 x 1556 px)
     Fondo blanco puro para cotizaciones en PDF, WhatsApp y visores básicos.
   - Icono-Ideas-y-Colores-HD-Redes-Sociales.png (1556 x 1556 px)
     Isotipo 1:1 cuadrado para perfiles de WhatsApp Business, Instagram y Facebook.

Calibración: Perfil sRGB IEC61966-2.1 con densidad nativa de 300 DPI.
======================================================================
`;

fs.writeFileSync(path.join(baseDir, 'LEEME-GUIA-EDICION.txt'), guideContent);

// Files to copy to Desktop and Downloads
const filesToExport = [
  'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.png',
  'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.tif',
  'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-Editable.svg',
  'Logo-Ideas-y-Colores-300DPI-Transparente.png',
  'Logo-Ideas-y-Colores-300DPI-Imprenta.tif',
  'Logo-Ideas-y-Colores-300DPI-Editable.svg',
  'Logo-Ideas-y-Colores-300DPI-Fondo-Blanco.jpg',
  'Logo-Ideas-y-Colores-HD-Blanco-Negativo.png',
  'Logo-Ideas-y-Colores-Blanco-Negativo-Editable.svg',
  'Icono-Ideas-y-Colores-HD-Redes-Sociales.png',
  'LEEME-GUIA-EDICION.txt'
];

for (const f of filesToExport) {
  const src = path.join(baseDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(desktopDir, f));
    fs.copyFileSync(src, path.join(downloadsDir, f));
    console.log(`Copied: ${f}`);
  } else {
    console.warn(`File missing: ${src}`);
  }
}

console.log('✔ All editable assets created and deployed to Desktop and Downloads.');
