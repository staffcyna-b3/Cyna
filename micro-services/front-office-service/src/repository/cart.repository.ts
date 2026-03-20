import Cart from '../models/Cart';
import CartItem from '../models/CartItem';
import Product from '../models/Product';
import { ICartRepository } from '../interfaces/ICartRepository';

export class CartRepository implements ICartRepository {
  async findByUserIdWithItems(userId: string): Promise<Cart | null> {
    return Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });
  }

  async clearByCartId(cartId: string): Promise<void> {
    await CartItem.destroy({ where: { cart_id: cartId } });
  }
}
