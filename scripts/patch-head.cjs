const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const searchBlock = `<link
      rel="preload"
      as="image"
      href="/logo.webp"
      type="image/webp"
      fetchpriority="high"
    />`;

// Buscar si contiene el preload del logo
const normalizedHtml = html.replace(/\r\n/g, '\n');
const normalizedSearch = searchBlock.replace(/\r\n/g, '\n');

if (normalizedHtml.includes(normalizedSearch)) {
  const isCrlf = html.includes('\r\n');
  const patchedNormalized = normalizedHtml.replace(
    '<!-- Preload Critical LCP Assets (Hero Image + Logo) -->',
    '<!-- Preload Critical LCP Asset (Hero Image) - Perf Optimization: avoid logo competing with critical render -->'
  ).replace(
    normalizedSearch + '\n',
    ''
  );
  const finalHtml = isCrlf ? patchedNormalized.replace(/\n/g, '\r\n') : patchedNormalized;
  fs.writeFileSync('index.html', finalHtml, 'utf8');
  console.log('Successfully patched index.html head for critical LCP asset preload.');
} else {
  console.log('Search block not found or already patched.');
}
