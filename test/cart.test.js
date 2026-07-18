import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreCart, toStoredCart } from '../src/domain/cart.js';

const products = [
  { sku: 'A-1', name: 'Producto A', price: 10, stock: 3 },
  { sku: 'B-1', name: 'Producto B', price: 5, stock: 0 },
];

test('restaura cantidades válidas y usa los productos vigentes', () => {
  const result = restoreCart({ 'A-1': { qty: 2 } }, products);
  assert.equal(result.cart['A-1'].qty, 2);
  assert.equal(result.cart['A-1'].product, products[0]);
  assert.equal(result.changed, false);
});

test('descarta SKU inexistentes o sin stock y limita cantidades', () => {
  const result = restoreCart({
    'A-1': { qty: 20 },
    'B-1': { qty: 1 },
    'NO-EXISTE': { qty: 1 },
  }, products);
  assert.deepEqual(toStoredCart(result.cart), { 'A-1': { qty: 3 } });
  assert.equal(result.changed, true);
});

test('no conserva cantidades inválidas', () => {
  assert.deepEqual(restoreCart({ 'A-1': { qty: -2 } }, products).cart, {});
  assert.deepEqual(restoreCart({ 'A-1': { qty: 'texto' } }, products).cart, {});
});
