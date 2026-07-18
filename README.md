# B&A.Ec Store — Experiencia cinematográfica (Landing + Tienda)

Refactorización del sitio original (single-file `index.html`) a una app React/Vite
con dos páginas que comparten identidad visual, navbar, y carrito persistente.

## Arquitectura

```
/              → Landing cinematográfica (storytelling, GSAP pesado, FluidHero WebGL)
/tienda        → Catálogo optimizado para conversión (mínima animación, máxima velocidad)
```

Ambas páginas viven dentro del mismo `<CartProvider>` (Context API + localStorage),
así que el carrito, el catálogo cargado desde Google Sheets, y los testimonios
se mantienen sincronizados sin recargar nada al navegar entre ellas.

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (vía `@tailwindcss/vite`, configuración CSS-first en `src/index.css`)
- GSAP + ScrollTrigger — animaciones pesadas, **solo en la Landing**
- Framer Motion — microinteracciones en ambas páginas (drawer, modal, botones)
- React Router — `/` y `/tienda`
- `ogl` — WebGL del componente `FluidHero` (fondo fluido del hero)

## Instalación

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción → carpeta dist/
npm run preview   # sirve el build localmente para probarlo
```

## Conectar tu Google Sheet

La lógica de catálogo y testimonios es la misma que ya tenías validada.
Edita `src/data/config.js`:

```js
export const SHEET_ID = "TU_ID_AQUI";
```

El resto del comportamiento (columnas, formato `Etiqueta||Valor`, pestaña
"Productos" y "Testimonios", fallback a iniciales si falta imagen, etc.)
sigue exactamente las reglas de `GOOGLE_SHEET_SETUP.md` original — no cambió nada
de cara al cliente no técnico que llena el Sheet.

## Estructura de carpetas

```
src/
  components/       Navbar, Hero, StorySection, Categories, Testimonials,
                     TransitionCTA, ProductGrid, ProductModal, CartDrawer,
                     Footer, AnimatedBackground, FluidHero
  hooks/            API de contenido/carrito y hooks de animación
  context/          Providers separados de contenido y carrito
  domain/           Reglas puras y validación de catálogo/carrito
  services/         Persistencia local y construcción del checkout
  data/             Configuración y adaptador de Google Sheets
  pages/            Landing.jsx, Store.jsx
test/               Pruebas unitarias con el runner nativo de Node
```

## Decisiones de diseño relevantes

- **FluidHero**: migración del shader "Ferrofluid" (antes limitado a un recuadro)
  a un componente que cubre TODA la sección del hero, con mayor presencia e
  interacción de puntero/touch. Respeta `prefers-reduced-motion` (se desactiva
  el loop WebGL si el usuario lo pidió).
- **Categories**: reemplaza el carrusel 3D anterior por un "stacked reveal"
  (scale + blur progresivo al hacer scroll) inspirado en el sitio de referencia,
  pero construido con datos reales del catálogo (categorías con `categoria_destacada=TRUE`),
  no hardcodeado.
- **Tienda sin animación pesada**: ningún GSAP/ScrollTrigger corre en `/tienda` —
  solo transiciones CSS/Framer Motion ligeras en hover y en el drawer/modal,
  priorizando velocidad de carga y conversión.
- **Carrito**: se guarda solo `sku + qty` en localStorage (clave `bya_cart_v1`),
  igual que en el original — nunca un precio congelado. Al cargar, se cruza
  contra el catálogo vigente del Sheet.

## Correcciones aplicadas (segunda iteración)

1. **"Nuestra historia" no se revelaba al cargar (solo tras refrescar varias veces)**
   Causa real: ScrollTrigger calculaba la posición de los triggers de scroll
   ANTES de que el layout terminara de "asentarse" — fuentes web (Fraunces/Manrope)
   cambiando alturas de línea al llegar, imágenes externas resolviendo su tamaño,
   y secciones como Categories pasando de skeleton a contenido real tras cargar
   el Sheet. Como esos cambios de altura ocurrían después del cálculo inicial,
   los triggers quedaban con coordenadas obsoletas y el `onEnter` nunca disparaba
   — por eso solo parecía "arreglarse" al refrescar el navegador (un refresh real
   fuerza un layout completo nuevo).
   Solución: `useScrollAnimations.js` ahora centraliza un observer global
   (`ensureGlobalRefreshObserver`) que dispara `ScrollTrigger.refresh()` cuando
   las fuentes terminan de cargar (`document.fonts.ready`), cuando cualquier
   imagen del documento termina de cargar, y cuando el alto del `<body>` cambia
   (`ResizeObserver`). Se aplica en `useWordReveal`, `useFadeUp`, `useScaleReveal`
   y en el `gsap.fromTo` directo de `Categories.jsx`.

2. **Las fotos de la columna `imagen_url` del Sheet no cargaban**
   Causa real: la URL generada usaba `https://lh3.googleusercontent.com/d/FILE_ID`,
   que es un endpoint legado de Google que dejó de soportar hotlinking externo
   de forma confiable desde principios de 2024 (cambio de política de Google,
   no algo que dependiera de este código). El resto del catálogo (texto, precio,
   specs, stock) sí venía de la misma fuente gviz y por eso cargaba sin problema
   — solo la resolución de imagen usaba el endpoint equivocado.
   Solución: `sheetsService.js` ahora resuelve a `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`,
   el endpoint estable y documentado para mostrar imágenes públicas de Drive.
   Además, se creó `components/ProductImage.jsx`: si ese endpoint llegara a
   fallar para un archivo puntual, reintenta automáticamente con la variante
   `uc?export=view&id=FILE_ID` antes de mostrar el fallback de iniciales —
   nunca depende de un solo formato de URL. Se aplicó de forma consistente en
   `ProductGrid`, `ProductModal`, `CartDrawer`, `Testimonials` y `Categories`.
   Sigue aplicando la regla de siempre: si el Sheet no marcó el archivo como
   "Cualquiera con el enlace puede ver", ningún endpoint de Drive va a funcionar
   — eso no es algo que el código pueda resolver, está documentado en
   `GOOGLE_SHEET_SETUP.md` Paso 3.

## Pendientes para producción

1. Reemplazar las imágenes de stock (`StorySection`, `TransitionCTA`) por fotografía
   real del negocio.
2. Completar `PICKUP_ADDRESS_PLACEHOLDER` en `src/data/deliveryMethods.js` con la
   dirección real de retiro.
3. Revisar el copy de `StorySection.jsx` (narrativa de origen) — es contenido
   editorial de partida, recomendable ajustarlo con la historia real si difiere.
