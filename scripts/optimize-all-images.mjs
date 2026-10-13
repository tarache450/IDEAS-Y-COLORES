import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function processDirectory(dir) {
  const fullDirPath = path.join(publicDir, dir);
  if (!fs.existsSync(fullDirPath)) return;

  const files = fs.readdirSync(fullDirPath);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const fullPath = path.join(fullDirPath, file);
      const baseWithoutExt = path.basename(file, ext);
      const webpPath = path.join(fullDirPath, `${baseWithoutExt}.webp`);

      // Don't overwrite if already done and newer
      if (fs.existsSync(webpPath)) continue;

      const originalStats = fs.statSync(fullPath);
      let pipeline = sharp(fullPath);
      const metadata = await pipeline.metadata();

      if (metadata.width && metadata.width > 1280) {
        pipeline = pipeline.resize(1280, null, { withoutEnlargement: true });
      }

      await pipeline.webp({ quality: 80, effort: 6 }).toFile(webpPath);
      const webpStats = fs.statSync(webpPath);
      const savings = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);
      console.log(`✔ ${dir}/${file} (${(originalStats.size / 1024).toFixed(0)} KB) -> .webp (${(webpStats.size / 1024).toFixed(0)} KB) [-${savings}%]`);
    }
  }
}

async function run() {
  await processDirectory('projects');
  await processDirectory('sectors');
  await processDirectory('services');
  await processDirectory('studio');
}

run().catch(console.error);
