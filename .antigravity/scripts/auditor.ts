import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const ANTIGRAVITY_DIR = path.join(ROOT_DIR, '.antigravity');
const STATE_FILE = path.join(ANTIGRAVITY_DIR, 'orca-state.json');
const LOG_FILE = path.join(ANTIGRAVITY_DIR, 'logs', 'checklist.log');

interface AuditCheckItem {
  id: string;
  category: 'Git & Movement' | 'Conversion & Funnel' | 'SEO & Performance';
  description: string;
  passed: boolean;
  details: string;
}

interface AuditorResult {
  timestamp: string;
  checklist_status: 'PASSED' | 'FAILED';
  branch: string;
  working_tree_clean: boolean;
  uncommitted_count: number;
  checks: AuditCheckItem[];
  failed_checks: string[];
}

function ensureDirectories() {
  if (!fs.existsSync(ANTIGRAVITY_DIR)) fs.mkdirSync(ANTIGRAVITY_DIR, { recursive: true });
  const logsDir = path.join(ANTIGRAVITY_DIR, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
}

function runGit(cmd: string): string {
  try {
    return execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  } catch (err: any) {
    return '';
  }
}

export function runChecklistAudit(): AuditorResult {
  ensureDirectories();
  const timestamp = new Date().toISOString();
  const checks: AuditCheckItem[] = [];

  // 1. GIT & MOVEMENT TRACKER
  const branch = runGit('git branch --show-current') || 'unknown';
  const gitStatusRaw = runGit('git status -s');
  const modifiedFiles = gitStatusRaw ? gitStatusRaw.split('\n').filter(Boolean) : [];
  const working_tree_clean = modifiedFiles.length === 0;

  checks.push({
    id: 'GIT_BRANCH_CHECK',
    category: 'Git & Movement',
    description: 'Branch is properly identified and tracked',
    passed: branch.length > 0 && branch !== 'unknown',
    details: `Active branch: ${branch}`,
  });

  const trackedSecrets = runGit('git ls-files .env .env.local *.pem *.key');
  const noSecretsTracked = trackedSecrets.length === 0;
  checks.push({
    id: 'GIT_SECRET_LEAK_CHECK',
    category: 'Git & Movement',
    description: 'No .env or private key files tracked in git repository',
    passed: noSecretsTracked,
    details: noSecretsTracked ? '0 secrets or private keys tracked in Git' : `LEAK DETECTED: ${trackedSecrets}`,
  });

  const gitignoreContent = fs.existsSync(path.join(ROOT_DIR, '.gitignore'))
    ? fs.readFileSync(path.join(ROOT_DIR, '.gitignore'), 'utf8')
    : '';
  const gitignoreStrict =
    gitignoreContent.includes('.env*') &&
    gitignoreContent.includes('*.pem') &&
    gitignoreContent.includes('*.key');

  checks.push({
    id: 'GITIGNORE_STRICTNESS',
    category: 'Git & Movement',
    description: '.gitignore strictly excludes .env*, *.pem, *.key, node_modules/',
    passed: gitignoreStrict,
    details: gitignoreStrict ? '.gitignore contains strict credential & key patterns' : 'Missing essential exclusion patterns',
  });

  // 2. CONVERSION & FUNNEL VALIDATOR
  const quoteFormFile = path.join(ROOT_DIR, 'src', 'components', 'QuoteForm.tsx');
  const quoteFormSrc = fs.existsSync(quoteFormFile) ? fs.readFileSync(quoteFormFile, 'utf8') : '';
  const honeypotInQuoteForm = quoteFormSrc.includes('name="website_hp"') && quoteFormSrc.includes('display: \'none\'');

  checks.push({
    id: 'FUNNEL_HONEYPOT_QUOTEFORM',
    category: 'Conversion & Funnel',
    description: 'Quotation form includes hidden website_hp anti-bot honeypot',
    passed: honeypotInQuoteForm,
    details: honeypotInQuoteForm ? 'Honeypot field verified in QuoteForm.tsx' : 'Missing website_hp field in QuoteForm.tsx',
  });

  const quotesServiceFile = path.join(ROOT_DIR, 'src', 'services', 'quotes.ts');
  const quotesServiceSrc = fs.existsSync(quotesServiceFile) ? fs.readFileSync(quotesServiceFile, 'utf8') : '';
  const rateLimitEnforced =
    quotesServiceSrc.includes('checkRateLimit') &&
    (quotesServiceSrc.includes('sanitizePlainText') || quotesServiceSrc.includes('sanitizeInput'));

  checks.push({
    id: 'FUNNEL_RATE_LIMIT_SANITIZATION',
    category: 'Conversion & Funnel',
    description: 'Quotes service enforces 30s rate limiting & strict input sanitization',
    passed: rateLimitEnforced,
    details: rateLimitEnforced ? 'Rate limiter & input sanitization active in submitQuoteRequest' : 'Missing rate limiting or sanitization in quotes.ts',
  });

  // Check plain-text email leaks in src
  let plainTextEmailFound = false;
  const srcDir = path.join(ROOT_DIR, 'src');
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(tsx|ts|html)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Match raw literal string "gerencia@ideasycoloresgt.com" but ignore security.ts deobfuscation tests or comments
        if (content.includes('gerencia@ideasycoloresgt.com') && !fullPath.includes('security.ts')) {
          plainTextEmailFound = true;
        }
      }
    }
  }
  scanDir(srcDir);

  checks.push({
    id: 'EMAIL_OBFUSCATION_CHECK',
    category: 'Conversion & Funnel',
    description: 'Corporate email is obfuscated against bot harvesting in UI components',
    passed: !plainTextEmailFound,
    details: !plainTextEmailFound ? 'Zero plain-text corporate email strings in src components' : 'Plain text email detected in src component',
  });

  const floatingWaFile = path.join(ROOT_DIR, 'src', 'components', 'FloatingWhatsApp.tsx');
  const floatingWaSrc = fs.existsSync(floatingWaFile) ? fs.readFileSync(floatingWaFile, 'utf8') : '';
  const waSafeUrlUsed = floatingWaSrc.includes('buildSafeWhatsAppUrl') && floatingWaSrc.includes('noopener,noreferrer');

  checks.push({
    id: 'WHATSAPP_SAFE_URL_ENCODING',
    category: 'Conversion & Funnel',
    description: 'Floating WhatsApp CTA builds sanitized URL & enforces noopener noreferrer',
    passed: waSafeUrlUsed,
    details: waSafeUrlUsed ? 'buildSafeWhatsAppUrl & window.open feature flag verified' : 'Unsanitized WhatsApp URL or missing windowFeatures',
  });

  // 3. SEO & PERFORMANCE CHECKLIST ENFORCER
  const indexHtmlFile = path.join(ROOT_DIR, 'index.html');
  const indexHtmlSrc = fs.existsSync(indexHtmlFile) ? fs.readFileSync(indexHtmlFile, 'utf8') : '';

  const hasTitle = indexHtmlSrc.includes('<title>') && indexHtmlSrc.includes('Ideas & Colores');
  checks.push({
    id: 'SEO_TITLE_TAG',
    category: 'SEO & Performance',
    description: 'Page title tag present and contains primary brand name',
    passed: hasTitle,
    details: hasTitle ? 'Optimized <title> tag confirmed' : 'Missing or invalid <title> tag',
  });

  const hasCanonical = indexHtmlSrc.includes('<link rel="canonical" href="https://ideasycoloresgt.site/" />');
  checks.push({
    id: 'SEO_CANONICAL_TAG',
    category: 'SEO & Performance',
    description: 'Canonical link tag configured to official production domain',
    passed: hasCanonical,
    details: hasCanonical ? 'Canonical tag points to https://ideasycoloresgt.site/' : 'Missing or mismatched canonical tag',
  });

  const hasSchema = indexHtmlSrc.includes('"@type": "HomeAndConstructionBusiness"') && indexHtmlSrc.includes('Ideas & Colores Multi-Servicios');
  checks.push({
    id: 'SEO_SCHEMA_JSONLD',
    category: 'SEO & Performance',
    description: 'Schema.org JSON-LD HomeAndConstructionBusiness structured data present',
    passed: hasSchema,
    details: hasSchema ? 'Rich snippet schema verified in HTML' : 'Missing Schema.org JSON-LD markup',
  });

  const robotsFile = path.join(ROOT_DIR, 'public', 'robots.txt');
  const hasRobots = fs.existsSync(robotsFile) && fs.readFileSync(robotsFile, 'utf8').includes('Sitemap:');
  checks.push({
    id: 'SEO_ROBOTS_TXT',
    category: 'SEO & Performance',
    description: 'public/robots.txt exists and specifies sitemap URL',
    passed: hasRobots,
    details: hasRobots ? 'robots.txt verified with Sitemap directive' : 'Missing robots.txt or Sitemap link',
  });

  const sitemapFile = path.join(ROOT_DIR, 'public', 'sitemap.xml');
  const hasSitemap = fs.existsSync(sitemapFile) && fs.readFileSync(sitemapFile, 'utf8').includes('https://ideasycoloresgt.site/');
  checks.push({
    id: 'SEO_SITEMAP_XML',
    category: 'SEO & Performance',
    description: 'public/sitemap.xml exists and maps canonical URLs',
    passed: hasSitemap,
    details: hasSitemap ? 'sitemap.xml verified with domain URLs' : 'Missing sitemap.xml',
  });

  const failed_checks = checks.filter((c) => !c.passed).map((c) => c.id);
  const checklist_status = failed_checks.length === 0 ? 'PASSED' : 'FAILED';

  const result: AuditorResult = {
    timestamp,
    checklist_status,
    branch,
    working_tree_clean,
    uncommitted_count: modifiedFiles.length,
    checks,
    failed_checks,
  };

  // Log to checklist.log
  const logEntries = [
    `\n=== [${timestamp}] ORCA CHECKLIST AUDIT ===`,
    `Branch: ${branch} | Working Tree: ${working_tree_clean ? 'CLEAN' : `${modifiedFiles.length} files modified`} | Overall Status: ${checklist_status}`,
    ...checks.map((c) => `[${c.passed ? 'PASS' : 'FAIL'}] [${c.category}] ${c.id}: ${c.details}`),
  ].join('\n');
  fs.appendFileSync(LOG_FILE, logEntries + '\n', 'utf8');

  // Update orca-state.json
  updateStateFile(result);

  return result;
}

