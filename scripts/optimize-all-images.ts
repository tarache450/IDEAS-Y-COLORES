import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

interface OptimizationResult {
  file: string;
  relPath: string;
  originalKb: number;
  webpKb: number;
  savingsPct: number;
}

const SKIP_FILES = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
];

async function optimizeDirectory(dir: string, base: string = ''): Promise<OptimizationResult[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: OptimizationResult[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await optimizeDirectory(fullPath, rel)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
      if (SKIP_FILES.includes(entry.name)) continue;
      if (entry.name.includes('.min.')) continue;

      const stat = fs.statSync(fullPath);
      const originalKb = Math.round(stat.size / 1024);
      const baseName = path.basename(entry.name, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);

      const img = sharp(fullPath);
      const meta = await img.metadata();

      if (ext === '.png') {
        // Transparent PNG (like masks or foreground elements)
        await img
          .webp({ quality: 85, effort: 6 })
          .toFile(webpPath);
      } else {
        // Photographic JPG
        await img
          .webp({ quality: 82, effort: 6 })
          .toFile(webpPath);
      }

      // Also create mobile variant for Hero LCP if width > 1000
      if (entry.name === 'hero-interior-sala.jpg') {
        const heroMobileWebp = path.join(dir, 'hero-interior-sala-mobile.webp');
        await sharp(fullPath)
          .resize(688, 384, { fit: 'cover' })
          .webp({ quality: 82, effort: 6 })
          .toFile(heroMobileWebp);
      }

      const webpStat = fs.statSync(webpPath);
      const webpKb = Math.round(webpStat.size / 1024);
      const savingsPct = Math.round(((originalKb - webpKb) / originalKb) * 100);

      results.push({
        file: entry.name,
        relPath: rel,
        originalKb,
        webpKb,
        savingsPct,
      });
    }
  }

  return results;
}

async function run() {
  console.log('Iniciando optimización integral de imágenes con Sharp...');
  const results = await optimizeDirectory(publicDir);

  let totalOrigKb = 0;
  let totalWebpKb = 0;

  console.log('\n| Imagen Original | Formato WebP | Peso Antes | Peso Después | Ahorro |');
  console.log('| :--- | :--- | :--- | :--- | :--- |');

  for (const r of results) {
    totalOrigKb += r.originalKb;
    totalWebpKb += r.webpKb;
    console.log(
      `| \`${r.relPath}\` | \`${path.basename(r.file, path.extname(r.file))}.webp\` | ${r.originalKb} KB | ${r.webpKb} KB | **${r.savingsPct}%** |`
    );
  }

  const origMb = Math.round((totalOrigKb / 1024) * 10) / 10;
  const webpMb = Math.round((totalWebpKb / 1024) * 10) / 10;
  const totalSavings = Math.round(((totalOrigKb - totalWebpKb) / totalOrigKb) * 100);

  console.log(`\n======================================================`);
  console.log(`TOTAL ORIGINAL: ${origMb} MB`);
  console.log(`TOTAL WEBP OPTIMIZADO: ${webpMb} MB`);
  console.log(`REDUCCIÓN TOTAL DE ANCHO DE BANDA: ${totalSavings}% de ahorro (${Math.round((origMb - webpMb) * 10) / 10} MB liberados)`);
  console.log(`======================================================\n`);
}

run().catch(console.error);
