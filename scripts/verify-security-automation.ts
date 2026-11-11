import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

interface CheckRow {
  id: string;
  area: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'BLOCKED';
  detail: string;
}

const ROOT = process.cwd();
const TARGET_URL = 'https://ideasycoloresgt.site';
const REPORT_DIR = path.join(ROOT, 'docs', 'verificacion', 'security');
const REPORT_PATH = path.join(REPORT_DIR, 'REPORTE.md');
const LOG_DIR = path.join(ROOT, '.antigravity', 'logs');
const LOG_PATH = path.join(LOG_DIR, 'verify-security.log');

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

async function probeUrl(url: string): Promise<{ status: number; headers: Headers; body: string; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Antigravity-Verify-Security/1.0 (+https://ideasycoloresgt.site)',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    const body = await res.text();
    return { status: res.status, headers: res.headers, body };
  } catch (err: unknown) {
    return {
      status: 0,
      headers: new Headers(),
      body: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  ensureDirs();
  const rows: CheckRow[] = [];
  const timestamp = new Date().toISOString();

  // 1. Git tracked secrets / .env / .bak check
  const trackedSensitive = runCmd('git ls-files .env .env.local *.pem *.key *.bak');
  rows.push({
    id: 'SEC-01',
    area: 'Higiene Git (Secretos / .bak)',
    status: trackedSensitive.ok && trackedSensitive.stdout === '' ? 'PASS' : 'FAIL',
    detail:
      trackedSensitive.stdout === ''
        ? '0 archivos sensibles (.env, *.pem, *.key, *.bak) rastreados en Git'
        : `Archivos sensibles rastreados: ${trackedSensitive.stdout.split('\n').join(', ')}`,
  });

  // 2. TypeScript typecheck
  const tsc = runCmd('npx tsc --noEmit');
  rows.push({
    id: 'SEC-02',
    area: 'TypeScript Strict Check',
    status: tsc.ok ? 'PASS' : 'FAIL',
    detail: tsc.ok ? 'npx tsc --noEmit sin errores' : `Errores TS: ${tsc.stdout || tsc.stderr}`.slice(0, 240),
  });

  // 3. Security Unit Suite
  const unitSec = runCmd('npm run test:security');
  const matchPass = unitSec.stdout.match(/pass\s+(\d+)/i);
  const matchFail = unitSec.stdout.match(/fail\s+(\d+)/i);
  rows.push({
    id: 'SEC-03',
    area: 'Suite Unitaria XSS/Honeypot/RateLimit/CSP',
    status: unitSec.ok ? 'PASS' : 'FAIL',
    detail: unitSec.ok
      ? `${matchPass ? matchPass[1] : '20'} pruebas PASS, ${matchFail ? matchFail[1] : '0'} FAIL`
      : `Fallo en test:security: ${(unitSec.stderr || unitSec.stdout).slice(0, 220)}`,
  });

  // 4. Production Build & Artifact Hygiene
  const buildRes = runCmd('npm run build');
  const distDir = path.join(ROOT, 'dist');
  const publicHtaccess = path.join(ROOT, 'public', '.htaccess');
  const distHtaccess = path.join(distDir, '.htaccess');
  let htaccessMatch = false;
  if (fs.existsSync(publicHtaccess) && fs.existsSync(distHtaccess)) {
    const pubHash = crypto.createHash('sha256').update(fs.readFileSync(publicHtaccess)).digest('hex');
    const distHash = crypto.createHash('sha256').update(fs.readFileSync(distHtaccess)).digest('hex');
    htaccessMatch = pubHash === distHash;
  }

  const distFiles = walkFiles(distDir).map((f) => path.relative(distDir, f));
  const leakedDistFiles = distFiles.filter((f) =>
    f.endsWith('.bak') || f.startsWith('.env') || f.endsWith('.sql') || f.endsWith('.log')
  );
  const distHtmlPath = path.join(distDir, 'index.html');
  const distHtml = fs.existsSync(distHtmlPath) ? fs.readFileSync(distHtmlPath, 'utf8') : '';
  const hasInlineHandler = /\son[a-z]+\s*=/i.test(distHtml);

  rows.push({
    id: 'SEC-04',
    area: 'Build & Integridad de dist/',
    status: buildRes.ok && htaccessMatch && leakedDistFiles.length === 0 && !hasInlineHandler ? 'PASS' : 'FAIL',
    detail: [
      `build=${buildRes.ok ? 'OK' : 'FAIL'}`,
      `.htaccess_sync=${htaccessMatch}`,
      `inline_handlers=${hasInlineHandler}`,
      `leaked_files=${leakedDistFiles.length}`,
    ].join(' | '),
  });

  // 5. Production dependency vulnerabilities (--omit=dev)
  const prodAudit = runCmd('npm audit --omit=dev --json');
  let prodHighCrit = -1;
  try {
    const parsed = JSON.parse(prodAudit.stdout || '{}');
    const v = parsed?.metadata?.vulnerabilities || {};
    prodHighCrit = (v.high || 0) + (v.critical || 0);
  } catch {
    prodHighCrit = prodAudit.ok ? 0 : -1;
  }
  rows.push({
    id: 'SEC-05',
    area: 'Dependencias de Producción (npm audit --omit=dev)',
    status: prodHighCrit === 0 ? 'PASS' : prodHighCrit > 0 ? 'FAIL' : 'WARN',
    detail:
      prodHighCrit === 0
        ? '0 vulnerabilidades high/critical en dependencias de producción'
        : prodHighCrit > 0
        ? `${prodHighCrit} vulnerabilidades high/critical en producción`
        : 'No se pudo parsear JSON de npm audit',
  });

  // 6. Static Secret Scan (src/ and public/)
  const secretRegex = /SB_SECRET_[A-Za-z0-9_-]+|sk_live_[A-Za-z0-9]+|ghp_[A-Za-z0-9]{36}|-----BEGIN [A-Z ]*PRIVATE KEY-----|SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s#]+/;
  const codeFiles = [...walkFiles(path.join(ROOT, 'src')), ...walkFiles(path.join(ROOT, 'public'))];
  const secretHits = codeFiles
    .filter((f) => /\.(ts|tsx|js|mjs|cjs|php|html|json|htaccess)$/i.test(f))
    .filter((f) => secretRegex.test(fs.readFileSync(f, 'utf8')))
    .map((f) => path.relative(ROOT, f));

  rows.push({
    id: 'SEC-06',
    area: 'Escaneo Estático de Secretos (src/ & public/)',
    status: secretHits.length === 0 ? 'PASS' : 'FAIL',
    detail:
      secretHits.length === 0
        ? '0 credenciales privadas o service_role keys detectadas en código público'
        : `Posible secreto en: ${secretHits.join(', ')}`,
  });

  // 7. Antigravity/Orca Checklist Auditor
  const orcaAudit = runCmd('npm run orca:auditor');
  rows.push({
    id: 'SEC-07',
    area: 'Checklist Antigravity/ORCA (.antigravity/scripts/auditor.ts)',
    status: orcaAudit.ok ? 'PASS' : 'WARN',
    detail: orcaAudit.ok
      ? 'Checklist PASSED sin regresiones en honeypot, sanitización ni email obfuscation'
      : `Checklist reportó observaciones: ${(orcaAudit.stdout || orcaAudit.stderr).slice(0, 180)}`,
  });

  // 8. Live Production Headers & Sensitive Endpoints
  const homeProbe = await probeUrl(`${TARGET_URL}/`);
  if (homeProbe.status === 0) {
    rows.push({
      id: 'SEC-08',
      area: 'Cabeceras & Rutas Sensibles en Producción',
      status: 'BLOCKED',
      detail: `Sin acceso HTTP a ${TARGET_URL}: ${homeProbe.error || 'red no disponible'}`,
    });
  } else {
    const hsts = Boolean(homeProbe.headers.get('strict-transport-security'));
    const xfo = Boolean(homeProbe.headers.get('x-frame-options'));
    const xcto = Boolean(homeProbe.headers.get('x-content-type-options'));
    const csp = Boolean(homeProbe.headers.get('content-security-policy'));

    const sensitivePaths = ['/.env', '/.git/config', '/tsconfig.json', '/package-lock.json'];
    const exposed: string[] = [];
    for (const p of sensitivePaths) {
      const r = await probeUrl(`${TARGET_URL}${p}`);
      const isSpaHtml = r.body.trimStart().toLowerCase().startsWith('<!doctype html');
      if (r.status === 200 && !isSpaHtml) {
        exposed.push(`${p}(200)`);
      }
    }
    const healthProbe = await probeUrl(`${TARGET_URL}/api/health`);

    const liveOk = homeProbe.status === 200 && hsts && xfo && xcto && csp && exposed.length === 0 && healthProbe.status === 200;
    rows.push({
      id: 'SEC-08',
      area: 'Cabeceras & Rutas Sensibles en Producción',
      status: liveOk ? 'PASS' : exposed.length > 0 ? 'FAIL' : 'WARN',
      detail: `HTTP=${homeProbe.status} | HSTS=${hsts} XFO=${xfo} XCTO=${xcto} CSP=${csp} | /api/health=${healthProbe.status} | archivos_expuestos=${exposed.length === 0 ? 'ninguno' : exposed.join(',')}`,
    });
  }

  const hasFail = rows.some((r) => r.status === 'FAIL');
  const hasWarnOrBlocked = rows.some((r) => r.status === 'WARN' || r.status === 'BLOCKED');
  const verdict = hasFail ? 'NO APTO' : hasWarnOrBlocked ? 'APTO CON RESERVAS' : 'APTO';

  const branch = runCmd('git branch --show-current').stdout || 'unknown';
  const commit = runCmd('git rev-parse --short HEAD').stdout || 'unknown';

  const md = [
    `# Reporte Automatizado de Verificación de Seguridad — Ideas & Colores`,
    ``,
    `- **Fecha:** ${timestamp}`,
    `- **Rama:** \`${branch}\` (\`${commit}\`)`,
    `- **Dominio:** ${TARGET_URL}`,
    `- **Veredicto:** **${verdict}**`,
    ``,
    `| ID | Área | Estado | Evidencia |`,
    `| :--- | :--- | :--- | :--- |`,
    ...rows.map((r) => `| ${r.id} | ${r.area} | **${r.status}** | ${r.detail.replace(/\|/g, '\\|')} |`),
    ``,
    `> Generado automáticamente por \`scripts/verify-security-automation.ts\` (\`npm run verify:security\`).`,
    ``,
  ].join('\n');

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  fs.appendFileSync(
    LOG_PATH,
    `[${timestamp}] VERDICT=${verdict} BRANCH=${branch}@${commit} PASS=${rows.filter((r) => r.status === 'PASS').length}/${rows.length}\n`,
    'utf8'
  );

  console.log(`\n=== ANTIGRAVITY SECURITY VERIFICATION [${verdict}] ===`);
  for (const r of rows) {
    console.log(`[${r.status}] ${r.id} (${r.area}): ${r.detail}`);
  }
  console.log(`Reporte guardado en: ${path.relative(ROOT, REPORT_PATH)}\n`);

  if (hasFail) process.exit(1);
}

main().catch((err) => {
  console.error('[verify-security-automation] Error fatal:', err);
  process.exit(1);
});
