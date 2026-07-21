import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const modal = readFileSync(new URL('../src/components/ProductModal.jsx', import.meta.url), 'utf8');
const featured = readFileSync(new URL('../src/components/FeaturedProducts.jsx', import.meta.url), 'utf8');
const store = readFileSync(new URL('../src/pages/Store.jsx', import.meta.url), 'utf8');

test('el panel claro del modal aísla el color heredado con un token existente', () => {
  assert.match(modal, /ba-product-modal-panel bg-cream text-ink/);
  assert.doesNotMatch(modal, /ba-product-modal-panel[^"\n]*text-white/);
});

test('selección destacada y tienda reutilizan el mismo ProductModal', () => {
  assert.match(featured, /import ProductModal from ['"]\.\/ProductModal['"]/);
  assert.match(featured, /<ProductModal sku=\{openSku\}/);
  assert.match(store, /import ProductModal from ['"]\.\.\/components\/ProductModal['"]/);
  assert.match(store, /<ProductModal sku=\{openSku\}/);
});

test('la sección destacada conserva sus textos claros fuera del modal', () => {
  assert.match(featured, /id="seleccion"[^>]*text-white/);
  assert.match(featured, /text-white\/65/);
});

test('el botón mantiene contraste y estados disponible y deshabilitado', () => {
  assert.match(modal, /bg-ink text-cream/);
  assert.match(modal, /bg-dust-deep text-white/);
  assert.match(modal, /disabled=\{outOfStock\}/);
});
