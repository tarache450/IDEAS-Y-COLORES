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

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-NBKE5WJMDH').trim();
const VALID_GA4_PATTERN = /^G-[A-Z0-9]{6,}$/i;

export function isGoogleAnalyticsConfigured(): boolean {
  return VALID_GA4_PATTERN.test(GA_MEASUREMENT_ID);
}

export function trackGaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

export function trackGaPageView(pagePath: string, pageTitle: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });
}

export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined' || !isGoogleAnalyticsConfigured()) return;

  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true,
    });
  }

  const loadExternalGtag = () => {
    const existing = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existing) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  };

  // Defer external 178 KiB gtag/js script until genuine human interaction so initial LCP/TBT stays unblocked
  const interactionEvents: Array<keyof WindowEventMap> = [
    'pointerdown',
    'keydown',
    'touchstart',
    'wheel',
  ];
  const onFirstInteraction = () => {
    interactionEvents.forEach((ev) => window.removeEventListener(ev, onFirstInteraction));
    loadExternalGtag();
  };
  interactionEvents.forEach((ev) => {
    window.addEventListener(ev, onFirstInteraction, { once: true, passive: true });
  });

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
