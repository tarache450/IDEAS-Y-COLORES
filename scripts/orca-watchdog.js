import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TARGET_URL = 'https://ideasycoloresgt.site/';
const LOG_FILE = path.join('.antigravity', 'logs', 'watchdog.log');
const STATE_FILE = path.join('.antigravity', 'orca-state.json');
const INTERVAL_SECONDS = 60;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(LOG_FILE);

console.log('============================================================');
console.log(' [ORCA-SENTINEL-WATCHDOG] T2 ACTIVA - MONITOREANDO EN VIVO');
console.log(` Target: ${TARGET_URL} | Intervalo: ${INTERVAL_SECONDS}s`);
console.log('============================================================');

function fetchMetrics(targetUrl) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    let sslStatus = 0;
    const req = client.get(targetUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'ORCA-Sentinel-Watchdog/2.0 (+https://ideasycoloresgt.site)'
      }
    }, (res) => {
      // Follow redirect if 301/302/307/308
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        fetchMetrics(nextUrl).then(resolve);
        return;
      }

      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationSeconds = (Number(endTime - startTime) / 1e9).toFixed(3);
        resolve({
          httpCode: res.statusCode || 0,
          timeTotal: durationSeconds,
          sslStatus: sslStatus,
          headers: res.headers,
          body: rawData,
          error: null
        });
      });
    });

    req.on('error', (err) => {
      const endTime = process.hrtime.bigint();
      const durationSeconds = (Number(endTime - startTime) / 1e9).toFixed(3);
      if (err.code && (err.code.includes('CERT') || err.code.includes('SSL'))) {
        sslStatus = 1;
      }
      resolve({
        httpCode: 0,
        timeTotal: durationSeconds,
        sslStatus: sslStatus !== 0 ? sslStatus : 1,
        headers: {},
        body: '',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        httpCode: 408,
        timeTotal: '15.000',
        sslStatus: sslStatus,
        headers: {},
        body: '',
        error: 'Timeout'
      });
    });
  });
}

async function runCheck() {
  const timestamp = new Date().toISOString();
  const metrics = await fetchMetrics(TARGET_URL);

  const headers = metrics.headers;
  const hasHsts = headers['strict-transport-security'] ? 1 : 0;
  const hasXfo = headers['x-frame-options'] ? 1 : 0;
  const hasNosniff = headers['x-content-type-options'] ? 1 : 0;

  const brandRegex = /Ideas & Colores|Ideas y Colores/i;
  const brandCheck = brandRegex.test(metrics.body) ? 1 : 0;
  const domHash = crypto.createHash('sha256').update(metrics.body || '').digest('hex').substring(0, 12);

  let status = 'HEALTHY';
  let alerts = '';

  if (metrics.httpCode !== 200) {
    status = 'CRITICAL_DOWN';
    alerts += `[HTTP_ERR:${metrics.httpCode}] `;
  }

  if (metrics.sslStatus !== 0) {
    status = 'SSL_WARNING';
    alerts += '[SSL_INVALID] ';
  }

  if (brandCheck === 0) {
    status = 'DEFACEMENT_OR_EMPTY_DOM';
    alerts += '[DOM_MUTATION_ALERT] ';
  }

  if (!hasHsts || !hasXfo || !hasNosniff) {
    alerts += `[MISSING_SEC_HEADERS(HSTS:${hasHsts},XFO:${hasXfo},NOSNIFF:${hasNosniff})] `;
  }

  const alertStr = alerts.trim() || 'NONE';
  const logLine = `[${timestamp}] STATUS=${status} | HTTP=${metrics.httpCode} | LATENCY=${metrics.timeTotal}s | SSL=${metrics.sslStatus} | DOM_HASH=${domHash} | ALERTS=${alertStr}`;

  console.log(logLine);
  fs.appendFileSync(LOG_FILE, logLine + '\n', 'utf8');

  // Actualizar estado para el Orquestador
  if (fs.existsSync(STATE_FILE)) {
    try {
      const stateContent = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      stateContent.live_status = status;
      stateContent.last_updated = timestamp;
      fs.writeFileSync(STATE_FILE, JSON.stringify(stateContent, null, 2), 'utf8');
    } catch (e) {
      console.error('[WATCHDOG] Error actualizando state file:', e.message);
    }
  }
}

// Ejecutar primera verificación inmediata
runCheck().then(() => {
  if (process.argv.includes('--once')) {
    process.exit(0);
  }
  setInterval(runCheck, INTERVAL_SECONDS * 1000);
});
