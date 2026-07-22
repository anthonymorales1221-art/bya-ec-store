import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const categories = readFileSync(new URL('../src/components/Categories.jsx', import.meta.url), 'utf8');
const testimonials = readFileSync(new URL('../src/components/Testimonials.jsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/Footer.jsx', import.meta.url), 'utf8');
const trustStrip = readFileSync(new URL('../src/components/TrustStrip.jsx', import.meta.url), 'utf8');
const navbar = readFileSync(new URL('../src/components/Navbar.jsx', import.meta.url), 'utf8');
const featured = readFileSync(new URL('../src/components/FeaturedProducts.jsx', import.meta.url), 'utf8');
const mobileMotion = readFileSync(new URL('../src/components/MobileEditorialMotion.jsx', import.meta.url), 'utf8');
const story = readFileSync(new URL('../src/components/StorySection.jsx', import.meta.url), 'utf8');
const buying = readFileSync(new URL('../src/components/BuyingJourney.jsx', import.meta.url), 'utf8');

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
  assert.match(css, /\.ba-testimonial-card[^}]*flex: 0 0 min\(88%, 390px\)/);
  assert.match(css, /\.ba-testimonial-card[^}]*scroll-snap-align: start/);
  assert.match(testimonials, /ba-testimonials-progress/);
  assert.match(testimonials, /active=\{index === activeSlide\}/);
});

test('la gramática editorial móvil está aislada, limpia sus triggers y no oculta contenido por defecto', () => {
  assert.match(mobileMotion, /max-width: 899px/);
  assert.match(mobileMotion, /prefers-reduced-motion: no-preference/);
  assert.match(mobileMotion, /onEnter: \(\) => gsap\.fromTo/);
  assert.match(mobileMotion, /return \(\) => media\.revert\(\)/);
  assert.doesNotMatch(mobileMotion, /autoAlpha:\s*0|opacity:\s*0[,}]/);
});

test('selección destacada móvil usa snap nativo, profundidad e indicador sincronizado', () => {
  assert.match(featured, /new IntersectionObserver/);
  assert.match(featured, /root: rail/);
  assert.match(featured, /ba-featured-mobile-progress/);
  assert.match(css, /\.ba-featured-scroll \.ba-product-card[^}]*scroll-snap-align: start/);
  assert.match(css, /\.ba-featured-scroll \.ba-product-card\.is-active[^}]*opacity: 1/);
});

test('nuestra selección y cómo comprar exponen progreso y estado activo sin pin móvil', () => {
  assert.match(story, /--story-progress/);
  assert.match(story, /ba-story-step[^`]*is-active/);
  assert.match(buying, /--buying-progress/);
  assert.match(buying, /ba-buying-step[^`]*is-active/);
  assert.match(css, /\.ba-story-steps::after, \.ba-buying-steps::after/);
});

test('nuestra selección fija en escritorio todo el mensaje editorial sin pin ni posición fixed', () => {
  const leadStart = story.indexOf('className="ba-story-lead"');
  const leadEnd = story.indexOf('</div>', leadStart);
  const stickyCopy = story.slice(leadStart, leadEnd);
  assert.match(stickyCopy, /Nuestra selección/);
  assert.match(stickyCopy, /No elegimos productos por cantidad/);
  assert.match(stickyCopy, /En B&A\.EC Store reunimos productos prácticos/);
  assert.match(css, /@media \(min-width: 1024px\)[\s\S]*?\.ba-story-lead[\s\S]*?position: sticky/);
  assert.match(css, /top: calc\(var\(--ba-header-offset\) \+ clamp/);
  assert.doesNotMatch(stickyCopy, /position:\s*fixed|pin:/);
  assert.doesNotMatch(story, /pin:/);
});

test('nuestra selección omite el visual decorativo y conserva progreso, pasos y sticky responsive', () => {
  const lead = story.indexOf('className="ba-story-lead"');
  const steps = story.indexOf('className="ba-story-steps');
  const mobileStart = css.indexOf('@media (max-width: 899px)');
  const mobileEnd = css.indexOf('\n}\n\n@media', mobileStart) + 2;
  const mobileCss = css.slice(mobileStart, mobileEnd);
  assert.ok(lead >= 0 && lead < steps);
  assert.match(story, /ba-story-column self-start lg:self-stretch/);
  assert.match(story, /0\{active \+ 1\}/);
  assert.doesNotMatch(story, /ba-story-media|Composición visual de B&A\.EC Store/);
  assert.doesNotMatch(css, /\.ba-story-media/);
  assert.match(mobileCss, /\.ba-story-lead \{ position: relative; \}/);
  assert.doesNotMatch(mobileCss, /\.ba-story-lead[^}]*position:\s*sticky/);
});

test('el menu movil cierra, restaura el body y navega al destino pendiente', () => {
  for (const target of ['#inicio', '#categorias', '#seleccion', '#como-comprar', '#opiniones']) {
    assert.match(navbar, new RegExp(`href: '${target}'`));
  }
  assert.match(navbar, /setPendingTarget\(href\)/);
  assert.match(navbar, /setMenuOpen\(false\)/);
  assert.match(navbar, /document\.body\.style\.overflow = previous/);
  assert.match(navbar, /requestAnimationFrame/);
  assert.match(navbar, /window\.scrollTo/);
  assert.match(navbar, /target\.getBoundingClientRect\(\)\.top \+ window\.scrollY - headerHeight/);
  assert.match(navbar, /root\.style\.scrollBehavior = 'auto'/);
  assert.match(navbar, /root\.style\.scrollBehavior = previousScrollBehavior/);
});

test('los destinos comparten offset y categorias no recorta contenido movil', () => {
  assert.match(css, /--ba-header-offset: 84px/);
  assert.match(css, /#seleccion,/);
  assert.match(css, /scroll-margin-top: var\(--ba-header-offset\)/);
  assert.match(css, /\.ba-categories-stage[^}]*overflow: visible/);
  assert.match(testimonials, /rail\?\.scrollTo\(\{ left: 0, behavior: 'auto' \}\)/);
});
