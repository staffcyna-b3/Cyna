import { AddToCartOptions } from "@/types/interfaces/cart/AddToCartOptions";

export function addToCart(productId: string, options: AddToCartOptions = {}) {
  // Placeholder: replace with real cart context / API call
  const { quantity = 1, period } = options;
  if (period) {
    alert(`Ajouter au panier: product=${productId}, period=${period}`);
    return;
  }
  alert(`Ajouter au panier: product=${productId}, qty=${quantity}`);
}
