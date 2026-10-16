#!/usr/bin/env node
/** Static file server for `dist/` — clean URLs, correct MIME types, 404 page. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

export function createServer({ dir = path.join(root, 'dist'), onRequest } = {}) {
  return http.createServer(async (req, res) => {
    if (onRequest) onRequest(req, res);
    if (res.writableEnded) return;

    const requested = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    // Block traversal before touching the filesystem.
    const safe = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(dir, safe);

    try {
      const info = await stat(file).catch(() => null);
      if (!info || info.isDirectory()) file = path.join(file, 'index.html');
      if (!path.resolve(file).startsWith(path.resolve(dir))) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(file);
      const ext = path.extname(file);
      res.writeHead(200, {
        'content-type': MIME[ext] || 'application/octet-stream',
        'cache-control': /\.[0-9a-f]{8}\.(css|js)$/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache',
      });
      res.end(body);
    } catch {
      const notFound = await readFile(path.join(dir, '404.html')).catch(() => null);
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(notFound || '<h1>404</h1>');
    }
  });
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const port = Number(process.env.PORT || 4321);
  createServer().listen(port, () => console.log(`\n  LearnPoint → http://localhost:${port}\n`));
}
