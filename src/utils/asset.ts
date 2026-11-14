/// <reference types="vite/client" />

/**
 * Utility to resolve static asset URLs seamlessly across local dev
 * and nested deployment paths (such as GitHub Pages subpaths).
 */
export function assetUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Safe fallback to import.meta.env with casting
  const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  const base = metaEnv?.BASE_URL || './';
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Auto-serve ultra-fast modern .webp format for content photos and logos
  if (/\.(jpe?g|png)$/i.test(cleanPath)) {
    if (
      !cleanPath.includes('favicon') &&
      !cleanPath.includes('apple-touch-icon') &&
      !cleanPath.includes('masks/')
    ) {
      cleanPath = cleanPath.replace(/\.(jpe?g|png)$/i, '.webp');
    }
  }

  // Map optimized service and hero WebP assets to cache-busted -v2.webp binaries
  const v2WebpMap: Record<string, string> = {
    'logo-white.webp': 'logo-white-v2.webp',
    'logo.webp': 'logo-v2.webp',
    'hero-interior-sala.webp': 'hero-interior-sala-v2.webp',
    'hero-interior-sala-mobile.webp': 'hero-interior-sala-mobile-v2.webp',
    'services/servicio-carpinteria-medida.webp': 'services/servicio-carpinteria-medida-v2.webp',
    'services/servicio-mantenimiento-oficinas.webp': 'services/servicio-mantenimiento-oficinas-v2.webp',
    'services/servicio-plomeria-bano.webp': 'services/servicio-plomeria-bano-v2.webp',
    'services/servicio-pintura-interiores.webp': 'services/servicio-pintura-interiores-v2.webp',
    'services/servicio-piso-epoxico.webp': 'services/servicio-piso-epoxico-v2.webp',
    'services/servicio-drywall-cielo-falso.webp': 'services/servicio-drywall-cielo-falso-v2.webp',
  };
  if (v2WebpMap[cleanPath]) {
    cleanPath = v2WebpMap[cleanPath];
  }

  if (base === './' || base === '.') {
    return `./${cleanPath}`;
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
