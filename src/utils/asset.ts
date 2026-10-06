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
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (base === './' || base === '.') {
    return `./${cleanPath}`;
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
