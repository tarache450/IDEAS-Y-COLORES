import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputLogo = path.resolve('public/logo-hd.png');
const inputLogoWhiteBg = path.resolve('public/logo-hd-white-bg.jpg');

const outputDirs = [
  path.resolve('public/impresion'),
  path.resolve('entrega-logos-cliente'),
  'C:\\Users\\diego\\Downloads'
];

outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Generating 300 DPI print-ready assets...');

async function generateAssets() {
  // 1. Standard Print 300 DPI Transparent PNG (3116 x 1556)
  const png300Buffer = await sharp(inputLogo)
    .withMetadata({ density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 2. Standard Print 300 DPI White BG JPG (3116 x 1556)
  const jpg300Buffer = await sharp(inputLogoWhiteBg)
    .withMetadata({ density: 300 })
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .toBuffer();

  // 3. Professional Print 300 DPI TIFF (3116 x 1556)
  const tiff300Buffer = await sharp(inputLogo)
    .withMetadata({ density: 300 })
    .tiff({ compression: 'lzw', predictor: 'horizontal' })
    .toBuffer();

  // 4. Large Format Ultra-HD 300 DPI (6232 x 3112)
  const largePng300Buffer = await sharp(inputLogo)
    .resize(6232, 3112, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 2 })
    .withMetadata({ density: 300 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 5. Large Format TIFF (6232 x 3112)
  const largeTiff300Buffer = await sharp(inputLogo)
    .resize(6232, 3112, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 2 })
    .withMetadata({ density: 300 })
    .tiff({ compression: 'lzw', predictor: 'horizontal' })
    .toBuffer();

  const filesToSave = [
    { name: 'Logo-Ideas-y-Colores-300DPI-Transparente.png', buf: png300Buffer },
    { name: 'Logo-Ideas-y-Colores-300DPI-Fondo-Blanco.jpg', buf: jpg300Buffer },
    { name: 'Logo-Ideas-y-Colores-300DPI-Imprenta.tif', buf: tiff300Buffer },
    { name: 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.png', buf: largePng300Buffer },
    { name: 'Logo-Ideas-y-Colores-GRAN-FORMATO-6232x3112-300DPI.tif', buf: largeTiff300Buffer }
  ];

  for (const dir of outputDirs) {
    for (const item of filesToSave) {
      const dest = path.join(dir, item.name);
      fs.writeFileSync(dest, item.buf);
      console.log(`Saved: ${dest} (${(item.buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('✔ All print files generated successfully with embedded 300 DPI metadata.');
}

generateAssets().catch(console.error);
