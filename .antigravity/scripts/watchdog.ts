import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TARGET_URL = 'https://ideasycoloresgt.site/';
const ROOT_DIR = process.cwd();
const ANTIGRAVITY_DIR = path.join(ROOT_DIR, '.antigravity');
const STATE_FILE = path.join(ANTIGRAVITY_DIR, 'orca-state.json');
const LOG_FILE = path.join(ANTIGRAVITY_DIR, 'logs', 'watchdog.log');

const CRITICAL_MARKERS = [
  'Ideas & Colores',
  'Color que transforma espacios',
  'Airless',
  'Impermeabilización',
];

interface WatchdogResult {
  timestamp: string;
  http_status: number;
  ttfb_ms: number;
  dns_resolved: boolean;
  ssl_valid: boolean;
  headers_verified: {
    'strict-transport-security': boolean;
    'x-frame-options': boolean;
    'x-content-type-options': boolean;
    'content-security-policy': boolean;
  };
  dom_integrity: {
    markers_verified: boolean;
    missing_markers: string[];
    sha256_fingerprint: string;
    defacement_detected: boolean;
  };
  live_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  error_message?: string;
}

function ensureDirectories() {
  if (!fs.existsSync(ANTIGRAVITY_DIR)) fs.mkdirSync(ANTIGRAVITY_DIR, { recursive: true });
  const logsDir = path.join(ANTIGRAVITY_DIR, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
}

export async function runWatchdogPoll(): Promise<WatchdogResult> {
  ensureDirectories();
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(TARGET_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Antigravity-Orca-Watchdog/2.0 (+https://ideasycoloresgt.site/)',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    const ttfb_ms = Date.now() - startTime;
    const body = await response.text();

    const headers = {
      'strict-transport-security': Boolean(response.headers.get('strict-transport-security')),
      'x-frame-options': Boolean(response.headers.get('x-frame-options')),
      'x-content-type-options': Boolean(response.headers.get('x-content-type-options')),
      'content-security-policy': Boolean(response.headers.get('content-security-policy')),
    };

    const sha256 = crypto.createHash('sha256').update(body, 'utf8').digest('hex');

    const missingMarkers = CRITICAL_MARKERS.filter((marker) => !body.includes(marker));
    const markersVerified = missingMarkers.length === 0;

    let live_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (response.status !== 200 || !markersVerified) {
      live_status = 'CRITICAL';
    } else if (ttfb_ms > 800 || !headers['strict-transport-security'] || !headers['x-frame-options']) {
      live_status = 'DEGRADED';
    }

    const result: WatchdogResult = {
      timestamp,
      http_status: response.status,
      ttfb_ms,
      dns_resolved: true,
      ssl_valid: TARGET_URL.startsWith('https://'),
      headers_verified: headers,
      dom_integrity: {
        markers_verified: markersVerified,
        missing_markers: missingMarkers,
        sha256_fingerprint: sha256,
        defacement_detected: !markersVerified,
      },
      live_status,
    };

    // Log to watchdog.log
    const logLine = `[${timestamp}] [STATUS:${live_status}] HTTP:${response.status} TTFB:${ttfb_ms}ms SHA256:${sha256.substring(0, 12)}... MARKERS:${markersVerified ? 'ALL_OK' : `MISSING(${missingMarkers.join(',')})`} HEADERS(HSTS:${headers['strict-transport-security']},XFO:${headers['x-frame-options']},XCTO:${headers['x-content-type-options']},CSP:${headers['content-security-policy']})\n`;
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');

    // Update state file
    updateStateFile(result);

    return result;
  } catch (err: any) {
    const ttfb_ms = Date.now() - startTime;
    const errorResult: WatchdogResult = {
      timestamp,
      http_status: 0,
      ttfb_ms,
      dns_resolved: false,
      ssl_valid: false,
      headers_verified: {
        'strict-transport-security': false,
        'x-frame-options': false,
        'x-content-type-options': false,
        'content-security-policy': false,
      },
      dom_integrity: {
        markers_verified: false,
        missing_markers: CRITICAL_MARKERS,
        sha256_fingerprint: 'NONE',
        defacement_detected: true,
      },
      live_status: 'CRITICAL',
      error_message: err?.message || String(err),
    };

    const logLine = `[${timestamp}] [STATUS:CRITICAL] UNREACHABLE / ERROR: ${errorResult.error_message}\n`;
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');
    updateStateFile(errorResult);
    return errorResult;
  }
}

function updateStateFile(telemetryData: WatchdogResult) {
  try {
    let state: any = {};
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }

    state.last_synced_at = telemetryData.timestamp;
    state.live_status = telemetryData.live_status;
    state.telemetry = {
      timestamp: telemetryData.timestamp,
      http_status: telemetryData.http_status,
      ttfb_ms: telemetryData.ttfb_ms,
      dns_resolved: telemetryData.dns_resolved,
      ssl_valid: telemetryData.ssl_valid,
      headers_verified: telemetryData.headers_verified,
      dom_integrity: telemetryData.dom_integrity,
      error_message: telemetryData.error_message || null,
    };

    if (telemetryData.live_status !== 'HEALTHY') {
      state.incidents = state.incidents || [];
      state.incidents.push({
        id: `INC-WD-${Date.now()}`,
        source: 'T2_WATCHDOG',
        timestamp: telemetryData.timestamp,
        level: telemetryData.live_status,
        details: telemetryData.error_message || `HTTP ${telemetryData.http_status}, Missing Markers: ${telemetryData.dom_integrity.missing_markers.join(', ')}`,
      });
      // Keep last 20 incidents
      if (state.incidents.length > 20) {
        state.incidents = state.incidents.slice(-20);
      }
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to update orca-state.json from Watchdog:', err);
  }
}

async function main() {
  const isOnce = process.argv.includes('--once');
  console.log('================================================================');
  console.log(`[T2-WATCHDOG] Orca-Sentinel-Watchdog Active -> ${TARGET_URL}`);
  console.log(`Mode: ${isOnce ? 'Single-Shot Baseline Poll' : 'Continuous Loop (60s interval)'}`);
  console.log('================================================================');

  if (isOnce) {
    const res = await runWatchdogPoll();
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.live_status === 'CRITICAL' ? 1 : 0);
  }

  while (true) {
    const res = await runWatchdogPoll();
    console.log(`[${new Date().toLocaleTimeString()}] Poll completed: Status=${res.live_status} HTTP=${res.http_status} TTFB=${res.ttfb_ms}ms`);
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
}

import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase() ||
  process.argv[1].endsWith('watchdog.ts')
);

if (isDirectRun) {
  main().catch((err) => {
    console.error('[T2-WATCHDOG Fatal Error]:', err);
    process.exit(1);
  });
}
