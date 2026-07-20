import { CART_STORAGE_KEY, CART_STORAGE_VERSION, CART_TTL_MS } from '../data/config.js';

function validSnapshot(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return {
    name: typeof value.name === 'string' ? value.name : '',
    image: typeof value.image === 'string' ? value.image : '',
    unitPriceAtAdd: Number.isFinite(value.unitPriceAtAdd) ? value.unitPriceAtAdd : 0,
  };
}

export function parseStoredCart(raw, now = Date.now()) {
  if (!raw) return { payload: null, reason: 'empty' };
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { payload: null, reason: 'invalid-json' };
  }
  if (!parsed || parsed.version !== CART_STORAGE_VERSION || !Array.isArray(parsed.items)) {
    return { payload: null, reason: 'invalid-schema' };
  }
  if (!Number.isFinite(parsed.updatedAt) || !Number.isFinite(parsed.expiresAt)) {
    return { payload: null, reason: 'invalid-dates' };
  }
  if (now >= parsed.expiresAt) return { payload: null, reason: 'expired' };

  const bySku = new Map();
  parsed.items.forEach((item) => {
    const sku = typeof item?.sku === 'string' ? item.sku.trim() : '';
    const quantity = item?.quantity;
    if (!sku || !Number.isInteger(quantity) || quantity <= 0) return;
    const previous = bySku.get(sku);
    bySku.set(sku, {
      sku,
      quantity: (previous?.quantity || 0) + quantity,
      snapshot: previous?.snapshot || validSnapshot(item.snapshot),
    });
  });
  return {
    payload: {
      version: CART_STORAGE_VERSION,
      updatedAt: parsed.updatedAt,
      expiresAt: parsed.expiresAt,
      items: [...bySku.values()],
    },
    reason: 'valid',
  };
}

export function loadStoredCart(storage = null, now = Date.now()) {
  try {
    const target = storage ?? globalThis.localStorage;
    const result = parseStoredCart(target?.getItem(CART_STORAGE_KEY), now);
    if (result.reason === 'expired') target?.removeItem(CART_STORAGE_KEY);
    return result.payload;
  } catch (error) {
    if (import.meta.env?.DEV) console.warn('[Carrito] No se pudo leer localStorage:', error);
    return null;
  }
}

export function createStoredCart(cart, now = Date.now()) {
  return {
    version: CART_STORAGE_VERSION,
    updatedAt: now,
    expiresAt: now + CART_TTL_MS,
    items: Object.values(cart).map(({ product, qty }) => ({
      sku: product.sku,
      quantity: qty,
      snapshot: {
        name: product.name || '',
        image: product.img || '',
        unitPriceAtAdd: Number.isFinite(product.price) ? product.price : 0,
      },
    })),
  };
}

export function saveStoredCart(cart, storage = null, now = Date.now()) {
  try {
    const target = storage ?? globalThis.localStorage;
    if (Object.keys(cart).length === 0) {
      target?.removeItem(CART_STORAGE_KEY);
      return null;
    }
    const payload = createStoredCart(cart, now);
    target?.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    if (import.meta.env?.DEV) console.warn('[Carrito] No se pudo guardar localStorage:', error);
    return null;
  }
}

export function clearStoredCart(storage = null) {
  try {
    const target = storage ?? globalThis.localStorage;
    target?.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    if (import.meta.env?.DEV) console.warn('[Carrito] No se pudo eliminar localStorage:', error);
  }
}
