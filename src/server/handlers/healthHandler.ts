import { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { getSmtpConfig } from '../services/mailer';

export async function handleHealthRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.writeHead(204);
    res.end();
    return;
  }

  const smtp = getSmtpConfig();
  const envLoaded = Boolean(process.env.NODE_ENV || process.env.PORT || smtp.user);

  // Verificación de escritura en disco para storage
  let storageWritable = false;
  try {
    const storageDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    const testFile = path.join(storageDir, '.health_check');
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
    storageWritable = true;
  } catch (err) {
    storageWritable = false;
  }

  const smtpConfigured = smtp.isConfigured;

  const isHealthy = storageWritable;
  const status = isHealthy ? 'HEALTHY' : 'DEGRADED';

  const body = {
    status,
    service: 'ideas-y-colores-backend',
    timestamp: new Date().toISOString(),
    checks: {
      envLoaded,
      storageWritable,
      smtpConfigured,
    },
  };

  res.writeHead(isHealthy ? 200 : 503);
  res.end(JSON.stringify(body, null, 2));
}
