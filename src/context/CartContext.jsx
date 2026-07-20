import { useCallback, useEffect, useMemo, useState } from 'react';
import { CART_STORAGE_KEY, WHATSAPP_NUMBER } from '../data/config';
import { DELIVERY_METHODS } from '../data/deliveryMethods';
import { hydrateCart, reconcileCart } from '../domain/cart';
import { useContent } from '../hooks/useContent';
import { buildWhatsAppOrderMessage, openWhatsApp } from '../services/checkoutService';
import { clearStoredCart, loadStoredCart, parseStoredCart, saveStoredCart } from '../services/cartStorage';
import { CartContext } from './cart-context';

export function CartProvider({ children }) {
  const { products, catalogStatus } = useContent();
  const [cart, setCart] = useState(() => hydrateCart(loadStoredCart()));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('cart');

  useEffect(() => {
    if (catalogStatus !== 'ready') return;
    setCart((previous) => reconcileCart(previous, products));
  }, [products, catalogStatus]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      if (event.newValue === null) {
        setCart({});
        return;
      }
      const { payload } = parseStoredCart(event.newValue);
      if (payload) {
        const incoming = hydrateCart(payload);
        setCart(catalogStatus === 'ready' ? reconcileCart(incoming, products) : incoming);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [catalogStatus, products]);

  const mutateCart = useCallback((updater) => {
    setCart((previous) => {
      const next = updater(previous);
      if (next !== previous) saveStoredCart(next);
      return next;
    });
  }, []);

  const addToCart = useCallback((sku) => {
    mutateCart((previous) => {
      const product = products.find((item) => item.sku === sku);
      if (!product || product.stock <= 0) return previous;
      const existing = previous[sku];
      if (!existing) return { ...previous, [sku]: { product, qty: 1, availability: 'available' } };
      if (existing.qty >= product.stock) return previous;
      return { ...previous, [sku]: { ...existing, product, qty: existing.qty + 1, availability: 'available' } };
    });
  }, [mutateCart, products]);

  const changeQty = useCallback((sku, delta) => {
    mutateCart((previous) => {
      const existing = previous[sku];
      if (!existing) return previous;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const next = { ...previous };
        delete next[sku];
        return next;
      }
      if (delta > 0 && (existing.product.stock <= 0 || nextQty > existing.product.stock)) return previous;
      const availability = existing.product.stock > 0 && nextQty <= existing.product.stock
        ? 'available'
        : existing.availability;
      return { ...previous, [sku]: { ...existing, qty: nextQty, availability } };
    });
  }, [mutateCart]);

  const removeFromCart = useCallback((sku) => {
    mutateCart((previous) => {
      if (!previous[sku]) return previous;
      const next = { ...previous };
      delete next[sku];
      return next;
    });
  }, [mutateCart]);
  const clearCart = useCallback(() => {
    setCart({});
    clearStoredCart();
  }, []);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems]);
  const validCartItems = useMemo(
    () => cartItems.filter((item) => item.availability === 'available'),
    [cartItems]
  );
  const cartHasIssues = validCartItems.length !== cartItems.length;
  const cartSubtotal = useMemo(
    () => validCartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0),
    [validCartItems]
  );
  const selectedMethod = useMemo(
    () => DELIVERY_METHODS.find((method) => method.value === selectedDelivery) || null,
    [selectedDelivery]
  );
  const shippingCost = selectedMethod?.cost || 0;
  const cartTotal = cartSubtotal + shippingCost;

  const openCart = useCallback(() => {
    setCheckoutStep('cart');
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const goToCheckoutStep = useCallback(() => {
    if (cartItems.length > 0 && !cartHasIssues) setCheckoutStep('checkout');
  }, [cartItems.length, cartHasIssues]);
  const goToCartStep = useCallback(() => setCheckoutStep('cart'), []);

  const confirmOrder = useCallback((customer) => {
    if (cartHasIssues) return;
    const message = buildWhatsAppOrderMessage({
      cartItems: validCartItems, cartSubtotal, shippingCost, method: selectedMethod, customer,
    });
    if (message) openWhatsApp(WHATSAPP_NUMBER, message);
  }, [validCartItems, cartSubtotal, shippingCost, selectedMethod, cartHasIssues]);

  const contactWhatsAppForHelp = useCallback((message) => {
    const humanMessage = typeof message === 'string'
      ? message
      : '¡Hola! Necesito ayuda con los productos de B&A.EC Store. ¿Me podrían ayudar?';
    openWhatsApp(WHATSAPP_NUMBER, humanMessage);
  }, []);

  const value = useMemo(() => ({
    cart, cartItems, cartCount, cartSubtotal, cartTotal, shippingCost, cartHasIssues,
    addToCart, changeQty, removeFromCart, clearCart,
    isCartOpen, openCart, closeCart, checkoutStep, goToCheckoutStep, goToCartStep,
    selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder, contactWhatsAppForHelp,
  }), [
    cart, cartItems, cartCount, cartSubtotal, cartTotal, shippingCost, cartHasIssues,
    addToCart, changeQty, removeFromCart, clearCart, isCartOpen, openCart, closeCart,
    checkoutStep, goToCheckoutStep, goToCartStep, selectedDelivery, selectedMethod,
    confirmOrder, contactWhatsAppForHelp,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
