import { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isOriginAllowed, getClientIp } from '../middleware/cors';
import { checkIpRateLimit, sanitizeText } from '../validators/leadSchema';
import { getSqliteDb } from '../services/sqliteDb';

const VALID_STATUSES = ['new', 'contacted', 'in_progress', 'quoted', 'won', 'lost'] as const;

function getTokenSecret(): string {
  if (process.env.ADMIN_TOKEN_SECRET && process.env.ADMIN_TOKEN_SECRET.length >= 32) {
    return process.env.ADMIN_TOKEN_SECRET;
  }
  const secretPath = path.resolve(process.cwd(), 'data', '.api_secret');
  try {
    if (fs.existsSync(secretPath)) {
      const existing = fs.readFileSync(secretPath, 'utf8').trim();
      if (existing.length >= 32) return existing;
    }
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretPath, generated, { mode: 0o600, encoding: 'utf8' });
    return generated;
  } catch {
    return crypto.randomBytes(32).toString('hex');
  }
}

export function signAdminToken(subject: string, ttlSeconds = 28800, secretOverride?: string): string {
  const secret = secretOverride || getTokenSecret();
  const payload = Buffer.from(
    JSON.stringify({ sub: subject, exp: Math.floor(Date.now() / 1000) + ttlSeconds })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string, secretOverride?: string): { sub: string; exp: number } | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const secret = secretOverride || getTokenSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

async function readJsonBody(req: IncomingMessage): Promise<{ ok: boolean; status?: number; error?: string; data?: Record<string, unknown> }> {
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buf.length;
    if (bytes > 32768) {
      return { ok: false, status: 413, error: 'Payload demasiado grande.' };
    }
    chunks.push(buf);
  }
  try {
    const raw = Buffer.concat(chunks).toString('utf8');
    return { ok: true, data: raw ? (JSON.parse(raw) as Record<string, unknown>) : {} };
  } catch {
    return { ok: false, status: 400, error: 'Formato JSON inválido.' };
  }
}

