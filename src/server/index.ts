import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleLeadsRequest } from './handlers/leadsHandler';
import { handleHealthRequest } from './handlers/healthHandler';
import { handleCatalogRequest } from './handlers/catalogHandler';
import { handleCalculateRequest } from './handlers/calculateHandler';
import { handleAdminRequest } from './handlers/adminHandler';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3001', 10);

const server = http.createServer(async (req, res) => {
  const url = (req.url?.split('?')[0] || '').replace(/\/+$/, '') || '/';

  if (url === '/api/leads') {
    await handleLeadsRequest(req, res);
    return;
  }
  if (url === '/api/health') {
    await handleHealthRequest(req, res);
    return;
  }
  if (url === '/api/catalog') {
    await handleCatalogRequest(req, res);
    return;
  }
  if (url === '/api/calculate') {
    await handleCalculateRequest(req, res);
    return;
  }
  if (url === '/api/admin' || url.startsWith('/api/admin/')) {
    await handleAdminRequest(req, res, url);
    return;
  }

  res.writeHead(404, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify({ ok: false, error: 'Endpoint no encontrado' }));
});

const isMainModule =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(fileURLToPath(import.meta.url)).toLowerCase();

if (isMainModule) {
  server.listen(PORT, () => {
    console.log(`[Ideas & Colores API] Backend server running on port ${PORT}`);
    console.log(`[Endpoints]:`);
    console.log(`  - GET  http://localhost:${PORT}/api/health`);
    console.log(`  - GET  http://localhost:${PORT}/api/catalog`);
    console.log(`  - POST http://localhost:${PORT}/api/calculate`);
    console.log(`  - POST http://localhost:${PORT}/api/leads`);
    console.log(`  - ALL  http://localhost:${PORT}/api/admin/*`);
  });
}

export default server;
