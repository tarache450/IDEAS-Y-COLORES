import http from 'http';
import { handleLeadsRequest } from '../src/server/handlers/leadsHandler';
import { handleHealthRequest } from '../src/server/handlers/healthHandler';

const PORT = 3099;

const server = http.createServer(async (req, res) => {
  const url = req.url?.split('?')[0] || '';
  if (url === '/api/leads') {
    await handleLeadsRequest(req, res);
    return;
  }
  if (url === '/api/health') {
    await handleHealthRequest(req, res);
    return;
  }
  res.writeHead(404);
  res.end();
});

async function run() {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    console.log('--- TEST A: GET /api/health ---');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    console.log('Health HTTP Status:', healthRes.status);
    const healthData = await healthRes.json();
    console.log('Health JSON:', healthData);
    if (healthData.status !== 'HEALTHY') throw new Error('Health status check failed');

    console.log('\n--- TEST B: CORS 403 on Unauthorized Origin ---');
    const corsRes = await fetch(`http://localhost:${PORT}/api/leads`, {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker-domain.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 123 }),
    });
    console.log('CORS HTTP Status (should be 403):', corsRes.status);
    if (corsRes.status !== 403) throw new Error('CORS origin lock failed');

    console.log('\n--- TEST C: Honeypot Silent 200 OK ---');
    const hpRes = await fetch(`http://localhost:${PORT}/api/leads`, {
      method: 'POST',
      headers: {
        'Origin': 'https://ideasycoloresgt.site',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Bot Spammer',
        telefono: '50223456789',
        website_hp: 'http://bot-site.com',
      }),
    });
    console.log('Honeypot HTTP Status:', hpRes.status);
    const hpData = await hpRes.json();
    console.log('Honeypot JSON:', hpData);
    if (!hpData.ok) throw new Error('Honeypot evasion failed');

    console.log('\n--- TEST D: Valid Lead Submission POST /api/leads ---');
    const validRes = await fetch(`http://localhost:${PORT}/api/leads`, {
      method: 'POST',
      headers: {
        'Origin': 'https://ideasycoloresgt.site',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Ing. Rodrigo Castillo',
        telefono: '+502 2333-8899',
        email: 'rodrigo.castillo@inmobiliaria.gt',
        servicio: 'Pintura Airless',
        ubicacion: 'Carretera a El Salvador',
        metrosCuadrados: 450,
        mensaje: 'Aplicación de pintura airless en complejo habitacional.',
        website_hp: '',
      }),
    });
    console.log('Valid Lead HTTP Status:', validRes.status);
    const validData = await validRes.json();
    console.log('Valid Lead JSON:', validData);
    if (!validData.ok || !validData.leadId.startsWith('IYC-2026-')) {
      throw new Error('Valid lead registration failed');
    }

    console.log('\n======================================================');
    console.log('SUCCESS: REAL HTTP ENDPOINT INTEGRATION TESTS PASSED!');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
