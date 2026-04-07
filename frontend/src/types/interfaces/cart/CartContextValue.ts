import { CartItem } from './CartItem';
import { AddToCartOptions } from './AddToCartOptions';

export interface CartContextValue {
    cartId: string | null;
    items: CartItem[];
    totalAmount: number;
    isLoading: boolean;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, options: AddToCartOptions) => Promise<void>;
    removeFromCart: (itemId: string, productId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
}