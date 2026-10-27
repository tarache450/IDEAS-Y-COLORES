/**
 * ORCA Security Utilities — Ideas & Colores Multi-Servicios (https://ideasycoloresgt.site/)
 * Implements strict HTML entity escaping, XSS neutralization, Guatemala phone validation,
 * client-side rate limiting (30s cooldown), Honeypot validation, corporate email obfuscation,
 * and safe WhatsApp URL construction.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escapes HTML special characters (&, <, >, ", ') into safe HTML entities.
 */
export function escapeHtmlEntities(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[&<>"']/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strictly sanitizes user input by removing executable blocks (<script>, <style>, <iframe>, <object>, <embed>),
 * dangerous pseudo-protocols (javascript:, vbscript:, data:), inline event handlers, and control characters,
 * then escaping any remaining HTML entities.
 */
export function sanitizeInput(raw: unknown, maxLength = 3000): string {
  if (typeof raw !== 'string') return '';
  const stripped = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\b(?:javascript|vbscript|data)\s*:/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);

  return escapeHtmlEntities(stripped);
}

/**
 * Sanitizes text intended for plain-text channels (e.g., WhatsApp query text before encodeURIComponent)
 * by stripping all HTML tags, script blocks, dangerous protocols, and control characters without double-encoding '&'.
 */
export function sanitizePlainText(raw: unknown, maxLength = 2000): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\b(?:javascript|vbscript|data)\s*:/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates Guatemala phone numbers:
 * Accepts optional '+502' or '502' country code followed by 8 local digits starting with 2, 3, 4, 5, 6, or 7.
 * Examples: '+502 6661-7592', '50266617592', '6661-7592', '5555 1234'.
 */
const GUATEMALA_PHONE_REGEX = /^(?:\+?502[\s()-]*)?[2-7]\d{3}[\s-]*\d{4}$/;

export function isValidGuatemalaPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (trimmed.length < 8 || trimmed.length > 25) return false;
  return GUATEMALA_PHONE_REGEX.test(trimmed);
}

/**
 * Normalizes a Guatemala phone number to E.164 digits without '+' (e.g. '50266617592').
 */
export function normalizeGuatemalaPhone(phone: unknown, fallback = '50266617592'): string {
  if (typeof phone !== 'string') return fallback;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8 && /^[2-7]\d{7}$/.test(digits)) {
    return `502${digits}`;
  }
  if (digits.length === 11 && /^502[2-7]\d{7}$/.test(digits)) {
    return digits;
  }
  return fallback;
}

/**
 * Validates the hidden Honeypot field.
 * Returns true if a bot filled the hidden field (`website_hp`), indicating the submission must be dropped.
 */
export function isHoneypotTriggered(honeypotValue: unknown): boolean {
  if (honeypotValue === null || honeypotValue === undefined) return false;
  return String(honeypotValue).trim().length > 0;
}

/**
 * Client-side Rate Limiter (default 30s cooldown per action key).
 * Uses in-memory Map backed by sessionStorage when available in browser environments.
 */
export const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 30_000;
const rateLimitMemoryStore = new Map<string, number>();

export interface RateLimitStatus {
  allowed: boolean;
  remainingMs: number;
  remainingSeconds: number;
}

export function checkRateLimit(
  actionKey = 'quote_submission',
  cooldownMs = DEFAULT_RATE_LIMIT_COOLDOWN_MS,
  now = Date.now()
): RateLimitStatus {
  const storageKey = `orca_rl_${actionKey}`;
  let lastTimestamp = rateLimitMemoryStore.get(storageKey) ?? 0;

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = Number(window.sessionStorage.getItem(storageKey) || '0');
      if (Number.isFinite(stored) && stored > lastTimestamp) {
        lastTimestamp = stored;
      }
    }
  } catch {
    // Ignore storage access errors in restricted/incognito contexts
  }

  const elapsed = now - lastTimestamp;
  if (lastTimestamp > 0 && elapsed < cooldownMs) {
    const remainingMs = cooldownMs - elapsed;
    return {
      allowed: false,
      remainingMs,
      remainingSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  rateLimitMemoryStore.set(storageKey, now);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(storageKey, String(now));
    }
  } catch {
    // Ignore storage access errors
  }

  return {
    allowed: true,
    remainingMs: 0,
    remainingSeconds: 0,
  };
}

export function resetRateLimit(actionKey = 'quote_submission'): void {
  const storageKey = `orca_rl_${actionKey}`;
  rateLimitMemoryStore.delete(storageKey);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(storageKey);
    }
  } catch {
    // Ignore
  }
}

/**
 * Corporate Email Obfuscation against static HTML/source bot harvesters.
 * Reconstructs the corporate address at runtime from character codes.
 */
const CORP_USER_CODES = [103, 101, 114, 101, 110, 99, 105, 97]; // "gerencia"
const CORP_DOMAIN_CODES = [
  105, 100, 101, 97, 115, 121, 99, 111, 108, 111, 114, 101, 115, 103, 116, 46, 99, 111, 109,
]; // "ideasycoloresgt.com"

export function getDeobfuscatedCorporateEmail(): string {
  const user = String.fromCharCode(...CORP_USER_CODES);
  const domain = String.fromCharCode(...CORP_DOMAIN_CODES);
  return `${user}@${domain}`;
}

export function getObfuscatedEmailDisplay(): string {
  const user = String.fromCharCode(...CORP_USER_CODES);
  const domain = String.fromCharCode(...CORP_DOMAIN_CODES);
  return `${user}\u200B@\u200B${domain}`;
}

export function buildSafeMailtoUrl(subject?: string, body?: string): string {
  const email = getDeobfuscatedCorporateEmail();
  const params = new URLSearchParams();
  if (subject) params.set('subject', sanitizePlainText(subject, 200));
  if (body) params.set('body', sanitizePlainText(body, 1500));
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/**
 * Builds a validated, properly URI-encoded WhatsApp (wa.me) redirect URL.
 * Prevents unencoded '&' truncation, XSS/script injection, and open-redirect tampering.
 */
export function buildSafeWhatsAppUrl(phone: string, rawMessage?: string): string {
  const safePhone = normalizeGuatemalaPhone(phone, '50266617592');
  const defaultMsg = 'Hola Ideas & Colores, quiero cotizar mi proyecto.';
  const cleanMessage = rawMessage ? sanitizePlainText(rawMessage, 2000) : defaultMsg;
  const finalMessage = cleanMessage.length > 0 ? cleanMessage : defaultMsg;
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(finalMessage)}`;
}

/**
 * Neutralizes CSV Formula Injection (DDE / spreadsheet macro execution) when exporting leads.
 */
export function sanitizeCsvCell(value: unknown): string {
  const clean = typeof value === 'string' ? value.replace(/\r?\n/g, ' ').trim() : String(value ?? '');
  const safePrefix = /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
  return `"${safePrefix.replace(/"/g, '""')}"`;
}
