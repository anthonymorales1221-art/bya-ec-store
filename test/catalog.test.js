import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProducts } from '../src/domain/catalog.js';

const validProduct = {
  sku: 'SKU-1', name: 'Producto', category: 'Belleza', price: 12.5, stock: 2,
  img: 'https://example.com/producto.jpg',
};

test('acepta un producto válido', () => {
  const result = validateProducts([validProduct]);
  assert.deepEqual(result.valid, [validProduct]);
  assert.deepEqual(result.issues, []);
});

test('descarta SKU duplicados y valores comerciales inválidos', () => {
  const result = validateProducts([
    validProduct,
    { ...validProduct },
    { ...validProduct, sku: 'SKU-2', price: 0, stock: -1 },
  ]);
  assert.equal(result.valid.length, 1);
  assert.equal(result.issues.length, 2);
  assert.match(result.issues[0], /duplicado/);
  assert.match(result.issues[1], /precio inválido/);
});

test('rechaza protocolos de imagen no web', () => {
  const result = validateProducts([{ ...validProduct, img: 'javascript:alert(1)' }]);
  assert.equal(result.valid.length, 0);
  assert.match(result.issues[0], /URL de imagen inválida/);
});
