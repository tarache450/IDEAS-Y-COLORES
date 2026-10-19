import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleLeadsRequest } from './handlers/leadsHandler';
import { handleHealthRequest } from './handlers/healthHandler';

// Carga básica de .env sin dependencias obligatorias
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
  const url = req.url?.split('?')[0] || '';

  if (url === '/api/leads' || url === '/api/leads/') {
    await handleLeadsRequest(req, res);
    return;
  }

  if (url === '/api/health' || url === '/api/health/') {
    await handleHealthRequest(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Endpoint no encontrado' }));
});

server.listen(PORT, () => {
  console.log(`[Ideas & Colores API] Backend server running on port ${PORT}`);
  console.log(`[Endpoints]:`);
  console.log(`  - POST http://localhost:${PORT}/api/leads`);
  console.log(`  - GET  http://localhost:${PORT}/api/health`);
});

export default server;
