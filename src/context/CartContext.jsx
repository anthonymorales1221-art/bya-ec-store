import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WHATSAPP_NUMBER } from '../data/config';
import { DELIVERY_METHODS } from '../data/deliveryMethods';
import { restoreCart, toStoredCart } from '../domain/cart';
import { useContent } from '../hooks/useContent';
import { buildWhatsAppOrderMessage, openWhatsApp } from '../services/checkoutService';
import { loadStoredCart, saveStoredCart } from '../services/cartStorage';
import { CartContext } from './cart-context';

export function CartProvider({ children }) {
  const { products, catalogStatus } = useContent();
  const [cart, setCart] = useState({});
  const storedCartRef = useRef(loadStoredCart());
  const [cartHydrated, setCartHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('cart');

  useEffect(() => {
    if (catalogStatus !== 'ready' || cartHydrated) return;
    const restored = restoreCart(storedCartRef.current, products);
    setCart(restored.cart);
    storedCartRef.current = toStoredCart(restored.cart);
    setCartHydrated(true);
    if (restored.changed) saveStoredCart(restored.cart);
  }, [products, catalogStatus, cartHydrated]);

  useEffect(() => {
    if (cartHydrated) saveStoredCart(cart);
  }, [cart, cartHydrated]);

  const addToCart = useCallback((sku) => {
    setCart((previous) => {
      const product = products.find((item) => item.sku === sku);
      if (!product || product.stock <= 0) return previous;
      const existing = previous[sku];
      if (!existing) return { ...previous, [sku]: { product, qty: 1 } };
      if (existing.qty >= product.stock) return previous;
      return { ...previous, [sku]: { ...existing, product, qty: existing.qty + 1 } };
    });
  }, [products]);

  const changeQty = useCallback((sku, delta) => {
    setCart((previous) => {
      const existing = previous[sku];
      if (!existing) return previous;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const next = { ...previous };
        delete next[sku];
        return next;
      }
      return { ...previous, [sku]: { ...existing, qty: Math.min(nextQty, existing.product.stock) } };
    });
  }, []);

  const removeFromCart = useCallback((sku) => {
    setCart((previous) => {
      const next = { ...previous };
      delete next[sku];
      return next;
    });
  }, []);
  const clearCart = useCallback(() => setCart({}), []);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0),
    [cartItems]
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
    if (cartItems.length > 0) setCheckoutStep('checkout');
  }, [cartItems.length]);
  const goToCartStep = useCallback(() => setCheckoutStep('cart'), []);

  const confirmOrder = useCallback((customer) => {
    const message = buildWhatsAppOrderMessage({
      cartItems, cartSubtotal, shippingCost, method: selectedMethod, customer,
    });
    if (message) openWhatsApp(WHATSAPP_NUMBER, message);
  }, [cartItems, cartSubtotal, shippingCost, selectedMethod]);

  const contactWhatsAppForHelp = useCallback(() => {
    openWhatsApp(WHATSAPP_NUMBER, '¡Hola! Necesito ayuda con un producto especial. ¿Me podrían ayudar?');
  }, []);

  const value = useMemo(() => ({
    cart, cartItems, cartCount, cartSubtotal, cartTotal, shippingCost,
    addToCart, changeQty, removeFromCart, clearCart,
    isCartOpen, openCart, closeCart, checkoutStep, goToCheckoutStep, goToCartStep,
    selectedDelivery, setSelectedDelivery, selectedMethod, confirmOrder, contactWhatsAppForHelp,
  }), [
    cart, cartItems, cartCount, cartSubtotal, cartTotal, shippingCost,
    addToCart, changeQty, removeFromCart, clearCart, isCartOpen, openCart, closeCart,
    checkoutStep, goToCheckoutStep, goToCartStep, selectedDelivery, selectedMethod,
    confirmOrder, contactWhatsAppForHelp,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
