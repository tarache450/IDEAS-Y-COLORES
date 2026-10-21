const fs = require('fs');
const path = require('path');

function getMetrics(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const c = data.categories;
  const a = data.audits;
  return {
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    fcp: a['first-contentful-paint'].numericValue,
    lcp: a['largest-contentful-paint'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    si: a['speed-index'].numericValue,
  };
}

function median(arr) {
  const sorted = [...arr].sort((a,b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
}

const dir = process.argv[2] || 'docs/evidence/perf/baseline';

['desktop', 'mobile'].forEach(device => {
  const runs = [1, 2, 3].map(i => getMetrics(path.join(dir, `${device}-${i}.json`)));
  console.log(`=== ${dir.toUpperCase()} ${device.toUpperCase()} ===`);
  runs.forEach((r, idx) => console.log(`Run ${idx+1}: Perf=${r.perf}, LCP=${(r.lcp/1000).toFixed(2)}s, TBT=${r.tbt.toFixed(0)}ms, CLS=${r.cls.toFixed(4)}, FCP=${(r.fcp/1000).toFixed(2)}s, SI=${(r.si/1000).toFixed(2)}s, A11y=${r.a11y}, BP=${r.bp}, SEO=${r.seo}`));
  console.log(`MEDIAN: Perf=${median(runs.map(r=>r.perf))}, LCP=${(median(runs.map(r=>r.lcp))/1000).toFixed(2)}s, TBT=${median(runs.map(r=>r.tbt)).toFixed(0)}ms, CLS=${median(runs.map(r=>r.cls)).toFixed(4)}, FCP=${(median(runs.map(r=>r.fcp))/1000).toFixed(2)}s, SI=${(median(runs.map(r=>r.si))/1000).toFixed(2)}s, A11y=${median(runs.map(r=>r.a11y))}, BP=${median(runs.map(r=>r.bp))}, SEO=${median(runs.map(r=>r.seo))}\n`);
});
