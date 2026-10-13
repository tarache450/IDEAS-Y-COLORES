import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const publicDir = path.resolve('public');

interface ImageInfo {
  file: string;
  relPath: string;
  sizeKb: number;
  width?: number;
  height?: number;
  format: string;
  category: string;
}

function categorize(relPath: string): string {
  if (relPath.includes('hero')) return 'HERO / LCP';
  if (relPath.includes('logo')) return 'BRANDING / ABOVE THE FOLD';
  if (relPath.includes('projects')) return 'PORTFOLIO / BELOW THE FOLD';
  if (relPath.includes('sectors')) return 'SECTORS / BELOW THE FOLD';
  if (relPath.includes('services')) return 'SERVICES / BELOW THE FOLD';
  if (relPath.includes('studio')) return 'STUDIO VISUALIZER / INTERACTIVE';
  if (relPath.includes('masks')) return 'MASKS / COLOR STUDIO';
  return 'DECORATIVE / GENERAL';
}

async function scanImages(dir: string, base: string = ''): Promise<ImageInfo[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: ImageInfo[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await scanImages(fullPath, rel)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
        const stat = fs.statSync(fullPath);
        const sizeKb = Math.round(stat.size / 1024);
        let width: number | undefined;
        let height: number | undefined;

        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          try {
            const img = await Jimp.read(fullPath);
            width = img.bitmap.width;
            height = img.bitmap.height;
          } catch {
            // Ignore unreadable images
          }
        }

        results.push({
          file: entry.name,
          relPath: rel,
          sizeKb,
          width,
          height,
          format: ext.replace('.', '').toUpperCase(),
          category: categorize(rel),
        });
      }
    }
  }

  return results;
}

async function run() {
  const images = await scanImages(publicDir);
  // Sort descending by size
  images.sort((a, b) => b.sizeKb - a.sizeKb);

  let totalKb = 0;
  console.log('| Archivo | Formato | Tamaño | Dimensiones | Ubicación | Prioridad / Categoría |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const img of images) {
    totalKb += img.sizeKb;
    console.log(
      `| \`${img.file}\` | ${img.format} | ${img.sizeKb} KB | ${img.width && img.height ? `${img.width}×${img.height}` : 'Vector/N/A'} | \`public/${img.relPath}\` | ${img.category} |`
    );
  }

  console.log(`\nTOTAL PESO DE IMÁGENES: ${Math.round(totalKb / 1024 * 10) / 10} MB across ${images.length} assets.`);
}

run();
