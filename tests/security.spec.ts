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
  });
});
