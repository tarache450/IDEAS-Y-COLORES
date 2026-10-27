/**
 * Manejo estricto de CORS y validación de Origen
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://ideasycoloresgt.site',
  'https://www.ideasycoloresgt.site',
];

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = list.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) {
    // Si no hay Origin (e.g. solicitud interna o postman en local), permitir solo en desarrollo
    return process.env.NODE_ENV !== 'production';
  }

  // Permitir orígenes de producción
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // En desarrollo o pruebas, permitir localhost y 127.0.0.1 en cualquier puerto
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (isLocalhost) {
    return true;
  }

  // Orígenes adicionales definidos en .env
  const customOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return customOrigins.includes(origin);
}
