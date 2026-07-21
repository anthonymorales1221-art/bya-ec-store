import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildImageCandidates,
  classifyImageRatio,
  getImageVariant,
} from '../src/domain/imagePresentation.js';

test('las imágenes comerciales usan contain y las decorativas pueden usar cover', () => {
  for (const variant of ['product', 'category', 'featured', 'evidence', 'detail', 'thumbnail']) {
    assert.equal(getImageVariant(variant).fit, 'contain');
  }
  assert.equal(getImageVariant('decorative').fit, 'cover');
  assert.equal(getImageVariant('avatar').fit, 'cover');
});

test('categorías, destacados y evidencias activan fondo ambiental decorativo', () => {
  assert.equal(getImageVariant('category').ambient, true);
  assert.equal(getImageVariant('featured').ambient, true);
  assert.equal(getImageVariant('evidence').ambient, true);
  assert.equal(getImageVariant('product').ambient, false);
});

test('clasifica proporciones sin depender de archivos externos', () => {
  assert.equal(classifyImageRatio(900, 1600), 'portrait-tall');
  assert.equal(classifyImageRatio(900, 1200), 'portrait');
  assert.equal(classifyImageRatio(1000, 1000), 'square');
  assert.equal(classifyImageRatio(1600, 900), 'landscape');
  assert.equal(classifyImageRatio(2400, 800), 'panoramic');
  assert.equal(classifyImageRatio(0, 0), 'unknown');
});

test('una URL vacía produce fallback y Google Drive conserva una alternativa', () => {
  assert.deepEqual(buildImageCandidates('', ''), []);
  const drive = 'https://drive.google.com/thumbnail?id=18SEfynue25STezuBK4JYUYaDcem_Tv02&sz=w1000';
  assert.deepEqual(buildImageCandidates(drive), [
    drive,
    'https://drive.google.com/uc?export=view&id=18SEfynue25STezuBK4JYUYaDcem_Tv02',
  ]);
});

test('el modo de carga diferida se mantiene centralizado', () => {
  assert.equal(getImageVariant('product').loading, 'lazy');
  assert.equal(getImageVariant('evidence').loading, 'lazy');
});

test('cada contexto comercial declara su variante centralizada', () => {
  const expected = [
    ['../src/components/ProductGrid.jsx', 'variant="product"'],
    ['../src/components/Categories.jsx', 'variant="category"'],
    ['../src/components/FeaturedProducts.jsx', 'variant="featured"'],
    ['../src/components/Evidencias.jsx', 'variant="evidence"'],
    ['../src/components/ProductModal.jsx', 'variant="detail"'],
    ['../src/components/CartDrawer.jsx', 'variant="thumbnail"'],
  ];
  expected.forEach(([path, marker]) => {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'), new RegExp(marker));
  });
});

test('el fondo ambiental es decorativo y no duplica el texto alternativo', () => {
  const component = readFileSync(new URL('../src/components/ProductImage.jsx', import.meta.url), 'utf8');
  assert.match(component, /ba-commerce-image-ambient/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /alt=\{alt\}/);
});

test('las imágenes comerciales ya no solicitan object-cover en sus consumidores', () => {
  const commercialComponents = [
    'ProductGrid.jsx', 'Categories.jsx', 'FeaturedProducts.jsx', 'Evidencias.jsx',
    'ProductModal.jsx', 'CartDrawer.jsx',
  ];
  commercialComponents.forEach((name) => {
    const source = readFileSync(new URL(`../src/components/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /object-cover/);
  });
});
