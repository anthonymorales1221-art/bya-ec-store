import assert from 'node:assert/strict';
import test from 'node:test';
import { CART_STORAGE_KEY, CART_STORAGE_VERSION, CART_TTL_MS } from '../src/data/config.js';
import { hydrateCart, reconcileCart } from '../src/domain/cart.js';
import {
  clearStoredCart,
  createStoredCart,
  loadStoredCart,
  parseStoredCart,
  saveStoredCart,
} from '../src/services/cartStorage.js';

const NOW = 2_000_000_000_000;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    getItem(key) { calls.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key, value]); values.set(key, value); },
    removeItem(key) { calls.push(['remove', key]); values.delete(key); },
    value(key) { return values.get(key) ?? null; },
  };
}

function payload(items, overrides = {}) {
  return {
    version: CART_STORAGE_VERSION,
    updatedAt: NOW - 1000,
    expiresAt: NOW + 1000,
    items,
    ...overrides,
  };
}

function item(sku, quantity = 1, price = 10) {
  return { sku, quantity, snapshot: { name: `Producto ${sku}`, image: `${sku}.jpg`, unitPriceAtAdd: price } };
}

test('carrito vacío sin almacenamiento previo no escribe durante la lectura', () => {
  const storage = memoryStorage();
  assert.equal(loadStoredCart(storage, NOW), null);
  assert.deepEqual(storage.calls, [['get', CART_STORAGE_KEY]]);
});

test('restaura un producto y conserva exactamente la cantidad', () => {
  const parsed = parseStoredCart(JSON.stringify(payload([item('A-1', 4)])), NOW);
  const cart = hydrateCart(parsed.payload);
  assert.equal(cart['A-1'].qty, 4);
  assert.equal(cart['A-1'].availability, 'pending');
});

test('restaura 16 SKU distintos sin duplicarlos', () => {
  const items = Array.from({ length: 16 }, (_, index) => item(`SKU-${index + 1}`, index + 1));
  const cart = hydrateCart(parseStoredCart(payload(items), NOW).payload);
  assert.equal(Object.keys(cart).length, 16);
  assert.equal(cart['SKU-16'].qty, 16);
});

test('consolida SKU duplicados y rechaza cantidades inválidas', () => {
  const result = parseStoredCart(payload([
    item('A-1', 2), item('A-1', 3), item('NEG', -1), item('DEC', 1.5), item('', 2),
  ]), NOW);
  assert.deepEqual(result.payload.items.map(({ sku, quantity }) => ({ sku, quantity })), [{ sku: 'A-1', quantity: 5 }]);
});

test('carrito vigente se restaura y una lectura no extiende expiresAt', () => {
  const original = payload([item('A-1')], { expiresAt: NOW + 500 });
  const storage = memoryStorage({ [CART_STORAGE_KEY]: JSON.stringify(original) });
  assert.equal(loadStoredCart(storage, NOW).expiresAt, NOW + 500);
  assert.equal(storage.calls.filter(([operation]) => operation === 'set').length, 0);
});

test('carrito vencido no se restaura y elimina solo su propia clave', () => {
  const storage = memoryStorage({
    [CART_STORAGE_KEY]: JSON.stringify(payload([item('A-1')], { expiresAt: NOW })),
    preference: 'keep',
  });
  assert.equal(loadStoredCart(storage, NOW), null);
  assert.equal(storage.value(CART_STORAGE_KEY), null);
  assert.equal(storage.value('preference'), 'keep');
});

test('JSON corrupto o versión desconocida se manejan sin lanzar', () => {
  assert.equal(parseStoredCart('{', NOW).payload, null);
  assert.equal(parseStoredCart({ ...payload([]), version: 99 }, NOW).payload, null);
});

test('cada guardado real renueva updatedAt y siete días de expiración', () => {
  const cart = hydrateCart(payload([item('A-1', 2)]));
  const storage = memoryStorage();
  const saved = saveStoredCart(cart, storage, NOW);
  assert.equal(saved.updatedAt, NOW);
  assert.equal(saved.expiresAt, NOW + CART_TTL_MS);
  assert.equal(JSON.parse(storage.value(CART_STORAGE_KEY)).items[0].quantity, 2);
});

test('vaciar explícitamente elimina exclusivamente la clave del carrito', () => {
  const storage = memoryStorage({ [CART_STORAGE_KEY]: 'cart', preference: 'keep' });
  clearStoredCart(storage);
  assert.equal(storage.value(CART_STORAGE_KEY), null);
  assert.equal(storage.value('preference'), 'keep');
});

test('guardar un carrito vacío elimina su clave sin usar clear', () => {
  const storage = memoryStorage({ [CART_STORAGE_KEY]: 'cart' });
  saveStoredCart({}, storage, NOW);
  assert.deepEqual(storage.calls.at(-1), ['remove', CART_STORAGE_KEY]);
});

test('reconciliación usa precio y datos actuales del catálogo', () => {
  const cart = hydrateCart(payload([item('A-1', 2, 10)]));
  const current = { sku: 'A-1', name: 'Nombre actual', price: 15, stock: 5, img: 'actual.jpg' };
  const reconciled = reconcileCart(cart, [current]);
  assert.equal(reconciled['A-1'].product, current);
  assert.equal(reconciled['A-1'].product.price, 15);
  assert.equal(reconciled['A-1'].qty, 2);
  assert.equal(reconciled['A-1'].availability, 'available');
});

test('stock insuficiente conserva la intención y marca incidencia', () => {
  const cart = hydrateCart(payload([item('A-1', 8)]));
  const reconciled = reconcileCart(cart, [{ sku: 'A-1', name: 'A', price: 10, stock: 3 }]);
  assert.equal(reconciled['A-1'].qty, 8);
  assert.equal(reconciled['A-1'].availability, 'insufficient-stock');
});

test('producto sin stock no desaparece silenciosamente', () => {
  const cart = hydrateCart(payload([item('A-1')]));
  const reconciled = reconcileCart(cart, [{ sku: 'A-1', name: 'A', price: 10, stock: 0 }]);
  assert.equal(reconciled['A-1'].availability, 'out-of-stock');
});

test('producto eliminado o inactivo conserva snapshot como no disponible', () => {
  const cart = hydrateCart(payload([item('A-1', 2, 12)]));
  const reconciled = reconcileCart(cart, []);
  assert.equal(reconciled['A-1'].qty, 2);
  assert.equal(reconciled['A-1'].product.price, 12);
  assert.equal(reconciled['A-1'].availability, 'unavailable');
});

test('fallo temporal del catálogo deja el carrito hidratado pendiente', () => {
  const cart = hydrateCart(payload([item('A-1', 3)]));
  assert.equal(cart['A-1'].qty, 3);
  assert.equal(cart['A-1'].availability, 'pending');
});

test('createStoredCart guarda snapshot mínimo y no el catálogo completo', () => {
  const product = { sku: 'A-1', name: 'A', img: 'a.jpg', price: 9, stock: 5, specs: { large: true } };
  const stored = createStoredCart({ 'A-1': { product, qty: 2, availability: 'available' } }, NOW);
  assert.deepEqual(stored.items[0], {
    sku: 'A-1', quantity: 2, snapshot: { name: 'A', image: 'a.jpg', unitPriceAtAdd: 9 },
  });
});
