import { IncomingMessage, ServerResponse } from 'node:http';
import { isOriginAllowed, getClientIp } from '../middleware/cors';
import { calculatePayloadSchema, checkIpRateLimit, type CalculatePayload } from '../validators/leadSchema';

const SURFACE_PROFILES: Record<
  CalculatePayload['surfaceType'],
  { coverageM2PerGallon: number; system: string; primerRequired: boolean; notes: string }
> = {
  liso: {
    coverageM2PerGallon: 35,
    system: 'Látex Arquitectónico Lavable / Satinado',
    primerRequired: false,
    notes: 'Muro liso interior previamente sellado. Incluye margen de desperdicio del 10%.',
  },
  repello: {
    coverageM2PerGallon: 24,
    system: 'Sellador Acrílico Alcalino + Látex Alto Cubrimiento',
    primerRequired: true,
    notes: 'Superficie porosa o repello nuevo; requiere sellador de adherencia.',
  },
  tablayeso: {
    coverageM2PerGallon: 30,
    system: 'Primer Imprimante Yeso/Drywall + Acabado Mate o Satinado',
    primerRequired: true,
    notes: 'Sella juntas y masilla antes de aplicar acabado uniforme con sistema Airless.',
  },
  exterior: {
    coverageM2PerGallon: 26,
    system: 'Elastomérico UV Alta Resistencia / Fachadas',
    primerRequired: true,
    notes: 'Protección climática UV e impermeable para muros exteriores.',
  },
  losa_impermeabilizacion: {
    coverageM2PerGallon: 12,
    system: 'Membrana Elastofibratada de Poliéster + Poliuretano UV',
    primerRequired: true,
    notes: 'Rendimiento de sistema de alto espesor para sellado antifiltraciones en losa.',
  },
  epoxico: {
    coverageM2PerGallon: 18,
    system: 'Primer Epóxico 100% Sólidos + Resina Autonivelante',
    primerRequired: true,
    notes: 'Recubrimiento industrial / comercial de alta resistencia química y abrasión.',
  },
};

export function computePaintEstimate(input: CalculatePayload) {
  const profile = SURFACE_PROFILES[input.surfaceType];
  const effectiveArea = Number((input.areaM2 * input.coats * 1.1).toFixed(2));
  const totalGallons = Math.max(1, Math.ceil(effectiveArea / profile.coverageM2PerGallon));
  const buckets5Gal = Math.floor(totalGallons / 5);
  const remainingGallons = totalGallons % 5;
  const primerGallons = profile.primerRequired
    ? Math.max(1, Math.ceil((input.areaM2 * 1.05) / 38))
    : 0;

  return {
    areaM2: input.areaM2,
    coats: input.coats,
    surfaceType: input.surfaceType,
    recommendedSystem: profile.system,
    totalGallons,
    buckets5Gal,
    remainingGallons,
    primerGallons,
    presentationSummary: `${buckets5Gal} cubeta(s) de 5 gal + ${remainingGallons} galón(es)`,
    technicalNote: profile.notes,
  };
}

export async function handleCalculateRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method === 'OPTIONS') {
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(403);
    res.end(JSON.stringify({ ok: false, error: 'Origin not allowed' }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ ok: false, error: 'Método no permitido. Utilice POST.' }));
    return;
  }

  if (origin && !isOriginAllowed(origin)) {
    res.writeHead(403);
    res.end(JSON.stringify({ ok: false, error: 'Origen no permitido.' }));
    return;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  const clientIp = getClientIp(req);
  const rl = checkIpRateLimit(clientIp, 'calculate', 30, 10 * 60 * 1000);
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
  if (!rl.allowed) {
    res.writeHead(429, { 'Retry-After': String(rl.retryAfterSeconds) });
    res.end(JSON.stringify({ ok: false, error: 'Demasiados cálculos consecutivos. Espera un momento.' }));
    return;
  }

  let totalBytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > 16384) {
      res.writeHead(413);
      res.end(JSON.stringify({ ok: false, error: 'Payload demasiado grande.' }));
      return;
    }
    chunks.push(buf);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ ok: false, error: 'JSON inválido.' }));
    return;
  }

  const result = calculatePayloadSchema.safeParse(parsed);
  if (!result.success) {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        ok: false,
        error: result.error.issues.map((i) => i.message).join(' '),
      })
    );
    return;
  }

  const estimate = computePaintEstimate(result.data);
  res.writeHead(200);
  res.end(JSON.stringify({ ok: true, estimate }));
}
