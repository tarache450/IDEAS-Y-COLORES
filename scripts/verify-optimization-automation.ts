import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

interface OptRow {
  id: string;
  metric: string;
  target: string;
  measured: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'BLOCKED';
}

const ROOT = process.cwd();
const TARGET_URL = 'https://ideasycoloresgt.site';
const REPORT_DIR = path.join(ROOT, 'docs', 'verificacion', 'optimization');
const REPORT_PATH = path.join(REPORT_DIR, 'REPORTE.md');
const LOG_DIR = path.join(ROOT, '.antigravity', 'logs');
const LOG_PATH = path.join(LOG_DIR, 'verify-optimization.log');

function ensureDirs() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function runCmd(cmd: string): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, stdout: stdout.trim(), stderr: '' };
  } catch (err: unknown) {
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    return {
      ok: false,
      stdout: (e.stdout ? String(e.stdout) : '').trim(),
      stderr: (e.stderr ? String(e.stderr) : e.message || '').trim(),
    };
  }
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function gzipSizeBytes(filePath: string): number {
  const buf = fs.readFileSync(filePath);
  return zlib.gzipSync(buf, { level: 9 }).length;
}

function fmtKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  ensureDirs();
  const rows: OptRow[] = [];
  const timestamp = new Date().toISOString();

  // 1. Clean typecheck & build
  const tsc = runCmd('npx tsc --noEmit');
  const build = runCmd('npm run build');
  rows.push({
    id: 'OPT-01',
    metric: 'Compilación & Typecheck',
    target: '0 errores TS y build limpio',
    measured: `tsc=${tsc.ok ? 'OK' : 'FAIL'}, vite build=${build.ok ? 'OK' : 'FAIL'}`,
    status: tsc.ok && build.ok ? 'PASS' : 'FAIL',
  });

  // 2. Entry JS & Modulepreload Gzip Budget
  const distDir = path.join(ROOT, 'dist');
  const distHtmlPath = path.join(distDir, 'index.html');
  const distHtml = fs.existsSync(distHtmlPath) ? fs.readFileSync(distHtmlPath, 'utf8') : '';

  const entryJsMatch = distHtml.match(/src="\/(assets\/index-[^"]+\.js)"/);
  const preloadMatches = [...distHtml.matchAll(/href="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
  const criticalJsFiles = [...new Set([...(entryJsMatch ? [entryJsMatch[1]] : []), ...preloadMatches])];

  let totalCriticalJsGzip = 0;
  const chunkDetails: string[] = [];
  for (const rel of criticalJsFiles) {
    const abs = path.join(distDir, rel);
    if (fs.existsSync(abs)) {
      const gz = gzipSizeBytes(abs);
      totalCriticalJsGzip += gz;
      chunkDetails.push(`${path.basename(rel)}:${fmtKB(gz)}`);
    }
  }

  rows.push({
    id: 'OPT-02',
    metric: 'JS Crítico Inicial (entry + modulepreload, gzip)',
    target: '≤ 230 KB gzip (presupuesto total inicial)',
    measured: `${fmtKB(totalCriticalJsGzip)} (${chunkDetails.join(', ')})`,
    status: totalCriticalJsGzip > 0 && totalCriticalJsGzip <= 230 * 1024 ? 'PASS' : 'WARN',
  });

  // 3. CSS Bundle Gzip Budget
  const cssMatch = distHtml.match(/href="\/(assets\/index-[^"]+\.css)"/);
  const cssFile = cssMatch ? path.join(distDir, cssMatch[1]) : '';
  const cssGzip = cssFile && fs.existsSync(cssFile) ? gzipSizeBytes(cssFile) : 0;
  rows.push({
    id: 'OPT-03',
    metric: 'CSS Principal (gzip)',
    target: '≤ 30 KB gzip',
    measured: cssGzip > 0 ? `${fmtKB(cssGzip)} (${path.basename(cssFile)})` : 'No encontrado',
    status: cssGzip > 0 && cssGzip <= 30 * 1024 ? 'PASS' : 'FAIL',
  });

  // 4. Image Weights & Hero LCP Asset
  const distFiles = walkFiles(distDir);
  const rasterImages = distFiles.filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f));
  const oversizedRaster = rasterImages
    .map((f) => ({ name: path.relative(distDir, f), size: fs.statSync(f).size }))
    .filter((i) => i.size > 200 * 1024);

  const heroWebp = path.join(distDir, 'hero-interior-sala.webp');
  const heroMobileWebp = path.join(distDir, 'hero-interior-sala-mobile.webp');
  const heroSize = fs.existsSync(heroWebp) ? fs.statSync(heroWebp).size : 0;
  const heroMobileSize = fs.existsSync(heroMobileWebp) ? fs.statSync(heroMobileWebp).size : 0;

  rows.push({
    id: 'OPT-04',
    metric: 'Presupuesto Imágenes Raster & Hero LCP',
    target: 'Hero ≤ 120 KB; 0 imágenes raster > 200 KB',
    measured: `Hero desktop=${fmtKB(heroSize)}, mobile=${fmtKB(heroMobileSize)}, >200KB=${oversizedRaster.length}`,
    status:
      heroSize > 0 && heroSize <= 120 * 1024 && heroMobileSize <= 120 * 1024 && oversizedRaster.length === 0
        ? 'PASS'
        : 'WARN',
  });

  // 5. Scroll & Navigation Integrity (No content-visibility anchor bug & unique tool anchors)
  const indexCss = fs.readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');
  const hasContentVisOnSections = /#soluciones[\s\S]*content-visibility:\s*auto/i.test(indexCss);
  const hasScrollMargin = /scroll-margin-top:\s*88px/i.test(indexCss);
  const colorStudioSrc = fs.readFileSync(path.join(ROOT, 'src', 'components', 'ColorStudioVisualizer.tsx'), 'utf8');
  const paintCalcSrc = fs.readFileSync(path.join(ROOT, 'src', 'components', 'PaintCalculator.tsx'), 'utf8');
  const duplicateToolIds = colorStudioSrc.includes('id="estudio-color"') || paintCalcSrc.includes('id="calculadora"');

  rows.push({
    id: 'OPT-05',
    metric: 'Integridad Scroll-Margin & Anclas de Navegación',
    target: 'scroll-margin-top activo, sin content-visibility en secciones ni IDs duplicados',
    measured: `scroll_margin=${hasScrollMargin}, content_visibility_bug=${hasContentVisOnSections}, dup_tool_ids=${duplicateToolIds}`,
    status: hasScrollMargin && !hasContentVisOnSections && !duplicateToolIds ? 'PASS' : 'FAIL',
  });

  // 6. SEO, UTF-8, Sitemap & Geo Consistency
  const srcIndexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sitemapXml = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
  const hasMojibake = /Ã[\u0080-\u00BF]/.test(srcIndexHtml) || /Ã[\u0080-\u00BF]/.test(sitemapXml);
  const hasKm215 = srcIndexHtml.includes('Km 21.5') && srcIndexHtml.includes('Fraijanes');
  const subpageSlugs = ['pintura', 'impresion', 'carpinteria', 'plomeria', 'resinas', 'instalaciones'];
  const allSubpagesInSitemap = subpageSlugs.every(
  (s) => sitemapXml.includes(`/servicios/${s}`) || sitemapXml.includes(`#servicio/${s}`)
);

  rows.push({
    id: 'OPT-06',
    metric: 'SEO, Codificación UTF-8, Geo Km 21.5 & Sitemap',
    target: 'Sin mojibake, JSON-LD Km 21.5 Fraijanes, 6 subpáginas en sitemap.xml',
    measured: `mojibake=${hasMojibake}, km21_5_fraijanes=${hasKm215}, subpages_sitemap=${allSubpagesInSitemap}`,
    status: !hasMojibake && hasKm215 && allSubpagesInSitemap ? 'PASS' : 'FAIL',
  });

  // 7. Live Production Delivery, Compression & Hash Sync
  try {
    const start = Date.now();
    const res = await fetch(`${TARGET_URL}/?v=${Date.now()}`, {
      headers: {
        'User-Agent': 'Antigravity-Verify-Optimization/1.0 (+https://ideasycoloresgt.site)',
        'Accept-Encoding': 'br, gzip, deflate',
        'Cache-Control': 'no-cache',
      },
    });
    const ttfb = Date.now() - start;
    const liveHtml = await res.text();
    const encoding = res.headers.get('content-encoding') || 'none';
    const liveEntryMatch = liveHtml.match(/src="\/(assets\/index-[^"]+\.js)"/);
    const liveJsRel = liveEntryMatch ? liveEntryMatch[1] : 'unknown';
    const localJsRel = entryJsMatch ? entryJsMatch[1] : 'unknown';
    const hashSynced = liveJsRel === localJsRel;

    let assetCacheHeader = 'n/a';
    if (liveJsRel !== 'unknown') {
      const assetRes = await fetch(`${TARGET_URL}/${liveJsRel}`, { method: 'HEAD' });
      assetCacheHeader = assetRes.headers.get('cache-control') || 'none';
    }

    rows.push({
      id: 'OPT-07',
      metric: 'Producción: TTFB, Compresión & Sincronización de Build',
      target: 'HTTP 200, TTFB ≤ 800 ms, encoding br/gzip, bundle sincronizado con local',
      measured: `HTTP=${res.status}, TTFB=${ttfb}ms, encoding=${encoding}, cache=${assetCacheHeader}, sync=${hashSynced} (live=${path.basename(liveJsRel)}, local=${path.basename(localJsRel)})`,
      status:
        res.status === 200 && ttfb <= 800 && /(br|gzip)/i.test(encoding) && hashSynced
          ? 'PASS'
          : !hashSynced
          ? 'WARN'
          : 'WARN',
    });
  } catch (err: unknown) {
    rows.push({
      id: 'OPT-07',
      metric: 'Producción: TTFB, Compresión & Sincronización de Build',
      target: 'HTTP 200 y bundle sincronizado',
      measured: `Red no disponible: ${err instanceof Error ? err.message : String(err)}`,
      status: 'BLOCKED',
    });
  }

  const hasFail = rows.some((r) => r.status === 'FAIL');
  const hasWarnOrBlocked = rows.some((r) => r.status === 'WARN' || r.status === 'BLOCKED');
  const verdict = hasFail ? 'NO APTO' : hasWarnOrBlocked ? 'APTO CON RESERVAS' : 'APTO';

  const branch = runCmd('git branch --show-current').stdout || 'unknown';
  const commit = runCmd('git rev-parse --short HEAD').stdout || 'unknown';

  const md = [
    `# Reporte Automatizado de Verificación de Optimización — Ideas & Colores`,
    ``,
    `- **Fecha:** ${timestamp}`,
    `- **Rama:** \`${branch}\` (\`${commit}\`)`,
    `- **Dominio:** ${TARGET_URL}`,
    `- **Veredicto:** **${verdict}**`,
    ``,
    `| ID | Métrica / Control | Meta | Medido | Estado |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
    ...rows.map(
      (r) =>
        `| ${r.id} | ${r.metric} | ${r.target.replace(/\|/g, '\\|')} | ${r.measured.replace(/\|/g, '\\|')} | **${r.status}** |`
    ),
    ``,
    `> Generado automáticamente por \`scripts/verify-optimization-automation.ts\` (\`npm run verify:optimization\`).`,
    ``,
  ].join('\n');

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  fs.appendFileSync(
    LOG_PATH,
    `[${timestamp}] VERDICT=${verdict} BRANCH=${branch}@${commit} PASS=${rows.filter((r) => r.status === 'PASS').length}/${rows.length}\n`,
    'utf8'
  );

  console.log(`\n=== ANTIGRAVITY OPTIMIZATION VERIFICATION [${verdict}] ===`);
  for (const r of rows) {
    console.log(`[${r.status}] ${r.id} (${r.metric}): ${r.measured}`);
  }
  console.log(`Reporte guardado en: ${path.relative(ROOT, REPORT_PATH)}\n`);

  if (hasFail) process.exit(1);
}

main().catch((err) => {
  console.error('[verify-optimization-automation] Error fatal:', err);
  process.exit(1);
});
