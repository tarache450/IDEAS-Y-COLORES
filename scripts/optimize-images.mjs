import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function optimizeImages() {
  const imagesToOptimize = [
    // Hero & Studio images
    'studio/color-studio-azul-profundo.jpg',
    'studio/color-studio-terracota-coral.jpg',
    'studio/color-studio-neutros-calidos.jpg',
    'studio/referencia-sala-principal.jpg',
    'hero-interior-sala.jpg',
    // Logos
    'logo.png',
    'logo-white.png',
    // Key projects
    'projects/fachada-residencial-carretera.jpg',
    'projects/pulte-golf-instalaciones.jpg',
    'projects/pergola-deck-madera.jpg',
    'projects/piso-epoxico-alto-trafico.jpg',
    'sectors/sector-residencial-sala-comedor.jpg',
  ];

  console.log('Optimizing images...');
  for (const relPath of imagesToOptimize) {
    const fullPath = path.join(publicDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping missing: ${relPath}`);
      continue;
    }

    const ext = path.extname(relPath);
    const baseWithoutExt = relPath.slice(0, -ext.length);
    const webpPath = path.join(publicDir, `${baseWithoutExt}.webp`);

    const originalStats = fs.statSync(fullPath);
    
    // Create optimized WebP
    let pipeline = sharp(fullPath);
    const metadata = await pipeline.metadata();
    
    // Resize if excessively large for web (max width 1200)
    if (metadata.width && metadata.width > 1200) {
      pipeline = pipeline.resize(1200, null, { withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const savings = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);
    console.log(`✔ ${relPath} (${(originalStats.size / 1024).toFixed(0)} KB) -> .webp (${(webpStats.size / 1024).toFixed(0)} KB) [Saved ${savings}%]`);
  }
}

optimizeImages().catch(console.error);
