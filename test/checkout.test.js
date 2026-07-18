import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppOrderMessage } from '../src/services/checkoutService.js';

test('calcula el total e incluye los datos del pedido', () => {
  const message = buildWhatsAppOrderMessage({
    cartItems: [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 2 }],
    cartSubtotal: 20,
    shippingCost: 4.5,
    method: { label: 'Tramaco', costLabel: '$4.50', cost: 4.5, isPickup: false },
    customer: { nombre: 'Ana', cedula: '123', telefono: '099', direccion: 'Centro', ciudad: 'Ambato' },
  });
  assert.match(message, /Producto A \(SKU A-1\) x2/);
  assert.match(message, /Total: \$24\.50/);
  assert.match(message, /Nombre: Ana/);
  assert.match(message, /Ciudad: Ambato/);
});

test('no crea mensajes sin método o sin productos', () => {
  const base = { cartItems: [], cartSubtotal: 0, shippingCost: 0, customer: {} };
  assert.equal(buildWhatsAppOrderMessage({ ...base, method: null }), null);
  assert.equal(buildWhatsAppOrderMessage({ ...base, method: { label: 'Retiro' } }), null);
});
