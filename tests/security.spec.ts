import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  sanitizeInput,
  sanitizePlainText,
  escapeHtmlEntities,
  isValidGuatemalaPhone,
  isHoneypotTriggered,
  checkRateLimit,
  resetRateLimit,
  getDeobfuscatedCorporateEmail,
  getObfuscatedEmailDisplay,
  buildSafeMailtoUrl,
  buildSafeWhatsAppUrl,
  sanitizeCsvCell,
} from '../src/utils/security';
import {
  leadPayloadSchema,
  calculatePayloadSchema,
  sanitizeHeaderValue,
  isSafeWebhookUrl,
  checkIpRateLimit,
} from '../src/server/validators/leadSchema';
import { computePaintEstimate } from '../src/server/handlers/calculateHandler';
import { signAdminToken, verifyAdminToken } from '../src/server/handlers/adminHandler';
import backendServer from '../src/server/index';
import type { AddressInfo } from 'node:net';

const ROOT_DIR = process.cwd();

function collectFiles(dir: string, extension: RegExp): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(fullPath, extension));
    else if (extension.test(entry.name)) files.push(fullPath);
  }
  return files;
}

describe('ORCA Security Suite — IDEAS & COLORES (ideasycoloresgt.site)', () => {
  describe('1. XSS & Malicious Input Neutralization (sanitizeInput & escapeHtmlEntities)', () => {
    it('strips <script>alert(1)</script> blocks completely', () => {
      const payload = 'Cotización Pintura <script>alert(1)</script> Zona 10';
      const result = sanitizeInput(payload);
      assert.ok(!result.includes('<script>'));
      assert.ok(!result.includes('alert(1)'));
      assert.equal(result, 'Cotización Pintura  Zona 10');
    });

    it('neutralizes inline event-handler XSS vectors (<img src=x onerror=alert(1)> and <svg onload=alert(1)>)', () => {
      const imgVector = '<img src=x onerror=alert(1)>';
      const svgVector = '<svg onload=alert(1)>';
      const sanitizedImg = sanitizeInput(imgVector);
      const sanitizedSvg = sanitizeInput(svgVector);

      assert.ok(!sanitizedImg.toLowerCase().includes('onerror'));
      assert.ok(!sanitizedImg.includes('<img'));
      assert.ok(sanitizedImg.includes('&lt;img'));

      assert.ok(!sanitizedSvg.toLowerCase().includes('onload'));
      assert.ok(!sanitizedSvg.includes('<svg'));
      assert.ok(sanitizedSvg.includes('&lt;svg'));
    });

    it('strips dangerous pseudo-protocols (javascript:alert(1), data:, vbscript:)', () => {
      const jsProtocol = 'javascript:alert(1)';
      const mixedCaseProtocol = 'JaVaScRiPt: confirm(document.cookie)';
      assert.equal(sanitizeInput(jsProtocol), 'alert(1)');
      assert.equal(sanitizeInput(mixedCaseProtocol), 'confirm(document.cookie)');
    });

    it('escapes raw HTML entities accurately via escapeHtmlEntities', () => {
      const raw = `Ideas & Colores <"Cotización" '2026'>`;
      assert.equal(
        escapeHtmlEntities(raw),
        'Ideas &amp; Colores &lt;&quot;Cotización&quot; &#39;2026&#39;&gt;'
      );
      assert.equal(escapeHtmlEntities(null), '');
      assert.equal(escapeHtmlEntities(undefined), '');
    });
  });

  describe('2. Bot Honeypot Detection (isHoneypotTriggered)', () => {
    it('returns false when website_hp is empty, null, or undefined (legitimate human user)', () => {
      assert.equal(isHoneypotTriggered(''), false);
      assert.equal(isHoneypotTriggered('   '), false);
      assert.equal(isHoneypotTriggered(null), false);
      assert.equal(isHoneypotTriggered(undefined), false);
    });

    it('returns true when website_hp is populated by an automated bot', () => {
      assert.equal(isHoneypotTriggered('https://spam-seo-bot.example.com'), true);
      assert.equal(isHoneypotTriggered('bot_autofill_value'), true);
    });
  });

  describe('3. Client-Side Rate Limiting (30-second Cooldown Window)', () => {
    beforeEach(() => {
      resetRateLimit('quote_submission');
    });

    it('allows initial submission and blocks rapid-fire submissions within the 30,000ms cooldown window', () => {
      const baseTime = 1_700_000_000_000;

      const firstAttempt = checkRateLimit('quote_submission', 30_000, baseTime);
      assert.equal(firstAttempt.allowed, true);
      assert.equal(firstAttempt.remainingMs, 0);

      const rapidFireAttempt = checkRateLimit('quote_submission', 30_000, baseTime + 5_000);
      assert.equal(rapidFireAttempt.allowed, false);
      assert.equal(rapidFireAttempt.remainingMs, 25_000);
      assert.equal(rapidFireAttempt.remainingSeconds, 25);

      const boundaryAttempt = checkRateLimit('quote_submission', 30_000, baseTime + 29_999);
      assert.equal(boundaryAttempt.allowed, false);
      assert.equal(boundaryAttempt.remainingSeconds, 1);
    });

    it('allows submission again after 30,001ms or explicit resetRateLimit()', () => {
      const baseTime = 1_700_000_000_000;
      checkRateLimit('quote_submission', 30_000, baseTime);

      const afterCooldown = checkRateLimit('quote_submission', 30_000, baseTime + 30_001);
      assert.equal(afterCooldown.allowed, true);
      assert.equal(afterCooldown.remainingMs, 0);

      // Blocked immediately after second valid submission
      const blockedAgain = checkRateLimit('quote_submission', 30_000, baseTime + 31_000);
      assert.equal(blockedAgain.allowed, false);

      // Reset clears lock immediately
      resetRateLimit('quote_submission');
      const afterReset = checkRateLimit('quote_submission', 30_000, baseTime + 31_000);
      assert.equal(afterReset.allowed, true);
    });
  });

  describe('4. Guatemala Phone Number Validation (isValidGuatemalaPhone)', () => {
    it('accepts valid Guatemala local and international phone formats', () => {
      assert.equal(isValidGuatemalaPhone('+502 6661-7592'), true);
      assert.equal(isValidGuatemalaPhone('50266617592'), true);
      assert.equal(isValidGuatemalaPhone('6661-7592'), true);
      assert.equal(isValidGuatemalaPhone('5555 1234'), true);
      assert.equal(isValidGuatemalaPhone('+502 2233-4455'), true);
    });

    it('rejects invalid phone formats, SQLi payloads, and XSS strings', () => {
      assert.equal(isValidGuatemalaPhone('1234-5678'), false); // Guatemala numbers start with 2-7
      assert.equal(isValidGuatemalaPhone('123'), false);
      assert.equal(isValidGuatemalaPhone("66617592' OR '1'='1"), false);
      assert.equal(isValidGuatemalaPhone('<script>alert(1)</script>'), false);
      assert.equal(isValidGuatemalaPhone(''), false);
      assert.equal(isValidGuatemalaPhone(null), false);
    });
  });

  describe('5. Safe WhatsApp Redirect URL Builder (buildSafeWhatsAppUrl)', () => {
    it('properly encodes ampersand (&) in Ideas & Colores and enforces https://wa.me/502...', () => {
      const url = buildSafeWhatsAppUrl(
        '+502 6661-7592',
        'Hola Ideas & Colores, deseo cotizar impermeabilización.'
      );
      assert.ok(url.startsWith('https://wa.me/50266617592?text='));
      assert.ok(url.includes('Ideas%20%26%20Colores'));
    });

    it('strips <script>alert(1)</script> and HTML tags from WhatsApp message payloads', () => {
      const maliciousMessage =
        'Hola Ideas & Colores <script>alert(1)</script><img src=x onerror=alert(1)> cotización';
      const url = buildSafeWhatsAppUrl('6661-7592', maliciousMessage);

      assert.ok(url.startsWith('https://wa.me/50266617592?text='));
      const decoded = decodeURIComponent(url.split('?text=')[1]);
      assert.ok(!decoded.includes('<script>'));
      assert.ok(!decoded.includes('alert(1)'));
      assert.ok(!decoded.includes('<img'));
      assert.ok(decoded.includes('Hola Ideas & Colores'));
    });
  });

  describe('6. Corporate Email Obfuscation & CSV Formula Injection Protection', () => {
    it('reconstructs corporate email at runtime and inserts zero-width guards in display string', () => {
      const email = getDeobfuscatedCorporateEmail();
      const display = getObfuscatedEmailDisplay();

      assert.equal(email, 'gerencia@ideasycoloresgt.com');
      assert.ok(display.includes('\u200B@\u200B'));
      assert.equal(display.replace(/\u200B/g, ''), 'gerencia@ideasycoloresgt.com');
    });

    it('builds safe mailto URLs with sanitized subject and body parameters', () => {
      const mailto = buildSafeMailtoUrl(
        'Cotización <script>alert(1)</script>',
        'Proyecto Ideas & Colores'
      );
      assert.ok(mailto.startsWith('mailto:gerencia@ideasycoloresgt.com?'));
      assert.ok(!mailto.includes('script'));
      assert.ok(mailto.includes('Ideas+%26+Colores'));
    });

    it('neutralizes CSV Formula Injection payloads (=, +, -, @) with a leading single quote', () => {
      assert.equal(sanitizeCsvCell('=CMD|\' /C calc\'!A0'), `"'=CMD|' /C calc'!A0"`);
      assert.equal(sanitizeCsvCell('+SUM(A1:A10)'), `"'+SUM(A1:A10)"`);
      assert.equal(sanitizeCsvCell('-2+3+cmd'), `"'-2+3+cmd"`);
      assert.equal(sanitizeCsvCell('@IMPORTXML(...)'), `"'@IMPORTXML(...)"`);
      assert.equal(sanitizeCsvCell('Zona 10, Ciudad de Guatemala'), `"Zona 10, Ciudad de Guatemala"`);
    });
  });

  describe('7. Storage Sanitization & Static Security Configuration', () => {
    it('preserves ampersands and quotes without HTML-entity double encoding', () => {
      const input = 'Ideas & Colores "Zona 10" <script>alert(1)</script>';
      assert.equal(sanitizePlainText(input), 'Ideas & Colores "Zona 10"');
      assert.ok(!sanitizePlainText(input).includes('&amp;'));
      assert.ok(!sanitizePlainText(input).includes('&quot;'));
    });

    it('does not strip legitimate words that merely contain a protocol name', () => {
      assert.equal(sanitizePlainText('metadata: 50m²'), 'metadata: 50m²');
      assert.equal(sanitizePlainText('actualización de datos: pendiente'), 'actualización de datos: pendiente');
    });

    it('all target="_blank" elements include rel="noopener noreferrer"', () => {
      const files = collectFiles(path.join(ROOT_DIR, 'src'), /\.(tsx|ts|html)$/);
      const violations: string[] = [];
      const tagWithBlankTarget = /<[A-Za-z][A-Za-z0-9.:-]*\b[^>]*target=["']_blank["'][^>]*>/gi;

      for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        for (const match of source.matchAll(tagWithBlankTarget)) {
          const tag = match[0];
          if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(tag)) {
            violations.push(`${path.relative(ROOT_DIR, file)}: ${tag.replace(/\s+/g, ' ').slice(0, 160)}`);
          }
        }
      }

      assert.deepEqual(violations, []);
    });

    it('public/.htaccess enforces the documented transport and CSP controls', () => {
      const htaccess = fs.readFileSync(path.join(ROOT_DIR, 'public', '.htaccess'), 'utf8');
      assert.ok(htaccess.includes('max-age=63072000'));
      assert.ok(htaccess.includes("script-src-attr 'none'"));
      assert.ok(!/script-src[^;]*'unsafe-inline'/.test(htaccess));
      assert.ok(htaccess.includes("frame-ancestors 'self'"));
      assert.ok(htaccess.includes("form-action 'self'"));
      assert.ok(htaccess.includes('X-Frame-Options "SAMEORIGIN"'));
      assert.ok(htaccess.includes('X-Content-Type-Options "nosniff"'));
      assert.ok(htaccess.includes('\\.(sql|log|bak|sh|ini|conf|yml|yaml|lock)$'));
    });

    it('index.html no longer depends on inline event handlers for async CSS', () => {
      const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
      assert.ok(!/\son[a-z]+\s*=/i.test(html));
      assert.ok(fs.existsSync(path.join(ROOT_DIR, 'public', 'font-loader.js')));
    });

    it('PHP backend endpoints & bootstrap protection exist in public/api/', () => {
      for (const file of ['bootstrap.php', 'health.php', 'catalog.php', 'calculate.php', 'leads.php', 'admin.php']) {
        assert.ok(fs.existsSync(path.join(ROOT_DIR, 'public', 'api', file)), `Missing public/api/${file}`);
      }
      const htaccess = fs.readFileSync(path.join(ROOT_DIR, 'public', '.htaccess'), 'utf8');
      assert.ok(htaccess.includes('Cross-Origin-Opener-Policy "same-origin"'));
      assert.ok(htaccess.includes('RewriteRule ^api/bootstrap\\.php$ - [F,L]'));
    });
  });

  describe('8. Backend Validation, SSRF, CRLF, Estimator & Admin Token Security', () => {
    it('validates clean lead payloads and strips XSS without mutating valid business text', () => {
      const parsed = leadPayloadSchema.safeParse({
        nombre: 'Carlos <script>alert(1)</script> Pérez',
        telefono: '55551234',
        email: 'carlos@ejemplo.com',
        servicio: 'Pintura y recubrimientos',
        ubicacion: 'Fraijanes',
        metrosCuadrados: '120 m2',
        mensaje: 'Casa de 2 niveles & pérgola',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data.nombre, 'Carlos  Pérez');
        assert.equal(parsed.data.servicio, 'Pintura Airless');
        assert.equal(parsed.data.ubicacion, 'Carretera a El Salvador');
        assert.equal(parsed.data.metrosCuadrados, 120);
        assert.equal(parsed.data.mensaje, 'Casa de 2 niveles & pérgola');
      }
    });

    it('rejects malformed phones and strips SMTP CRLF header injection', () => {
      const badPhone = leadPayloadSchema.safeParse({
        nombre: 'Test Usuario',
        telefono: '12345678',
      });
      assert.equal(badPhone.success, false);
      const header = sanitizeHeaderValue("Asunto\r\nBcc: attacker@evil.test\r\n");
      assert.ok(!header.includes('\r'));
      assert.ok(!header.includes('\n'));
    });

    it('blocks private RFC1918, loopback, and metadata IPs against SSRF webhooks', () => {
      assert.equal(isSafeWebhookUrl('http://169.254.169.254/latest/meta-data'), false);
      assert.equal(isSafeWebhookUrl('https://10.0.0.5/hook'), false);
      assert.equal(isSafeWebhookUrl('https://192.168.1.10/hook'), false);
      assert.equal(isSafeWebhookUrl('https://internal.service.local/hook'), false);
      assert.equal(isSafeWebhookUrl('https://hooks.example.com/crm/leads'), true);
    });

    it('enforces estimator numeric bounds and returns accurate gallon calculations', () => {
      assert.equal(calculatePayloadSchema.safeParse({ areaM2: -10, coats: 2 }).success, false);
      assert.equal(calculatePayloadSchema.safeParse({ areaM2: 999999, coats: 2 }).success, false);
      const parsed = calculatePayloadSchema.parse({ areaM2: 100, coats: 2, surfaceType: 'liso' });
      const estimate = computePaintEstimate(parsed);
      assert.equal(estimate.totalGallons, 7);
      assert.equal(estimate.buckets5Gal, 1);
      assert.equal(estimate.remainingGallons, 2);
    });

    it('signs and verifies HMAC-SHA256 admin tokens and rejects tampered tokens', () => {
      const secret = '0123456789abcdef0123456789abcdef';
      const token = signAdminToken('admin@ideasycoloresgt.site', 300, secret);
      const claims = verifyAdminToken(token, secret);
      assert.ok(claims !== null);
      assert.equal(claims?.sub, 'admin@ideasycoloresgt.site');

      const [payload, sig] = token.split('.');
      const tampered = `${payload}.${sig.slice(0, -1)}${sig.endsWith('a') ? 'b' : 'a'}`;
      assert.equal(verifyAdminToken(tampered, secret), null);
      assert.equal(verifyAdminToken(token, 'wrong-secret-0123456789abcdef012345'), null);
    });

    it('enforces per-bucket IP rate limits independently', () => {
      const testIp = '198.51.100.77';
      assert.equal(checkIpRateLimit(testIp, 'test_bucket', 2, 60_000).allowed, true);
      assert.equal(checkIpRateLimit(testIp, 'test_bucket', 2, 60_000).allowed, true);
      assert.equal(checkIpRateLimit(testIp, 'test_bucket', 2, 60_000).allowed, false);
      assert.equal(checkIpRateLimit(testIp, 'other_bucket', 2, 60_000).allowed, true);
    });

    it('runs end-to-end Node backend endpoints (/api/health, /api/catalog, /api/calculate, /api/leads, /api/admin)', async () => {
      await new Promise<void>((resolve) => backendServer.listen(0, '127.0.0.1', () => resolve()));
      try {
        const port = (backendServer.address() as AddressInfo).port;
        const base = `http://127.0.0.1:${port}`;

        const healthRes = await fetch(`${base}/api/health`);
        assert.equal(healthRes.status, 200);
        const health = await healthRes.json();
        assert.equal(health.status, 'HEALTHY');
        assert.equal(health.checks.databaseReady, true);
        assert.equal(health.checks.dbDriver, 'sqlite');

        const catalogRes = await fetch(`${base}/api/catalog`);
        assert.equal(catalogRes.status, 200);
        const catalog = await catalogRes.json();
        assert.equal(catalog.divisions.length, 6);

        const calcRes = await fetch(`${base}/api/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ areaM2: 70, coats: 2, surfaceType: 'exterior' }),
        });
        assert.equal(calcRes.status, 200);
        const calc = await calcRes.json();
        assert.equal(calc.ok, true);
        assert.ok(calc.estimate.totalGallons > 0);

        const adminUnauth = await fetch(`${base}/api/admin/leads`);
        assert.equal(adminUnauth.status, 401);

        const leadsBadOrigin = await fetch(`${base}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'https://evil-attacker.example' },
          body: JSON.stringify({ nombre: 'Juan Perez', telefono: '55551234' }),
        });
        assert.equal(leadsBadOrigin.status, 403);

        const leadsHoneypot = await fetch(`${base}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'https://ideasycoloresgt.site' },
          body: JSON.stringify({ nombre: 'Bot Spam', telefono: '55551234', website_hp: 'http://spam.test' }),
        });
        assert.equal(leadsHoneypot.status, 200);
        const hpJson = await leadsHoneypot.json();
        assert.equal(hpJson.leadId, 'IYC-2026-HP01');
      } finally {
        await new Promise<void>((resolve) => backendServer.close(() => resolve()));
      }
    });
  });
});
