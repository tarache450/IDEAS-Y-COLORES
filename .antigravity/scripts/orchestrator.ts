import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ANTIGRAVITY_DIR = path.join(ROOT_DIR, '.antigravity');
const STATE_FILE = path.join(ANTIGRAVITY_DIR, 'orca-state.json');
const LOG_FILE = path.join(ANTIGRAVITY_DIR, 'logs', 'orchestrator.log');

interface OrcaState {
  project_id: string;
  sync_version: string;
  live_target: string;
  last_synced_at: string;
  orchestrator_state: {
    status: string;
    active_terminals: Record<string, any>;
  };
  live_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  checklist_status: 'PASSED' | 'FAILED';
  telemetry: any;
  audit: any;
  incidents: Array<{
    id: string;
    source: string;
    timestamp: string;
    level: string;
    details: string;
  }>;
}

function ensureDirectories() {
  if (!fs.existsSync(ANTIGRAVITY_DIR)) fs.mkdirSync(ANTIGRAVITY_DIR, { recursive: true });
  const logsDir = path.join(ANTIGRAVITY_DIR, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
}

function logOrchestrator(message: string) {
  ensureDirectories();
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [T1-ORCH] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf8');
}

export function evaluateState(): {
  status: 'HEALTHY' | 'CRITICAL_ALERT' | 'WARNING';
  issues: string[];
  remediations: string[];
} {
  ensureDirectories();
  if (!fs.existsSync(STATE_FILE)) {
    return {
      status: 'CRITICAL_ALERT',
      issues: ['State file .antigravity/orca-state.json does not exist'],
      remediations: ['Initialize state file or execute watchdog and auditor'],
    };
  }

  const raw = fs.readFileSync(STATE_FILE, 'utf8');
  let state: OrcaState;
  try {
    state = JSON.parse(raw);
  } catch (err: any) {
    return {
      status: 'CRITICAL_ALERT',
      issues: [`Invalid JSON in state file: ${err.message}`],
      remediations: ['Repair .antigravity/orca-state.json syntax'],
    };
  }

  const issues: string[] = [];
  const remediations: string[] = [];

  // Evaluate Live Status
  if (state.live_status === 'CRITICAL') {
    issues.push(`Target ${state.live_target} is in CRITICAL state (HTTP ${state.telemetry?.http_status || 0})`);
    if (state.telemetry?.dom_integrity?.defacement_detected) {
      issues.push(`DOM Integrity Alert: Missing markers [${(state.telemetry.dom_integrity.missing_markers || []).join(', ')}]`);
      remediations.push('Inspect Hostinger public_html deployment for defacement or 404 routing error');
    }
    remediations.push('Halt all production deployments and test host availability');
  } else if (state.live_status === 'DEGRADED') {
    issues.push(`Target ${state.live_target} is DEGRADED (Latency TTFB: ${state.telemetry?.ttfb_ms}ms or missing security headers)`);
    remediations.push('Verify .htaccess security headers and CDN/hosting response times');
  }

  // Evaluate Checklist Status
  if (state.checklist_status === 'FAILED') {
    issues.push(`Repository checklist failed (${state.audit?.failed_checks?.length || 0} failed checks)`);
    const failed = state.audit?.failed_checks || [];
    for (const f of failed) {
      issues.push(`- Check failed: ${f}`);
      if (f.includes('HONEYPOT')) {
        remediations.push('Restore hidden website_hp honeypot input in form components');
      } else if (f.includes('EMAIL')) {
        remediations.push('Replace raw email addresses with obfuscated helper functions');
      } else if (f.includes('GITIGNORE') || f.includes('SECRET')) {
        remediations.push('Remove secrets and enforce strict .gitignore rules for keys/env files');
      } else if (f.includes('SEO')) {
        remediations.push('Ensure title, canonical, and JSON-LD metadata exist in index.html');
      }
    }
  }

  const overallStatus =
    state.live_status === 'CRITICAL' || state.checklist_status === 'FAILED'
      ? 'CRITICAL_ALERT'
      : state.live_status === 'DEGRADED'
      ? 'WARNING'
      : 'HEALTHY';

  // Update orchestrator status in state file
  try {
    state.orchestrator_state.status = overallStatus === 'CRITICAL_ALERT' ? 'CRITICAL_ALERT' : 'ACTIVE';
    state.last_synced_at = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to update state file with orchestrator status:', err);
  }

  return {
    status: overallStatus,
    issues,
    remediations,
  };
}

function printEvaluation(result: ReturnType<typeof evaluateState>) {
  console.log('----------------------------------------------------------------');
  if (result.status === 'HEALTHY') {
    console.log(' STATUS: [HEALTHY] All systems operational. Zero regressions detected.');
    logOrchestrator('Evaluation completed: HEALTHY');
  } else if (result.status === 'WARNING') {
    console.log(' STATUS: [WARNING] Systems operational with minor degradations.');
    for (const issue of result.issues) {
      console.log(`  ! ${issue}`);
    }
    logOrchestrator(`Evaluation completed: WARNING - ${result.issues.join('; ')}`);
  } else {
    console.log(' STATUS: [CRITICAL_ALERT] Deployment pipeline HALTED.');
    for (const issue of result.issues) {
      console.log(`  ✖ ${issue}`);
    }
    console.log('\n Immediate Remediation Actions Required:');
    for (const rem of result.remediations) {
      console.log(`  -> ${rem}`);
    }
    logOrchestrator(`CRITICAL_ALERT raised: ${result.issues.join('; ')}`);
  }
  console.log('----------------------------------------------------------------');
}

async function main() {
  const isOnce = process.argv.includes('--once');
  console.log('================================================================');
  console.log('[T1-ORCH] Master DevSecOps Orchestrator Active');
  console.log(`Mode: ${isOnce ? 'Single-Shot Evaluation' : 'Persistent State Watcher'}`);
  console.log('================================================================');

  if (isOnce) {
    const evaluation = evaluateState();
    printEvaluation(evaluation);
    process.exit(evaluation.status === 'CRITICAL_ALERT' ? 1 : 0);
  }

  console.log('Listening for state changes in .antigravity/orca-state.json...');
  let lastModified = 0;

  const check = () => {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const stats = fs.statSync(STATE_FILE);
        if (stats.mtimeMs !== lastModified) {
          lastModified = stats.mtimeMs;
          const evaluation = evaluateState();
          printEvaluation(evaluation);
        }
      }
    } catch (err: any) {
      console.error('[T1-ORCH] Error reading state:', err.message);
    }
  };

  check();
  setInterval(check, 5000);
}

import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase() ||
  process.argv[1].endsWith('orchestrator.ts')
);

if (isDirectRun) {
  main().catch((err) => {
    console.error('[T1-ORCH Fatal Error]:', err);
    process.exit(1);
  });
}
