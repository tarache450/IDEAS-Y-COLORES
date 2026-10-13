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

  if (base === './' || base === '.') {
    return `./${cleanPath}`;
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