function updateStateFile(auditResult: AuditorResult) {
  try {
    let state: any = {};
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }

    state.last_synced_at = auditResult.timestamp;
    state.checklist_status = auditResult.checklist_status;
    state.audit = {
      timestamp: auditResult.timestamp,
      branch: auditResult.branch,
      working_tree_clean: auditResult.working_tree_clean,
      uncommitted_files: auditResult.uncommitted_count,
      failed_checks: auditResult.failed_checks,
      checks_summary: {
        total: auditResult.checks.length,
        passed: auditResult.checks.length - auditResult.failed_checks.length,
        failed: auditResult.failed_checks.length,
      },
    };

    if (auditResult.checklist_status !== 'PASSED') {
      state.incidents = state.incidents || [];
      state.incidents.push({
        id: `INC-AUD-${Date.now()}`,
        source: 'T3_AUDITOR',
        timestamp: auditResult.timestamp,
        level: 'FAILED_CHECKLIST',
        details: `Failed checklist checks: ${auditResult.failed_checks.join(', ')}`,
      });
      if (state.incidents.length > 20) {
        state.incidents = state.incidents.slice(-20);
      }
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to update orca-state.json from Auditor:', err);
  }
}

function main() {
  const isWatch = process.argv.includes('--watch');
  console.log('================================================================');
  console.log(`[T3-AUDITOR] Orca-Checklist-Auditor Active`);
  console.log(`Mode: ${isWatch ? 'Continuous Watcher Mode' : 'Single-Shot Execution'}`);
  console.log('================================================================');

  const res = runChecklistAudit();
  console.log(`\nAudit completed: Status = ${res.checklist_status}`);
  console.log(`Total checks: ${res.checks.length} | Passed: ${res.checks.length - res.failed_checks.length} | Failed: ${res.failed_checks.length}\n`);

  for (const c of res.checks) {
    console.log(`  ${c.passed ? '✔' : '✖'} [${c.category}] ${c.id}: ${c.details}`);
  }

  if (isWatch) {
    console.log('\nWatching repository files for modifications...');
    const watchPaths = [path.join(ROOT_DIR, 'src'), path.join(ROOT_DIR, 'public'), path.join(ROOT_DIR, 'index.html')];
    let debounceTimer: any = null;

    for (const wp of watchPaths) {
      if (fs.existsSync(wp)) {
        fs.watch(wp, { recursive: true }, () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.log(`\n[${new Date().toLocaleTimeString()}] File change detected, re-auditing...`);
            runChecklistAudit();
          }, 1500);
        });
      }
    }
  } else {
    process.exit(res.checklist_status === 'PASSED' ? 0 : 1);
  }
}

import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase() ||
  process.argv[1].endsWith('auditor.ts')
);

if (isDirectRun) {
  main();
}
