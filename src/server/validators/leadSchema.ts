import { z } from 'zod';

/**
 * Sanitiza cadenas de texto eliminando etiquetas HTML, scripts y caracteres de control.
 */
export function sanitizeText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Escapa caracteres HTML para prevenir inyecciones XSS en correos o vistas.
 */
export function escapeHtml(val: string): string {
  if (!val) return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Elimina saltos de línea CR/LF y nulos para prevenir SMTP Header Injection.
 */
export function sanitizeHeaderValue(val: unknown, maxLen = 200): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\r\n\0]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

/**
 * Valida URLs de Webhook salientes contra SSRF (solo HTTPS en producción, sin IPs privadas).
 */
export function isSafeWebhookUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    const isProd = process.env.NODE_ENV === 'production';
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && !isProd)) {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (!host) return false;
    if (isProd && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
      return false;
    }
    if (
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host === '0.0.0.0' ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Normaliza y valida teléfonos de Guatemala (+502 opcional + 8 dígitos iniciando en 2-9).
 */
export function normalizeGuatemalaPhone(val: string): { valid: boolean; normalized: string; digits: string } {
  const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
  const match = cleaned.match(/^(?:\+?502)?([2-9]\d{7})$/);
  if (!match) {
    return { valid: false, normalized: '', digits: '' };
  }
  const digits8 = match[1];
  return {
    valid: true,
    normalized: `+502 ${digits8.slice(0, 4)}-${digits8.slice(4)}`,
    digits: `502${digits8}`,
  };
}

export const SERVICIOS_ENUM = [
  'Pintura Airless',
  'Impermeabilización de Losas',
  'Resinas Epóxicas',
  'Carpintería y Remodelación',
  'Mantenimiento Comercial',
  'Otro',
] as const;

export type ServicioTipo = (typeof SERVICIOS_ENUM)[number];

export const UBICACIONES_ENUM = [
  'Ciudad de Guatemala',
  'Carretera a El Salvador',
  'Mixco / Villa Nueva',
  'Otra zona',
] as const;

export type UbicacionTipo = (typeof UBICACIONES_ENUM)[number];

/**
 * Normaliza cualquier variante de servicio a los 6 tipos canónicos.
 */
export function normalizeService(raw?: string): ServicioTipo {
  if (!raw) return 'Otro';
  const lower = raw.toLowerCase();
  if (lower.includes('impermeab') || lower.includes('losa') || lower.includes('techo') || lower.includes('filtrac')) {
    return 'Impermeabilización de Losas';
  }
  if (lower.includes('resina') || lower.includes('epóx') || lower.includes('epox')) {
    return 'Resinas Epóxicas';
  }
  if (lower.includes('airless') || lower.includes('pintura') || lower.includes('recubrimiento')) {
    return 'Pintura Airless';
  }
  if (lower.includes('carpinter') || lower.includes('madera') || lower.includes('remodelac') || lower.includes('pergola') || lower.includes('cocina')) {
    return 'Carpintería y Remodelación';
  }
  if (lower.includes('comercial') || lower.includes('mantenimiento') || lower.includes('industrial') || lower.includes('plomer')) {
    return 'Mantenimiento Comercial';
  }
  return 'Otro';
}

/**
 * Normaliza ubicaciones a los 4 sectores principales.
 */
export function normalizeLocation(raw?: string): UbicacionTipo {
  if (!raw) return 'Otra zona';
  const lower = raw.toLowerCase();
  if (lower.includes('carretera') || lower.includes('salvador') || lower.includes('fraijanes') || lower.includes('santa catarina')) {
    return 'Carretera a El Salvador';
  }
  if (lower.includes('mixco') || lower.includes('villa nueva') || lower.includes('san cristobal') || lower.includes('amatitlan')) {
    return 'Mixco / Villa Nueva';
  }
  if (lower.includes('ciudad') || lower.includes('guatemala') || lower.includes('zona ') || lower.includes('capital')) {
    return 'Ciudad de Guatemala';
  }
  return 'Otra zona';
}

/**
 * Schema Zod estricto para Lead API
 */
export const leadPayloadSchema = z.object({
  nombre: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(80, 'El nombre no debe exceder los 80 caracteres')
    ),
  telefono: z
    .string()
    .transform(sanitizeText)
    .refine((val) => normalizeGuatemalaPhone(val).valid, {
      message: 'Teléfono inválido. Debe ser un número de Guatemala (8 dígitos iniciando con 2-9, opcional +502).',
    }),
  email: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      const clean = sanitizeText(val);
      return clean.length > 0 ? clean : null;
    })
    .pipe(z.string().email('Correo electrónico no válido').nullable()),
  servicio: z
    .string()
    .transform((val) => normalizeService(sanitizeText(val)))
    .pipe(z.enum(SERVICIOS_ENUM)),
  ubicacion: z
    .string()
    .transform((val) => normalizeLocation(sanitizeText(val)))
    .pipe(z.enum(UBICACIONES_ENUM)),
  metrosCuadrados: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') {
        return isNaN(val) || val < 0 || val > 1_000_000 ? null : Math.round(val * 100) / 100;
      }
      const match = val.toString().match(/(\d+(?:\.\d+)?)/);
      if (!match) return null;
      const num = parseFloat(match[1]);
      return isNaN(num) || num < 0 || num > 1_000_000 ? null : Math.round(num * 100) / 100;
    }),
  spaceType: z
    .string()
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val).slice(0, 80) || null),
  estimatedArea: z
    .string()
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val).slice(0, 80) || null),
  desiredTimeline: z
    .string()
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val).slice(0, 80) || null),
  source: z
    .string()
    .optional()
    .nullable()
    .transform((val) => sanitizeText(val).slice(0, 60) || 'website_quote_wizard'),
  mensaje: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      const clean = sanitizeText(val);
      return clean.length > 0 ? clean.slice(0, 500) : '';
    }),
  website_hp: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? String(val).trim() : '')),
});

