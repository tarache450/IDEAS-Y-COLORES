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
      const num = typeof val === 'number' ? val : parseFloat(val.toString().replace(/[^0-9.]/g, ''));
      return isNaN(num) || num < 0 ? null : Math.round(num * 100) / 100;
    }),
  mensaje: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      const clean = sanitizeText(val);
      return clean.length > 0 ? escapeHtml(clean).slice(0, 500) : '';
    }),
  website_hp: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? String(val).trim() : '')),
});

export type ValidatedLeadPayload = z.infer<typeof leadPayloadSchema>;

/**
 * Rate Limiter en memoria por IP (Ventana: 10 min, Límite: 3 solicitudes)
 */
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS_PER_WINDOW = 3;

export function checkIpRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = rateLimitStore.get(ip) || { timestamps: [] };

  // Filtrar timestamps fuera de la ventana
  const recent = bucket.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    rateLimitStore.set(ip, { timestamps: recent });
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  recent.push(now);
  rateLimitStore.set(ip, { timestamps: recent });

  // Limpieza periódica suave para evitar fugas de memoria
  if (rateLimitStore.size > 2000) {
    for (const [key, val] of rateLimitStore.entries()) {
      const valid = val.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, { timestamps: valid });
      }
    }
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - recent.length,
    retryAfterSeconds: 0,
  };
}
