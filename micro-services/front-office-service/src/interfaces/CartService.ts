import CartItem from '../models/CartItem';
import { CartResponse } from '../dto/response/CartResponse';

export interface ICartService {
    getCart(userId: string): Promise<CartResponse>;
    addToCart(userId: string, productId: string, quantity: number, period?: number): Promise<CartItem>;
    removeFromCart(userId: string, itemId: string): Promise<void>;
    updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem | null>;
    clearCart(userId: string): Promise<void>;
}