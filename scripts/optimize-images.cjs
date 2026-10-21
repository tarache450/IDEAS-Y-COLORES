const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGETS = [
  {
    path: 'public/hero-interior-sala.jpg',
    targetSizeKb: 120,
    async run(file) {
      const buf = fs.readFileSync(file);
      const out = await sharp(buf)
        .resize({ width: 1400, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true, progressive: true })
        .toBuffer();
      return out;
    }
  },
  {
    path: 'public/projects/futeca-concepcion-despues.webp',
    targetSizeKb: 120,
    async run(file) {
      const buf = fs.readFileSync(file);
      const out = await sharp(buf)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      return out;
    }
  },
  {
    path: 'public/projects/futeca-concepcion-antes.webp',
    targetSizeKb: 120,
    async run(file) {
      const buf = fs.readFileSync(file);
      const out = await sharp(buf)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      return out;
    }
  }
];

async function main() {
  console.log('--- OPTIMIZADOR DE IMAGENES CRITICAS ---');
  for (const item of TARGETS) {
    if (!fs.existsSync(item.path)) {
      console.warn('No existe:', item.path);
      continue;
    }
    const origSize = fs.statSync(item.path).size;
    const optimized = await item.run(item.path);
    const newSize = optimized.length;
    console.log(`${item.path}: ${(origSize/1024).toFixed(1)} KB -> ${(newSize/1024).toFixed(1)} KB (-${((1 - newSize/origSize)*100).toFixed(1)}%)`);
    // Guardar backup si no existe
    const bak = item.path + '.bak';
    if (!fs.existsSync(bak)) {
      fs.copyFileSync(item.path, bak);
    }
    fs.writeFileSync(item.path, optimized);
  }
  console.log('Optimización de imágenes completada.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
