import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const categories = readFileSync(new URL('../src/components/Categories.jsx', import.meta.url), 'utf8');
const testimonials = readFileSync(new URL('../src/components/Testimonials.jsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/Footer.jsx', import.meta.url), 'utf8');
const trustStrip = readFileSync(new URL('../src/components/TrustStrip.jsx', import.meta.url), 'utf8');

test('categorías móviles forman una unidad en el orden editorial requerido', () => {
  assert.match(css, /\.ba-category-copy \{ display: contents; \}/);
  assert.match(css, /\.ba-category-number[^}]*order: 1/);
  assert.match(css, /\.ba-category-media[^}]*aspect-ratio: 4 \/ 5[^}]*order: 2/);
  assert.match(css, /\.ba-category-copy > div[^}]*order: 3/);
  assert.match(css, /\.ba-category-copy > \.ba-arrow-link[^}]*min-height: 48px[^}]*order: 4/);
  assert.doesNotMatch(css, /\.ba-category-copy > span[^}]*order: 4/);
});

test('el marco móvil reserva espacio sin heredar una altura de escritorio', () => {
  assert.match(css, /width: min\(100%, 520px\)/);
  assert.doesNotMatch(css, /max-height: min\(68svh, 590px\)/);
  assert.match(css, /\.ba-category-media[^}]*min-height: 0/);
  assert.match(categories, /variant="category"/);
});

test('desktop y móvil crean animaciones exclusivas por breakpoint', () => {
  assert.match(categories, /min-width: 900px/);
  assert.match(categories, /max-width: 899px/);
  assert.match(categories, /gsap\.matchMedia\(\)/);
  assert.match(categories, /return \(\) => media\.revert\(\)/);
  assert.match(testimonials, /min-width: 900px/);
  assert.match(testimonials, /max-width: 899px/);
});

test('las animaciones móviles nunca ocultan contenido antes del trigger', () => {
  const mobileCategoryEffect = categories.slice(categories.indexOf("media.add('(max-width: 899px)"));
  const mobileTestimonialEffect = testimonials.slice(testimonials.indexOf("media.add('(max-width: 899px)"));
  assert.doesNotMatch(mobileCategoryEffect, /autoAlpha:\s*0/);
  assert.doesNotMatch(mobileTestimonialEffect, /autoAlpha:\s*0/);
  assert.match(mobileCategoryEffect, /y: 28/);
  assert.match(mobileTestimonialEffect, /y: 26/);
});

test('testimonios móviles integran cita e identidad sin altura fija excesiva', () => {
  assert.match(css, /\.ba-testimonial-card[^}]*padding: clamp/);
  assert.match(css, /\.ba-testimonial-quote[^}]*min-height: 0/);
  assert.match(css, /\.ba-testimonial-identity[^}]*margin: 1\.25rem 0 0/);
});

test('el refresh móvil es controlado y no se ejecuta durante el render', () => {
  assert.match(categories, /requestAnimationFrame\(\(\) => ScrollTrigger\.refresh\(\)\)/);
  assert.match(categories, /addEventListener\('load', scheduleRefresh, true\)/);
  assert.doesNotMatch(categories, /ScrollTrigger\.refresh\(\);\s*return \(/);
});

test('WhatsApp respeta el área segura sin cambiar su acción', () => {
  assert.match(footer, /ba-whatsapp-float/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(footer, /onClick=\{contactWhatsAppForHelp\}/);
});

test('reduced motion mantiene visibles categorías y testimonios', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.ba-category-panel[^}]*opacity: 1 !important/);
  assert.match(css, /\.ba-testimonial-card[^}]*opacity: 1 !important/);
});

test('la franja movil conserva altura y la seccion siguiente no la invade', () => {
  assert.match(trustStrip, /ba-trust-strip/);
  assert.match(trustStrip, /ba-trust-track/);
  assert.match(css, /\.ba-trust-strip[^}]*min-height: 66px/);
  assert.match(css, /\.ba-trust-items > li[^}]*line-height: 1\.35/);
  assert.match(css, /\.ba-statement-panel \{ margin-top: 0; \}/);
});

test('el encabezado movil de testimonios queda en flujo y dentro del viewport', () => {
  assert.ok(testimonials.indexOf('data-testimonial-heading') < testimonials.indexOf('ba-testimonials-cards'));
  assert.match(css, /\.ba-testimonials-heading[^}]*max-width: min\(100%, 760px\)/);
  assert.match(css, /\.ba-testimonials-heading[^}]*position: relative/);
  assert.match(css, /\.ba-testimonials-heading[^}]*transform: none !important/);
  assert.match(css, /\.ba-testimonials-heading p[^}]*max-width: min\(100%, 36rem\)/);
});

test('solo la primera imagen de categoria recibe carga prioritaria', () => {
  assert.match(categories, /loading=\{index === 0 \? 'eager' : 'lazy'\}/);
  assert.match(categories, /fetchPriority=\{index === 0 \? 'high' : 'auto'\}/);
  assert.match(css, /\.ba-commerce-image--category\.is-loaded \.ba-commerce-image-main[^}]*opacity: 1 !important/);
  assert.match(css, /\[data-category-depth\][^}]*opacity: 0 !important[^}]*visibility: hidden !important/);
});

test('testimonios moviles usan un carrusel tactil editorial continuo', () => {
  assert.match(testimonials, /role="region" aria-label="Testimonios de clientes" tabIndex="0"/);
  assert.match(css, /\.ba-testimonials-cards[^}]*display: flex/);
  assert.match(css, /\.ba-testimonials-cards[^}]*overflow-x: auto/);
  assert.match(css, /\.ba-testimonials-cards[^}]*scroll-snap-type: x mandatory/);
  assert.match(css, /\.ba-testimonial-card[^}]*flex: 0 0 min\(82vw, 390px\)/);
  assert.match(css, /\.ba-testimonial-card[^}]*scroll-snap-align: start/);
});
