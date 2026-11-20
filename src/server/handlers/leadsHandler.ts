import { IncomingMessage, ServerResponse } from 'http';
import { isOriginAllowed, getClientIp } from '../middleware/cors';
import {
  leadPayloadSchema,
  checkIpRateLimit,
} from '../validators/leadSchema';
import { persistLead, buildWhatsAppRedirectUrl } from '../services/leadStorage';
import { sendLeadNotificationEmail } from '../services/mailer';

export async function handleLeadsRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  // Manejo de Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Origin not allowed' }));
    return;
  }

  // Verificación estricta de Método POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Método no permitido. Utilice POST.' }));
    return;
  }

  // Verificación estricta de Origen (Origin Lock)
  if (!isOriginAllowed(origin)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: false,
        error: 'Acceso no autorizado: Origen no permitido por política CORS de Ideas & Colores.',
      })
    );
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  // Verificación estricta de Content-Type JSON
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    res.writeHead(415);
    res.end(JSON.stringify({ ok: false, error: 'Tipo de contenido no soportado. Use application/json.' }));
    return;
  }

  // Extracción de IP y Rate Limiting
  const clientIp = getClientIp(req);
  const rateLimit = checkIpRateLimit(clientIp, 'leads', 3, 10 * 60 * 1000);
  res.setHeader('X-RateLimit-Limit', '3');
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));

  if (!rateLimit.allowed) {
    res.writeHead(429, {
      'Content-Type': 'application/json; charset=utf-8',
      'Retry-After': String(rateLimit.retryAfterSeconds),
    });
    res.end(
      JSON.stringify({
        ok: false,
        error: `Has alcanzado el límite de solicitudes. Por favor espera ${rateLimit.retryAfterSeconds} segundos o escríbenos directamente por WhatsApp.`,
      })
    );
    return;
  }

  // Lectura exacta de bytes del cuerpo (Buffer stream, máx 64KB)
  let rawBody = '';
  let byteCount = 0;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      byteCount += buf.length;
      if (byteCount > 65536) {
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Cuerpo de solicitud demasiado grande.' }));
        return;
      }
      chunks.push(buf);
    }
    rawBody = Buffer.concat(chunks).toString('utf8');
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Error al leer el cuerpo de la solicitud.' }));
    return;
  }

  let parsedJson: unknown;
  try {
    parsedJson = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Formato JSON inválido.' }));
    return;
  }

  const userAgent = req.headers['user-agent'] || 'Desconocido';

  // 1. Detección de Bot vía Honeypot
  const hpValue = (parsedJson as Record<string, unknown>)?.website_hp;
  if (hpValue && String(hpValue).trim().length > 0) {
    // Retorno silencioso de 200 OK sin persistir ni enviar email
    const fakeId = 'IYC-2026-HP01';
    res.writeHead(200);
    res.end(
      JSON.stringify({
        ok: true,
        leadId: fakeId,
        whatsappRedirectUrl: 'https://wa.me/50266617592',
      })
    );
    return;
  }

  // 2. Validación y Sanitización con Zod
  const validationResult = leadPayloadSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues.map((e) => e.message).join(' ');
    res.writeHead(400);
    res.end(
      JSON.stringify({
        ok: false,
        error: errorDetails || 'Datos de formulario inválidos.',
      })
    );
    return;
  }

  const payload = validationResult.data;

  try {
    // 3. Persistencia segura y generación de Lead ID
    const storedLead = await persistLead(payload, clientIp, userAgent);

    // 4. Disparo asíncrono de correo SMTP Hostinger (sin bloquear la respuesta al usuario)
    sendLeadNotificationEmail(storedLead).catch((err) => {
      console.error(`[Background Email Error] [${storedLead.leadId}]:`, err);
    });

    // 5. Respuesta JSON final
    res.writeHead(200);
    res.end(
      JSON.stringify({
        ok: true,
        leadId: storedLead.leadId,
        priority: storedLead.priority,
        estimatedResponse: '< 24 horas hábiles',
        whatsappRedirectUrl: storedLead.whatsappRedirectUrl,
      })
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[API Leads Handler Exception]', err);
    res.writeHead(500);
    res.end(
      JSON.stringify({
        ok: false,
        error: 'Ocurrió un error al procesar tu cotización. Por favor contáctanos vía WhatsApp.',
      })
    );
  }
}
