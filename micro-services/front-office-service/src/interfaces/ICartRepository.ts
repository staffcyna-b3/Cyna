import Cart from '../models/Cart';

export interface ICartRepository {
  findByUserIdWithItems(userId: string): Promise<Cart | null>;
  clearByCartId(cartId: string): Promise<void>;
}
