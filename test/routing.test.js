import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Vercel aplica el fallback SPA hacia index.html', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
});

test('React conserva BrowserRouter y registra las rutas públicas existentes', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /BrowserRouter/);
  assert.doesNotMatch(app, /HashRouter/);
  assert.match(app, /path="\/"/);
  assert.match(app, /path="\/tienda"/);
});

test('los cambios de pathname reinician el scroll sin interferir con hashes', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /function RouteScrollManager\(\)/);
  assert.match(app, /const \{ pathname, hash \} = useLocation\(\)/);
  assert.match(app, /const pathnameChanged = previousPathname\.current !== pathname/);
  assert.match(app, /useEffect\(\(\) => \{\s+const pathnameChanged/);
  assert.match(app, /window\.history\.scrollRestoration = 'manual'/);
  assert.match(app, /if \(!pathnameChanged \|\| hash\) return undefined/);
  assert.match(app, /ScrollTrigger\.clearScrollMemory\('manual'\)/);
  assert.match(app, /document\.scrollingElement\?\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
  assert.match(app, /ScrollTrigger\.addEventListener\('refresh', resetDocumentScroll\)/);
  assert.match(app, /ScrollTrigger\.removeEventListener\('refresh', resetDocumentScroll\)/);
  assert.match(app, /window\.clearTimeout\(settleTimer\)/);
  assert.match(app, /\}, \[pathname, hash\]\)/);
  assert.match(app, /<RouteScrollManager \/>/);
});
