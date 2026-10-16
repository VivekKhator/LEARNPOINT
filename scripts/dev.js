#!/usr/bin/env node
/** Dev server: rebuilds on content/source change and live-reloads open tabs via SSE. */
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../src/build/index.js';
import { createServer } from './serve.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4321);
const clients = new Set();

const RELOAD_SNIPPET = `<script>
(function(){var s=new EventSource('/__reload');s.onmessage=function(){location.reload()};
s.onerror=function(){setTimeout(function(){location.reload()},1500)};})();
</script>`;

let building = false;
let queued = false;

async function rebuild(reason) {
  if (building) { queued = true; return; }
  building = true;
  try {
    const stats = await build({ quiet: true });
    console.log(`  rebuilt (${reason}) — ${stats.pages} pages in ${stats.ms}ms`);
    stats.warnings.forEach((w) => console.log(`    warning: ${w}`));
    for (const res of clients) res.write('data: reload\n\n');
  } catch (error) {
    console.error(`  build error: ${error.message}`);
  } finally {
    building = false;
    if (queued) { queued = false; rebuild('queued change'); }
  }
}

await rebuild('startup');

const server = createServer({
  onRequest(req, res) {
    if (req.url !== '/__reload') return;
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
  },
});

// Inject the live-reload client into every HTML response.
const originalEnd = server.listeners('request')[0];
server.removeAllListeners('request');
server.on('request', (req, res) => {
  const write = res.write.bind(res);
  const end = res.end.bind(res);
  let isHtml = false;
  const writeHead = res.writeHead.bind(res);
  res.writeHead = (status, headers) => {
    const type = headers && (headers['content-type'] || headers['Content-Type']);
    isHtml = typeof type === 'string' && type.startsWith('text/html');
    if (isHtml && headers) delete headers['content-length'];
    return writeHead(status, headers);
  };
  res.end = (chunk, ...rest) => {
    if (isHtml && chunk) {
      const html = chunk.toString().replace('</body>', `${RELOAD_SNIPPET}</body>`);
      return end(html, ...rest);
    }
    return end(chunk, ...rest);
  };
  res.write = write;
  originalEnd(req, res);
});

server.listen(port, () => {
  console.log(`\n  LearnPoint dev → http://localhost:${port}`);
  console.log('  watching content/ and src/ …\n');
});

let timer;
for (const dir of ['content', 'src', 'site.config.js']) {
  const target = path.join(root, dir);
  try {
    watch(target, { recursive: true }, (_event, file) => {
      clearTimeout(timer);
      timer = setTimeout(() => rebuild(file || dir), 90);
    });
  } catch {
    console.warn(`  (cannot watch ${dir} on this platform)`);
  }
}
