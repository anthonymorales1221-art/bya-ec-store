export function buildWhatsAppOrderMessage({ cartItems, cartSubtotal, shippingCost, method, customer, payment }) {
  if (!method || cartItems.length === 0) return null;
  if (!method.isPickup && !payment?.methodLabel) return null;

  const total = method.costIsVariable ? cartSubtotal : cartSubtotal + shippingCost;
  const shippingLine = method.costLabel || `$${shippingCost.toFixed(2)}`;
  let message = '¡Hola! 👋 Quiero hacer este pedido en *B&A.Ec Store*:\n\n';

  cartItems.forEach((item) => {
    message += `• ${item.product.name} (SKU ${item.product.sku}) x${item.qty} — $${(item.qty * item.product.price).toFixed(2)}\n`;
  });

  message += `\n*Subtotal: $${cartSubtotal.toFixed(2)}*\n`;
  message += `*Envío (${method.label}): ${shippingLine}*\n`;
  message += `*Total: $${total.toFixed(2)}${method.costIsVariable ? ' + envío a coordinar' : ''}*\n\n`;
  message += '— Datos de entrega —\n';
  message += `Nombre: ${customer.nombre}\n`;
  message += `Cédula: ${customer.cedula}\n`;
  message += `Teléfono: ${customer.telefono}\n`;
  message += `Método de entrega: ${method.whatsappLabel || method.label}\n`;
  if (method.whatsappCostLine) message += `${method.whatsappCostLine}\n`;
  if (method.needsCity && customer.ciudad?.trim()) message += `Ciudad: ${customer.ciudad.trim()}\n`;
  if (method.needsAddress && customer.direccion?.trim()) message += `Dirección: ${customer.direccion.trim()}\n`;
  if (method.needsReference && customer.referencia?.trim()) message += `Referencia: ${customer.referencia.trim()}\n`;
  message += '\n— Método de pago —\n';
  if (method.isPickup) {
    message += 'Pago: Contra entrega, en efectivo o transferencia por coordinar\n';
  } else {
    message += `Método de pago: ${payment.methodLabel}\n`;
    if (method.bankRequiredFor?.includes(payment.value) && payment.bankLabel) message += `Banco: ${payment.bankLabel}\n`;
  }
  if (method.whatsappNote) message += `${method.whatsappNote}\n`;
  message += '\nQuedo atento a los datos para coordinar el pago. ¡Gracias!';
  return message;
}

export function openWhatsApp(number, message) {
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
