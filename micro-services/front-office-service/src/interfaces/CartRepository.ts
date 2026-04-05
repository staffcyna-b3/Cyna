import Cart from '../models/Cart';
import CartItem from '../models/CartItem';

export interface ICartRepository {
  findByUserIdWithItems(userId: string): Promise<Cart | null>;
  clearByCartId(cartId: string): Promise<void>;

  findOrCreateCart(userId: string): Promise<Cart>;
  findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null>;
  addItem(cartId: string, productId: string, quantity: number): Promise<CartItem>;
  updateItem(itemId: string, quantity: number): Promise<CartItem | null>;
  removeItem(itemId: string, cartId: string): Promise<void>;
}

