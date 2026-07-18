import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { fetchProducts, fetchTestimonials, fetchEvidencias } from '../data/sheetsService';
import { CART_STORAGE_KEY, WHATSAPP_NUMBER } from '../data/config';
import { DELIVERY_METHODS, PICKUP_ADDRESS_PLACEHOLDER } from '../data/deliveryMethods';

const CartContext = createContext(null);

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function saveCartToStorage(cart) {
  try {
    const slim = {};
    Object.entries(cart).forEach(([sku, item]) => {
      slim[sku] = { qty: item.qty };
    });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(slim));
  } catch (err) {
    console.warn('No se pudo guardar el carrito en este navegador:', err);
  }
}

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState('loading'); // loading | ready | error
  const [testimonialsStatus, setTestimonialsStatus] = useState('loading');
  const [evidenciasStatus, setEvidenciasStatus] = useState('loading');

  const [cart, setCart] = useState({}); // sku -> { product, qty }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout'

  /* ---------- Carga inicial del catálogo desde Google Sheets ---------- */
  const loadCatalog = useCallback(async () => {
    setCatalogStatus('loading');
    try {
      const list = await fetchProducts();
      setProducts(list);
      setCatalogStatus('ready');

      // Cruza el carrito guardado contra el catálogo recién cargado: descarta
      // productos que ya no existen / están inactivos / sin stock, y topa
      // la cantidad guardada al stock vigente. Nunca usa un precio viejo.
      const slim = loadCartFromStorage();
      const restored = {};
      let droppedAny = false;
      Object.entries(slim).forEach(([sku, saved]) => {
        const product = list.find((p) => p.sku === sku);
        if (!product || product.stock <= 0) {
          droppedAny = true;
          return;
        }
        const qty = Math.min(saved.qty || 1, product.stock);
        restored[sku] = { product, qty };
      });
      setCart(restored);
      if (droppedAny) saveCartToStorage(restored);
    } catch {
      setCatalogStatus('error');
    }
  }, []);

  const loadTestimonialsData = useCallback(async () => {
    setTestimonialsStatus('loading');
    try {
      const list = await fetchTestimonials();
      setTestimonials(list);
      setTestimonialsStatus('ready');
    } catch {
      setTestimonialsStatus('error');
    }
  }, []);

  const loadEvidenciasData = useCallback(async () => {
    setEvidenciasStatus('loading');
    try {
      const list = await fetchEvidencias();
      setEvidencias(list);
      setEvidenciasStatus('ready');
    } catch {
      setEvidenciasStatus('error');
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    loadTestimonialsData();
    loadEvidenciasData();
  }, [loadCatalog, loadTestimonialsData, loadEvidenciasData]);

  /* ---------- Persistencia del carrito ---------- */
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  /* ---------- Acciones del carrito ---------- */
  const addToCart = useCallback((sku) => {
    setCart((prev) => {
      const product = products.find((p) => p.sku === sku);
      if (!product || product.stock <= 0) return prev;
      const existing = prev[sku];
      if (!existing) {
        return { ...prev, [sku]: { product, qty: 1 } };
      }
      if (existing.qty < product.stock) {
        return { ...prev, [sku]: { ...existing, qty: existing.qty + 1 } };
      }
      return prev;
    });
  }, [products]);

  const changeQty = useCallback((sku, delta) => {
    setCart((prev) => {
      const existing = prev[sku];
      if (!existing) return prev;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[sku];
        return next;
      }
      const cappedQty = Math.min(nextQty, existing.product.stock);
      return { ...prev, [sku]: { ...existing, qty: cappedQty } };
    });
  }, []);

  const removeFromCart = useCallback((sku) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  /* ---------- Derivados ---------- */
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0),
    [cartItems]
  );
  const selectedMethod = useMemo(
    () => DELIVERY_METHODS.find((m) => m.value === selectedDelivery) || null,
    [selectedDelivery]
  );
  const shippingCost = selectedMethod ? selectedMethod.cost : 0;
  const cartTotal = cartSubtotal + shippingCost;

  /* ---------- Checkout / WhatsApp ---------- */
  const openCart = useCallback(() => {
    setCheckoutStep('cart');
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const goToCheckoutStep = useCallback(() => {
    if (cartItems.length === 0) return;
    setCheckoutStep('checkout');
  }, [cartItems.length]);
  const goToCartStep = useCallback(() => setCheckoutStep('cart'), []);

  const buildWhatsAppMessage = useCallback(
    ({ nombre, cedula, telefono, direccion, ciudad }) => {
      const method = selectedMethod;
      if (!method) return null;
      const subtotal = cartSubtotal;
      const shipping = shippingCost;
      const total = method.costIsVariable ? subtotal : subtotal + shipping;
      const shippingLine = method.costIsVariable ? method.costLabel : `$${shipping.toFixed(2)}`;

      let message = '¡Hola! 👋 Quiero hacer este pedido en *B&A.Ec Store*:\n\n';
      cartItems.forEach((item) => {
        message += `• ${item.product.name} (SKU ${item.product.sku}) x${item.qty} — $${(item.qty * item.product.price).toFixed(2)}\n`;
      });
      message += `\n*Subtotal: $${subtotal.toFixed(2)}*\n`;
      message += `*Envío (${method.label}): ${shippingLine}*\n`;
      message += `*Total: $${total.toFixed(2)}${method.costIsVariable ? ' + envío a coordinar' : ''}*\n\n`;
      message += '— Datos de entrega —\n';
      message += `Nombre: ${nombre}\n`;
      message += `Cédula: ${cedula}\n`;
      message += `Teléfono: ${telefono}\n`;
      message += `Método de entrega: ${method.label}\n`;
      if (method.isPickup) {
        message += `Dirección: ${PICKUP_ADDRESS_PLACEHOLDER}\n`;
      } else {
        message += `Dirección: ${direccion}\n`;
        message += `Ciudad: ${ciudad}\n`;
      }
      message += '\nQuedo atento a los datos para coordinar el pago. ¡Gracias!';
      return message;
    },
    [cartItems, cartSubtotal, shippingCost, selectedMethod]
  );

  const confirmOrder = useCallback(
    (formData) => {
      const message = buildWhatsAppMessage(formData);
      if (!message) return;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      // El carrito NO se vacía automáticamente: window.open puede ser bloqueado,
      // o la persona puede cerrar WhatsApp sin enviar — ver DECISIONES.md.
    },
    [buildWhatsAppMessage]
  );

  const contactWhatsAppForHelp = useCallback(() => {
    const message = '¡Hola! Necesito ayuda con un producto especial. ¿Me podrían ayudar?';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }, []);

  const value = {
    // catálogo
    products,
    catalogStatus,
    reloadCatalog: loadCatalog,
    // testimonios
    testimonials,
    testimonialsStatus,
    reloadTestimonials: loadTestimonialsData,
    // evidencias
    evidencias,
    evidenciasStatus,
    reloadEvidencias: loadEvidenciasData,
    // carrito
    cart,
    cartItems,
    cartCount,
    cartSubtotal,
    cartTotal,
    shippingCost,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
    // drawer / checkout
    isCartOpen,
    openCart,
    closeCart,
    checkoutStep,
    goToCheckoutStep,
    goToCartStep,
    selectedDelivery,
    setSelectedDelivery,
    selectedMethod,
    confirmOrder,
    contactWhatsAppForHelp,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext debe usarse dentro de <CartProvider>');
  return ctx;
}
