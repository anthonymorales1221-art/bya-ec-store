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
