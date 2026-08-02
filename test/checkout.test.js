import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppOrderMessage } from '../src/services/checkoutService.js';

test('calcula el total e incluye los datos del pedido', () => {
  const message = buildWhatsAppOrderMessage({
    cartItems: [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 2 }],
    cartSubtotal: 20,
    shippingCost: 4.5,
    method: { label: 'Tramaco', costLabel: '$4.50', cost: 4.5, isPickup: false, needsCity: true, needsAddress: true },
    customer: { nombre: 'Ana', cedula: '123', telefono: '099', direccion: 'Centro', ciudad: 'Ambato' },
    payment: { methodLabel: 'Transferencia', bankLabel: 'Banco Pichincha' },
  });
  assert.match(message, /Producto A \(SKU A-1\) x2/);
  assert.match(message, /Total: \$24\.50/);
  assert.match(message, /Nombre: Ana/);
  assert.match(message, /Ciudad: Ambato/);
  assert.match(message, /Dirección de referencia: Centro/);
  assert.match(message, /Método de pago: Transferencia/);
  assert.match(message, /Banco: Banco Pichincha/);
});

test('no crea mensajes sin método o sin productos', () => {
  const base = { cartItems: [], cartSubtotal: 0, shippingCost: 0, customer: {}, payment: { methodLabel: 'Efectivo' } };
  assert.equal(buildWhatsAppOrderMessage({ ...base, method: null }), null);
  assert.equal(buildWhatsAppOrderMessage({ ...base, method: { label: 'Retiro' } }), null);
});

test('Cita Express solicita ciudad pero no incluye dirección de referencia', () => {
  const message = buildWhatsAppOrderMessage({
    cartItems: [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 1 }],
    cartSubtotal: 10,
    shippingCost: 3,
    method: { label: 'Cooperativa de Transporte Cita Express', costLabel: '$3.00', cost: 3, needsCity: true, needsAddress: false },
    customer: { nombre: 'Ana', cedula: '123', telefono: '099', direccion: 'No enviar', ciudad: 'Quito' },
    payment: { methodLabel: 'Depósito', bankLabel: 'Produbanco' },
  });
  assert.match(message, /Ciudad: Quito/);
  assert.doesNotMatch(message, /Dirección de referencia/);
  assert.match(message, /Método de pago: Depósito/);
  assert.match(message, /Banco: Produbanco/);
});

test('Servientrega no presenta precio y deja el envío sujeto a validación', () => {
  const message = buildWhatsAppOrderMessage({
    cartItems: [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 1 }],
    cartSubtotal: 10,
    shippingCost: 0,
    method: { label: 'Servientrega (sujeto a validación)', costLabel: 'Sujeto a validación', cost: 0, needsCity: true, needsAddress: true, costIsVariable: true, hideCost: true },
    customer: { nombre: 'Ana', cedula: '123', telefono: '099', direccion: 'Centro', ciudad: 'Cuenca' },
    payment: { methodLabel: 'Transferencia', bankLabel: 'Banco Pichincha' },
  });
  assert.match(message, /Envío \(Servientrega \(sujeto a validación\)\): Sujeto a validación/);
  assert.doesNotMatch(message, /\$5\.50/);
  assert.match(message, /Total: \$10\.00 \+ envío sujeto a validación/);
});

test('retiro usa efectivo y descarta banco, ciudad y dirección residuales', () => {
  const message = buildWhatsAppOrderMessage({
    cartItems: [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 1 }],
    cartSubtotal: 10,
    shippingCost: 0,
    method: { label: 'Retiro en el domicilio de la tienda', costLabel: 'Gratis', cost: 0, isPickup: true, needsCity: false, needsAddress: false },
    customer: { nombre: 'Ana', cedula: '123', telefono: '099', direccion: 'No enviar', ciudad: 'No enviar' },
    payment: { methodLabel: 'Efectivo', bankLabel: 'Banco residual' },
  });
  assert.match(message, /Método de pago: Efectivo/);
  assert.doesNotMatch(message, /Banco:|Ciudad:|Dirección de referencia:|undefined|null/);
});