export type ValidatedLeadPayload = z.infer<typeof leadPayloadSchema>;

export const calculatePayloadSchema = z.object({
  areaM2: z.coerce
    .number()
    .min(1, 'El área mínima debe ser de 1 m².')
    .max(50000, 'El área máxima para cálculo directo es de 50,000 m².'),
  coats: z.coerce.number().int().min(1).max(4).default(2),
  surfaceType: z
    .enum(['liso', 'repello', 'tablayeso', 'exterior', 'losa_impermeabilizacion', 'epoxico'])
    .default('liso'),
});

export type CalculatePayload = z.infer<typeof calculatePayloadSchema>;

/**
 * Rate Limiter en memoria por IP (Ventana: 10 min, Límite: 3 solicitudes)
 */
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS_PER_WINDOW = 3;

export function checkIpRateLimit(
  ip: string,
  bucketPrefix = 'leads',
  maxRequests = MAX_REQUESTS_PER_WINDOW,
  windowMs = RATE_LIMIT_WINDOW_MS
): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const key = `${bucketPrefix}:${ip}`;
  const now = Date.now();
  const bucket = rateLimitStore.get(key) || { timestamps: [] };

  // Filtrar timestamps fuera de la ventana
  const recent = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    rateLimitStore.set(key, { timestamps: recent });
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  recent.push(now);
  rateLimitStore.set(key, { timestamps: recent });

  // Limpieza periódica suave para evitar fugas de memoria
  if (rateLimitStore.size > 2000) {
    for (const [k, val] of rateLimitStore.entries()) {
      const valid = val.timestamps.filter((ts) => now - ts < windowMs);
      if (valid.length === 0) {
        rateLimitStore.delete(k);
      } else {
        rateLimitStore.set(k, { timestamps: valid });
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - recent.length),
    retryAfterSeconds: 0,
  };
}