export async function handleAdminRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method === 'OPTIONS') {
    if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(403);
    res.end(JSON.stringify({ ok: false, error: 'Origin not allowed' }));
    return;
  }

  if (origin && !isOriginAllowed(origin)) {
    res.writeHead(403);
    res.end(JSON.stringify({ ok: false, error: 'Origen no autorizado.' }));
    return;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  const clientIp = getClientIp(req);

  // POST /api/admin/login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const rl = checkIpRateLimit(clientIp, 'admin_login', 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      res.writeHead(429, { 'Retry-After': String(rl.retryAfterSeconds) });
      res.end(JSON.stringify({ ok: false, error: 'Demasiados intentos fallidos. Espera unos minutos.' }));
      return;
    }

    const configuredPass = process.env.ADMIN_PASSWORD || '';
    if (!configuredPass || configuredPass.length < 10) {
      res.writeHead(503);
      res.end(JSON.stringify({ ok: false, error: 'Autenticación de administrador backend no configurada en el servidor.' }));
      return;
    }

    const bodyRes = await readJsonBody(req);
    if (!bodyRes.ok) {
      res.writeHead(bodyRes.status || 400);
      res.end(JSON.stringify({ ok: false, error: bodyRes.error }));
      return;
    }

    const password = typeof bodyRes.data?.password === 'string' ? bodyRes.data.password : '';
    if (!password || !timingSafeCompareStrings(password, configuredPass)) {
      res.writeHead(401);
      res.end(JSON.stringify({ ok: false, error: 'Credenciales inválidas.' }));
      return;
    }

    const token = signAdminToken('admin@ideasycoloresgt.site', 28800);
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, token, expiresIn: 28800 }));
    return;
  }

  // Require Bearer token on all other /api/admin* routes (Fail-Closed)
  const authHeader = String(req.headers.authorization || '');
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const claims = verifyAdminToken(bearerToken);
  if (!claims) {
    res.writeHead(401, { 'WWW-Authenticate': 'Bearer realm="IdeasYColoresAdmin"' });
    res.end(JSON.stringify({ ok: false, error: 'No autorizado. Se requiere token Bearer válido.' }));
    return;
  }

  const db = getSqliteDb();

  // GET /api/admin/stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const rows = db
      .prepare('SELECT status, budget_estimate, created_at FROM leads')
      .all() as Array<{ status: string; budget_estimate: number | null; created_at: string }>;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const stats = rows.reduce(
      (acc, r) => {
        acc.total_leads += 1;
        if (r.status === 'new') acc.new_leads += 1;
        else if (r.status === 'contacted') acc.contacted_leads += 1;
        else if (r.status === 'in_progress') acc.in_progress_leads += 1;
        else if (r.status === 'quoted') acc.quoted_leads += 1;
        else if (r.status === 'won') {
          acc.won_leads += 1;
          acc.total_won_revenue += Number(r.budget_estimate || 0);
        } else if (r.status === 'lost') acc.lost_leads += 1;
        if (new Date(r.created_at).getTime() >= cutoff) acc.leads_last_30_days += 1;
        return acc;
      },
      {
        total_leads: 0,
        new_leads: 0,
        contacted_leads: 0,
        in_progress_leads: 0,
        quoted_leads: 0,
        won_leads: 0,
        lost_leads: 0,
        leads_last_30_days: 0,
        total_won_revenue: 0,
      }
    );
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, stats }));
    return;
  }

  // GET /api/admin/leads
  if (pathname === '/api/admin/leads' && req.method === 'GET') {
    const reqUrl = new URL(req.url || '/', 'https://ideasycoloresgt.site');
    const statusParam = reqUrl.searchParams.get('status') || '';
    const searchParam = sanitizeText(reqUrl.searchParams.get('search') || '').slice(0, 80);

    const conditions: string[] = [];
    const params: string[] = [];

    if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)) {
      conditions.push('status = ?');
      params.push(statusParam);
    }
    if (searchParam) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR service LIKE ? OR location LIKE ? OR lead_id LIKE ?)');
      const likeTerm = `%${searchParam}%`;
      params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const leads = db
      .prepare(`SELECT lead_id, name, phone, email, service, space_type, estimated_area, desired_timeline, location, metros_cuadrados, message, priority, status, budget_estimate, internal_notes, created_at, updated_at FROM leads ${where} ORDER BY created_at DESC LIMIT 250`)
      .all(...params);

    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, leads }));
    return;
  }

  // PATCH /api/admin/leads
  if (pathname === '/api/admin/leads' && req.method === 'PATCH') {
    const bodyRes = await readJsonBody(req);
    if (!bodyRes.ok) {
      res.writeHead(bodyRes.status || 400);
      res.end(JSON.stringify({ ok: false, error: bodyRes.error }));
      return;
    }
    const leadId = sanitizeText(bodyRes.data?.leadId);
    const status = typeof bodyRes.data?.status === 'string' ? bodyRes.data.status : '';
    const notes = typeof bodyRes.data?.internalNotes === 'string' ? sanitizeText(bodyRes.data.internalNotes).slice(0, 1000) : null;
    if (!leadId || !(VALID_STATUSES as readonly string[]).includes(status)) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: 'leadId y status válido son requeridos.' }));
      return;
    }
    const nowIso = new Date().toISOString();
    const info = db
      .prepare('UPDATE leads SET status = ?, internal_notes = COALESCE(?, internal_notes), updated_at = ? WHERE lead_id = ?')
      .run(status, notes, nowIso, leadId);
    res.writeHead(info.changes > 0 ? 200 : 404);
    res.end(JSON.stringify({ ok: info.changes > 0, updated: info.changes }));
    return;
  }

  // DELETE /api/admin/leads?leadId=...
  if (pathname === '/api/admin/leads' && req.method === 'DELETE') {
    const reqUrl = new URL(req.url || '/', 'https://ideasycoloresgt.site');
    const leadId = sanitizeText(reqUrl.searchParams.get('leadId') || '');
    if (!leadId) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: 'leadId es requerido.' }));
      return;
    }
    const info = db.prepare('DELETE FROM leads WHERE lead_id = ?').run(leadId);
    res.writeHead(info.changes > 0 ? 200 : 404);
    res.end(JSON.stringify({ ok: info.changes > 0, deleted: info.changes }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ ok: false, error: 'Ruta de administración no encontrada.' }));
}
