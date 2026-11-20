import { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { getSmtpConfig } from '../services/mailer';
import { getSqliteDb, getLeadsCount } from '../services/sqliteDb';
import { isOriginAllowed } from '../middleware/cors';

export async function handleHealthRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ideasycoloresgt.site');
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end(JSON.stringify({ ok: false, error: 'Método no permitido.' }));
    return;
  }

  const smtp = getSmtpConfig();
  const envLoaded = Boolean(process.env.NODE_ENV || process.env.PORT || smtp.user);
  const adminAuthConfigured = Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH);

  let storageWritable = false;
  try {
    const storageDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    const testFile = path.join(storageDir, `.health_${Date.now()}`);
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
    storageWritable = true;
  } catch {
    storageWritable = false;
  }

  let databaseReady = false;
  let leadsStored = 0;
  try {
    getSqliteDb();
    leadsStored = getLeadsCount();
    databaseReady = true;
  } catch {
    databaseReady = false;
  }

  const isHealthy = storageWritable && databaseReady;
  const status = isHealthy ? 'HEALTHY' : storageWritable ? 'DEGRADED' : 'UNHEALTHY';

  const body = {
    status,
    service: 'ideas-y-colores-backend',
    timestamp: new Date().toISOString(),
    checks: {
      envLoaded,
      storageWritable,
      databaseReady,
      dbDriver: databaseReady ? 'sqlite' : 'jsonl',
      leadsStored,
      rateLimiterActive: true,
      smtpConfigured: smtp.isConfigured,
      adminAuthConfigured,
    },
  };

  res.writeHead(isHealthy || storageWritable ? 200 : 503);
  res.end(req.method === 'HEAD' ? '' : JSON.stringify(body, null, 2));
}
