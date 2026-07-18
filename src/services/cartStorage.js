import { CART_STORAGE_KEY } from '../data/config';
import { toStoredCart } from '../domain/cart';

export function loadStoredCart(storage = localStorage) {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredCart(cart, storage = localStorage) {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(toStoredCart(cart)));
  } catch (error) {
    console.warn('No se pudo guardar el carrito en este navegador:', error);
  }
}
