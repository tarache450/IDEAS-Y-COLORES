import { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { isOriginAllowed } from '../middleware/cors';

const CATALOG_RESPONSE = {
  brand: 'Ideas & Colores Multi-Servicios Guatemala',
  domain: 'https://ideasycoloresgt.site',
  location: 'Carretera a El Salvador Km 21.5, Fraijanes, Guatemala',
  coverageZones: [
    'Carretera a El Salvador',
    'Fraijanes y Santa Catarina Pinula',
    'Ciudad de Guatemala (Zonas 10, 14, 15, 16 y Zona 1)',
    'Mixco y San Cristóbal',
    'Villa Nueva y Amatitlán',
  ],
  phone: '+502 6661-7592',
  whatsapp: 'https://wa.me/50266617592',
  divisions: [
    { id: 'pintura', number: '01', title: 'Pintura y Recubrimientos Airless', warranty: true },
    { id: 'impresion', number: '02', title: 'Impresión Digital y Rotulación', warranty: true },
    { id: 'carpinteria', number: '03', title: 'Carpintería a Medida y Pérgolas', warranty: true },
    { id: 'plomeria', number: '04', title: 'Plomería Técnica e Hidrosanitaria', warranty: true },
    { id: 'resinas', number: '05', title: 'Resinas Epóxicas 3D e Industriales', warranty: true },
    { id: 'instalaciones', number: '06', title: 'Instalaciones y Mantenimiento Locativo', warranty: true },
  ],
  endpoints: {
    health: '/api/health',
    catalog: '/api/catalog',
    calculate: '/api/calculate',
    leads: '/api/leads',
    admin: '/api/admin',
  },
};

export async function handleCatalogRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const origin = req.headers.origin as string | undefined;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'public, max-age=300');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end(JSON.stringify({ ok: false, error: 'Método no permitido. Utilice GET.' }));
    return;
  }

  const body = JSON.stringify({ ok: true, ...CATALOG_RESPONSE }, null, 2);
  const etag = `"${crypto.createHash('sha256').update(body).digest('hex').slice(0, 16)}"`;
  res.setHeader('ETag', etag);

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    res.end();
    return;
  }

  res.writeHead(200);
  res.end(req.method === 'HEAD' ? '' : body);
}
