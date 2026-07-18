export function toStoredCart(cart) {
  return Object.fromEntries(
    Object.entries(cart).map(([sku, item]) => [sku, { qty: item.qty }])
  );
}

export function restoreCart(storedCart, products) {
  const productsBySku = new Map(products.map((product) => [product.sku, product]));
  const cart = {};
  let changed = false;

  Object.entries(storedCart || {}).forEach(([sku, saved]) => {
    const product = productsBySku.get(sku);
    const requestedQty = Number.parseInt(saved?.qty, 10);
    if (!product || product.stock <= 0 || !Number.isFinite(requestedQty) || requestedQty <= 0) {
      changed = true;
      return;
    }

    const qty = Math.min(requestedQty, product.stock);
    if (qty !== requestedQty) changed = true;
    cart[sku] = { product, qty };
  });

  return { cart, changed };
}
