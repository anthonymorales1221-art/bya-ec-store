import test from 'node:test';
import assert from 'node:assert/strict';
import { DELIVERY_METHODS } from '../src/data/deliveryMethods.js';
import { buildWhatsAppOrderMessage } from '../src/services/checkoutService.js';

const cart = [{ product: { sku: 'A-1', name: 'Producto A', price: 10 }, qty: 1 }];
const customer = {
  nombre: 'Ana', cedula: '123', telefono: '099', ciudad: 'Ambato',
  direccion: 'Centro', referencia: 'Casa azul',
};
const method = (value) => DELIVERY_METHODS.find((item) => item.value === value);
const build = (delivery, payment = {}) => buildWhatsAppOrderMessage({
  cartItems: cart,
  cartSubtotal: 10,
  shippingCost: delivery.cost,
  method: delivery,
  customer,
  payment,
});

test('Tramaco suma su costo fijo e incluye dirección, referencia, pago y banco', () => {
  const message = build(method('tramaco'), { value: 'transferencia', methodLabel: 'Transferencia', bankLabel: 'Banco Pichincha' });
  assert.match(message, /Total: \$14\.50/);
  assert.match(message, /Ciudad: Ambato/);
  assert.match(message, /Dirección: Centro/);
  assert.match(message, /Referencia: Casa azul/);
  assert.match(message, /Método de pago: Transferencia/);
  assert.match(message, /Banco: Banco Pichincha/);
});

test('no crea mensajes sin método, productos o pago requerido', () => {
  assert.equal(buildWhatsAppOrderMessage({ cartItems: [], cartSubtotal: 0, shippingCost: 0, method: null, customer: {}, payment: {} }), null);
  assert.equal(build(method('tramaco')), null);
});

test('Cita Express incluye solo ciudad, pago y banco', () => {
  const message = build(method('cita_express'), { value: 'deposito', methodLabel: 'Depósito', bankLabel: 'Produbanco' });
  assert.match(message, /Ciudad: Ambato/);
  assert.match(message, /Método de pago: Depósito/);
  assert.match(message, /Banco: Produbanco/);
  assert.doesNotMatch(message, /Dirección:|Referencia:/);
});

test('Servientrega informa desde $5.50 sin sumarlo al total', () => {
  const message = build(method('servientrega'), { value: 'transferencia', methodLabel: 'Transferencia', bankLabel: 'Banco Pichincha' });
  assert.match(message, /Método de entrega: Servientrega \(Sujeto a Validación\)/);
  assert.match(message, /Envío \(Servientrega\): Min\. \$5\.50/);
  assert.match(message, /Costo de envío: desde \$5\.50/);
  assert.match(message, /Total: \$10\.00 \+ envío a coordinar/);
  assert.match(message, /Dirección: Centro/);
  assert.match(message, /Referencia: Casa azul/);
  assert.doesNotMatch(message, /Servientrega \(Min\. \$5\.50\)/);
});

test('retiro es gratis, no exige pago y descarta todos los datos residuales', () => {
  const message = build(method('retiro_clienta'), { value: 'transferencia', methodLabel: 'Transferencia', bankLabel: 'Banco residual' });
  assert.match(message, /Costo de entrega: Gratis/);
  assert.match(message, /Pago: Contra entrega, en efectivo o transferencia por coordinar/);
  assert.doesNotMatch(message, /Banco:|Ciudad:|Dirección:|Referencia:|Método de pago:|undefined|null/);
});

test('delivery informa desde $2.00 y efectivo descarta banco y dirección', () => {
  const message = build(method('delivery_ambato'), { value: 'efectivo', methodLabel: 'Efectivo', bankLabel: 'Banco residual' });
  assert.match(message, /Método de entrega: Delivery en Ambato \(Sujeto a Validación\)/);
  assert.match(message, /Envío \(Delivery en Ambato\): Min\. \$2\.00/);
  assert.match(message, /Costo de delivery: desde \$2\.00/);
  assert.match(message, /Método de pago: Efectivo/);
  assert.match(message, /El cliente compartirá su ubicación por WhatsApp/);
  assert.doesNotMatch(message, /Banco:|Ciudad:|Dirección:|Referencia:/);
  assert.match(message, /Total: \$10\.00 \+ envío a coordinar/);
});

test('delivery por transferencia incluye únicamente el banco seleccionado', () => {
  const message = build(method('delivery_ambato'), { value: 'transferencia', methodLabel: 'Transferencia', bankLabel: 'Produbanco' });
  assert.match(message, /Método de pago: Transferencia/);
  assert.match(message, /Banco: Produbanco/);
});
