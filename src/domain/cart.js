export function hydrateCart(payload) {
  if (!payload?.items) return {};
  return Object.fromEntries(payload.items.map((item) => [item.sku, {
    product: {
      sku: item.sku,
      name: item.snapshot.name || `Producto ${item.sku}`,
      img: item.snapshot.image || '',
      price: item.snapshot.unitPriceAtAdd || 0,
      stock: 0,
    },
    qty: item.quantity,
    availability: 'pending',
  }]));
}

export function reconcileCart(cart, products) {
  const productsBySku = new Map(products.map((product) => [product.sku, product]));
  return Object.fromEntries(Object.entries(cart).map(([sku, item]) => {
    const current = productsBySku.get(sku);
    if (!current) return [sku, { ...item, availability: 'unavailable' }];
    if (current.stock <= 0) return [sku, { ...item, product: current, availability: 'out-of-stock' }];
    if (item.qty > current.stock) return [sku, { ...item, product: current, availability: 'insufficient-stock' }];
    return [sku, { ...item, product: current, availability: 'available' }];
  }));
}

export function toStoredCart(cart) {
  return Object.fromEntries(Object.entries(cart).map(([sku, item]) => [sku, { qty: item.qty }]));
}

export function restoreCart(storedCart, products) {
  const legacyPayload = {
    items: Object.entries(storedCart || {}).flatMap(([sku, saved]) => {
      const qty = Number.parseInt(saved?.qty, 10);
      return Number.isInteger(qty) && qty > 0
        ? [{ sku, quantity: qty, snapshot: {} }]
        : [];
    }),
  };
  const cart = reconcileCart(hydrateCart(legacyPayload), products);
  return { cart, changed: false };
}
