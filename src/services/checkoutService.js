import { PICKUP_ADDRESS_PLACEHOLDER } from '../data/deliveryMethods.js';

export function buildWhatsAppOrderMessage({ cartItems, cartSubtotal, shippingCost, method, customer, payment }) {
  if (!method || !payment?.methodLabel || cartItems.length === 0) return null;

  const total = method.costIsVariable ? cartSubtotal : cartSubtotal + shippingCost;
  const shippingLine = method.hideCost
    ? method.costLabel
    : method.costIsVariable ? method.costLabel : `$${shippingCost.toFixed(2)}`;
  let message = '¡Hola! 👋 Quiero hacer este pedido en *B&A.Ec Store*:\n\n';

  cartItems.forEach((item) => {
    message += `• ${item.product.name} (SKU ${item.product.sku}) x${item.qty} — $${(item.qty * item.product.price).toFixed(2)}\n`;
  });

  message += `\n*Subtotal: $${cartSubtotal.toFixed(2)}*\n`;
  message += `*Envío (${method.label}): ${shippingLine}*\n`;
  message += `*Total: $${total.toFixed(2)}${method.costIsVariable ? ` + envío ${method.hideCost ? 'sujeto a validación' : 'a coordinar'}` : ''}*\n\n`;
  message += '— Datos de entrega —\n';
  message += `Nombre: ${customer.nombre}\n`;
  message += `Cédula: ${customer.cedula}\n`;
  message += `Teléfono: ${customer.telefono}\n`;
  message += `Método de entrega: ${method.label}\n`;
  if (method.isPickup) {
    message += `Dirección de retiro: ${PICKUP_ADDRESS_PLACEHOLDER}\n`;
  } else {
    if (method.needsCity) message += `Ciudad: ${customer.ciudad}\n`;
    if (method.needsAddress) message += `Dirección de referencia: ${customer.direccion}\n`;
  }
  message += '\n— Método de pago —\n';
  message += `Método de pago: ${payment.methodLabel}\n`;
  if (!method.isPickup && payment.bankLabel) message += `Banco: ${payment.bankLabel}\n`;
  message += '\nQuedo atento a los datos para coordinar el pago. ¡Gracias!';
  return message;
}

export function openWhatsApp(number, message) {
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
