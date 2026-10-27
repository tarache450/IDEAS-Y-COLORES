import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const baseDir = path.resolve('entrega-logos-cliente');
const desktopDir = 'C:\\Users\\diego\\OneDrive\\Escritorio\\LOGOS_ALTA_RESOLUCION_PARA_EDICION';
const downloadsDir = 'C:\\Users\\diego\\Downloads\\LOGOS_ALTA_RESOLUCION_PARA_EDICION';

const inputStandardPng = path.join(baseDir, 'Logo-Ideas-y-Colores-300DPI-Transparente.png');
const inputGranPng = path.join(baseDir, 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.png');
const inputIconPng = path.join(baseDir, 'Icono-Ideas-y-Colores-HD-Redes-Sociales.png');

async function run() {
  console.log('Generando versiones PNG con fondo blanco puro en alta resolución...');

  // 1. Standard 3116 x 1556 px - 300 DPI PNG Fondo Blanco
  const standardWhitePng = await sharp(inputStandardPng)
    .flatten({ background: '#ffffff' })
    .withMetadata({ density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 2. Gran Formato 6232 x 3112 px - 300 DPI PNG Fondo Blanco
  const granWhitePng = await sharp(inputGranPng)
    .flatten({ background: '#ffffff' })
    .withMetadata({ density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 3. Icono 1:1 1556 x 1556 px PNG Fondo Blanco
  const iconWhitePng = await sharp(inputIconPng)
    .flatten({ background: '#ffffff' })
    .withMetadata({ density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const generatedFiles = [
    { name: 'Logo-Ideas-y-Colores-300DPI-Fondo-Blanco.png', buf: standardWhitePng },
    { name: 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI-Fondo-Blanco.png', buf: granWhitePng },
    { name: 'Icono-Ideas-y-Colores-HD-Fondo-Blanco.png', buf: iconWhitePng }
  ];

  const targetDirs = [baseDir, desktopDir, downloadsDir];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    for (const item of generatedFiles) {
      const dest = path.join(dir, item.name);
      fs.writeFileSync(dest, item.buf);
      console.log(`Saved: ${dest} (${(item.buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('✔ PNGs con fondo blanco generados exitosamente.');
}

run().catch(console.error);
