import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import zlib from 'zlib';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}

function apiBackendPlugin(): Plugin {
  return {
    name: 'vite-plugin-api-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url?.split('?')[0];
        if (rawUrl === '/api/leads' || rawUrl === '/api/leads/') {
          try {
            const { handleLeadsRequest } = await import('./src/server/handlers/leadsHandler');
            await handleLeadsRequest(req, res);
            return;
          } catch (err) {
            console.error('[API Backend Plugin Error]', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Internal API Server Error' }));
            return;
          }
        }
        if (rawUrl === '/api/health' || rawUrl === '/api/health/') {
          try {
            const { handleHealthRequest } = await import('./src/server/handlers/healthHandler');
            await handleHealthRequest(req, res);
            return;
          } catch (err) {
            console.error('[API Health Plugin Error]', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Health Check Failed' }));
            return;
          }
        }
        next();
      });
    },
  };
}

/**
 * Preview Compression Middleware
 * Emula la compresión mod_deflate / mod_brotli de Hostinger Apache/LiteSpeed
 * para servir HTML, CSS y JS comprimidos en previsualizaciones locales y Lighthouse.
 */
function previewCompressionPlugin(): Plugin {
  return {
    name: 'vite-plugin-preview-compression',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const acceptEncoding = (req.headers['accept-encoding'] as string) || '';
        const rawUrl = req.url?.split('?')[0].split('#')[0] || '/';
        const relPath = rawUrl === '/' ? 'index.html' : rawUrl.replace(/^\//, '');
        const filePath = path.resolve(__dirname, 'dist', relPath);

        const targetPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
          ? filePath
          : path.resolve(__dirname, 'dist', 'index.html');

        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
          const ext = path.extname(targetPath).toLowerCase();
          const compressible = ['.html', '.js', '.css', '.svg', '.json', '.txt', '.xml'];
          if (compressible.includes(ext)) {
            const mimeMap: Record<string, string> = {
              '.html': 'text/html; charset=utf-8',
              '.js': 'application/javascript; charset=utf-8',
              '.css': 'text/css; charset=utf-8',
              '.svg': 'image/svg+xml',
              '.json': 'application/json; charset=utf-8',
              '.txt': 'text/plain; charset=utf-8',
              '.xml': 'application/xml; charset=utf-8',
            };

            const content = fs.readFileSync(targetPath);
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            res.setHeader('Vary', 'Accept-Encoding');

            if (ext === '.html') {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            } else {
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }

            const supportsGzip = !acceptEncoding || acceptEncoding.includes('gzip') || acceptEncoding.includes('*') || acceptEncoding.includes('deflate');
            if (supportsGzip && acceptEncoding !== 'identity') {
              const compressed = zlib.gzipSync(content);
              res.setHeader('Content-Encoding', 'gzip');
              res.setHeader('Content-Length', compressed.length);
              res.end(compressed);
              return;
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      aistudioMediaPlugin(),
      apiBackendPlugin(),
      previewCompressionPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      target: 'es2022',
      cssMinify: 'esbuild',
      modulePreload: {
        polyfill: false,
      },
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/') ||
                id.includes('\\react\\') ||
                id.includes('\\react-dom\\') ||
                id.includes('\\scheduler\\')
              ) {
                return 'vendor-react';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('gsap') || id.includes('@gsap')) {
                return 'vendor-gsap';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('ogl')) {
                return 'vendor-webgl';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/*.zip', '**/dist/**', '**/*.bak', '**/node_modules/**'],
      },
    },
  };
});
