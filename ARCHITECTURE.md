# Arquitectura

## Alcance

B&A.Ec Store es una SPA React. Google Sheets suministra contenido público y el
pedido se entrega a WhatsApp para confirmación manual. No existe una orden
transaccional ni una reserva de inventario en servidor.

## Capas

- `src/data`: configuración, métodos de entrega y adaptador Google GViz.
- `src/domain`: reglas puras de catálogo, carrito e imágenes.
- `src/services`: persistencia del carrito y salida hacia WhatsApp.
- `src/context`: providers de contenido remoto y estado del carrito.
- `src/hooks`: API consumida por los componentes.
- `src/components`: interfaz reutilizable.
- `src/pages`: composición de rutas.

## Flujo de datos

1. `ContentProvider` solicita Productos, Testimonios y Evidencias en paralelo.
2. `sheetsService` transforma y valida las filas antes de publicarlas.
3. `CartProvider` espera a que el catálogo esté listo y cruza el carrito guardado
   con SKU, stock y productos vigentes.
4. Solo después de esa hidratación se habilita la escritura a `localStorage`.
5. `checkoutService` genera el mensaje con los precios vigentes y abre WhatsApp.

## Decisiones

### Carrito

En almacenamiento solo persisten `{ sku: { qty } }`. El nombre, precio y stock
siempre se recuperan del catálogo vigente. SKU inexistentes, agotados o cantidades
inválidas se descartan durante la hidratación.

### Google Sheets

Primero se usa `fetch` con timeout. Si falla por red o CORS, cada petición JSONP
recibe un callback único. Esto permite respuestas concurrentes fuera de orden sin
mezclar las hojas.

### Límites de confianza

Google Sheets y `localStorage` son entradas no confiables y se validan. El mensaje
de WhatsApp sigue siendo una solicitud del cliente; el negocio debe confirmar
precio, disponibilidad, entrega y pago.

## Comandos de calidad

```bash
npm run lint
npm test
npm run build
```
