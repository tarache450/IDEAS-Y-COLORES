/**
 * CSP-safe Google Analytics 4 (GA4) loader & conversion tracker.
 * Activated automatically when VITE_GA_MEASUREMENT_ID (G-XXXXXXXXXX) is set.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const VALID_GA4_PATTERN = /^G-[A-Z0-9]{6,}$/i;

export function isGoogleAnalyticsConfigured(): boolean {
  return VALID_GA4_PATTERN.test(GA_MEASUREMENT_ID);
}

export function trackGaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined' || !isGoogleAnalyticsConfigured()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    anonymize_ip: true,
  });

  const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
  if (!existing) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  // Track outbound WhatsApp and telephone lead clicks cleanly without duplicating UI handlers
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.includes('wa.me/')) {
        trackGaEvent('generate_lead', { method: 'whatsapp', link_url: href });
      } else if (href.startsWith('tel:')) {
        trackGaEvent('generate_lead', { method: 'phone_call', link_url: href });
      }
    },
    { passive: true }
  );
}
