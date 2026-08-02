import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DELIVERY_METHODS } from '../src/data/deliveryMethods.js';
import { getPaymentOptions, methodRequiresBank, PAYMENT_BANKS, PAYMENT_METHODS } from '../src/data/paymentMethods.js';

const checkout = readFileSync(new URL('../src/components/CartCheckoutForm.jsx', import.meta.url), 'utf8');
const drawer = readFileSync(new URL('../src/components/CartDrawer.jsx', import.meta.url), 'utf8');
const store = readFileSync(new URL('../src/pages/Store.jsx', import.meta.url), 'utf8');
const navbar = readFileSync(new URL('../src/components/Navbar.jsx', import.meta.url), 'utf8');
const social = readFileSync(new URL('../src/components/SocialMenu.jsx', import.meta.url), 'utf8');
const payments = readFileSync(new URL('../src/components/DeliveryPayments.jsx', import.meta.url), 'utf8');
const cartContext = readFileSync(new URL('../src/context/CartContext.jsx', import.meta.url), 'utf8');

test('los métodos de entrega son únicos y respetan sus campos y costos', () => {
  assert.equal(DELIVERY_METHODS.length, 5);
  assert.equal(DELIVERY_METHODS.some((method) => method.value === 'especial' || method.label === 'Trayecto especial'), false);
  const cita = DELIVERY_METHODS.find((method) => method.value === 'cita_express');
  assert.equal(cita.label, 'Cooperativa de Transporte Cita Express');
  assert.equal(cita.needsCity, true);
  assert.equal(cita.needsAddress, false);
  assert.equal(cita.needsReference, false);
  const servientrega = DELIVERY_METHODS.find((method) => method.value === 'servientrega');
  assert.equal(servientrega.label, 'Servientrega (Min. $5.50)');
  assert.equal(servientrega.costLabel, 'Min. $5.50');
  assert.equal(servientrega.cost, 0);
  assert.equal(servientrega.needsReference, true);
  const delivery = DELIVERY_METHODS.find((method) => method.value === 'delivery_ambato');
  assert.equal(delivery.costLabel, 'Min. $2.00');
  assert.deepEqual(getPaymentOptions(delivery).map((option) => option.label), ['Efectivo', 'Transferencia']);
  assert.equal(methodRequiresBank(delivery, 'efectivo'), false);
  assert.equal(methodRequiresBank(delivery, 'transferencia'), true);
});

test('el checkout adapta dirección, ciudad y pagos al método seleccionado', () => {
  assert.match(checkout, /selectedMethod\?\.needsAddress/);
  assert.match(checkout, /selectedMethod\?\.needsCity/);
  assert.match(checkout, />Dirección<\/label>/);
  assert.match(checkout, />Referencia<\/label>/);
  assert.match(checkout, /referencia: selectedMethod\?\.needsReference/);
  assert.match(checkout, /paymentOptions\.map/);
  assert.match(checkout, /PAYMENT_BANKS\.map/);
  assert.match(checkout, /\{requiresBank && <div>/);
  assert.match(checkout, /direccion: selectedMethod\?\.needsAddress \? current\.direccion : ''/);
  assert.match(checkout, /ciudad: selectedMethod\?\.needsCity \? current\.ciudad : ''/);
  assert.deepEqual(PAYMENT_METHODS.map((method) => method.label), ['Transferencia', 'Depósito']);
  assert.deepEqual(PAYMENT_BANKS.map((bank) => bank.label), ['Banco Pichincha', 'Produbanco']);
});

test('la tienda cambia solo la presentación del filtro a un selector', () => {
  assert.match(store, /<select id="store-category" value=\{activeCategory\}/);
  assert.match(store, /setActiveCategory\(event\.target\.value\)/);
  assert.match(store, /categories\.map\(\(category\) => <option/);
  assert.doesNotMatch(store, /overflow-x-auto/);
});

test('el carrito exige confirmación explícita antes de vaciarse', () => {
  assert.match(drawer, /¿Deseas eliminar todos los productos del carrito\?/);
  assert.match(drawer, />Cancelar</);
  assert.match(drawer, /clearCart\(\); setConfirmingClear\(false\)/);
  assert.match(cartContext, /setSelectedDelivery\(null\)/);
  assert.match(cartContext, /setCheckoutStep\('cart'\)/);
});

test('las redes oficiales están disponibles en Inicio y Tienda y cierran de forma controlada', () => {
  assert.match(navbar, /<SocialMenu \/>/);
  assert.match(navbar, /<SocialMenu compact/);
  assert.equal((navbar.match(/<SocialMenu/g) || []).length, 4);
  assert.match(social, /facebook\.com\/share\/1968iyEpZv/);
  assert.match(social, /instagram\.com\/bya\.ecstore\?igsh=/);
  assert.match(social, /tiktok\.com\/@ba\.ecstore\?_r=1/);
  assert.match(social, /rel="noopener noreferrer"/);
  assert.match(social, /aria-expanded=\{open\}/);
  assert.match(social, /aria-haspopup="menu"/);
  assert.match(social, /document\.addEventListener\('pointerdown', closeOutside\)/);
  assert.match(social, /event\.key !== 'Escape'/);
  assert.match(social, /document\.removeEventListener\('pointerdown', closeOutside\)/);
  assert.match(social, /location\.pathname, location\.search, location\.hash/);
  assert.match(social, /onClick=\{\(\) => setOpen\(false\)\}/);
  assert.match(social, /<svg[\s\S]*facebook/);
});

test('los logos bancarios conservan proporción y usan marcos uniformes', () => {
  assert.deepEqual(PAYMENT_BANKS.map(({ logoWidth, logoHeight }) => [logoWidth, logoHeight]), [[920, 150], [320, 320]]);
  assert.match(checkout, /flex h-12 w-full items-center justify-center overflow-hidden/);
  assert.match(checkout, /alt=\{`Logo de \$\{bank\.label\}`\}/);
  assert.match(payments, /flex min-h-28 items-center justify-between/);
  assert.match(payments, /flex h-12 w-36 shrink-0 items-center justify-center overflow-hidden/);
  assert.match(payments, /alt=\{`Logo de \$\{bank\.label\}`\}/);
});
