import { useCartContext } from '../context/CartContext';

// Wrapper delgado sobre el Context API — existe como punto único de entrada
// para que los componentes nunca importen CartContext directamente.
export function useCart() {
  return useCartContext();
}
