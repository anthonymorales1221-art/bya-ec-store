import { useContext, useMemo } from 'react';
import { CartContext } from '../context/cart-context';
import { useContent } from './useContent';

// Wrapper delgado sobre el Context API — existe como punto único de entrada
// para que los componentes nunca importen CartContext directamente.
export function useCart() {
  const cart = useContext(CartContext);
  const content = useContent();
  if (!cart) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return useMemo(() => ({ ...content, ...cart }), [content, cart]);
}
