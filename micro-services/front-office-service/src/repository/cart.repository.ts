import Cart from '../models/Cart';
import CartItem from '../models/CartItem';
import Product from '../models/Product';
import { ICartRepository } from '../interfaces/CartRepository';

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

  async findOrCreateCart(userId: string): Promise<Cart> {
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId }
    });
    return cart;
  }

  async findItemByIdAndCart(itemId: string, cartId: string): Promise<CartItem | null> {
    return await CartItem.findOne({
      where: {
        id: itemId,
        cart_id: cartId
      }
    });
  }

  async findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return await CartItem.findOne({
      where: { cart_id: cartId, product_id: productId }
    });
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    return await CartItem.create({
      cart_id: cartId,
      product_id: productId,
      quantity
    });
  }

  async removeItem(itemId: string, cartId: string): Promise<void> {
    await CartItem.destroy({
      where: { id: itemId, cart_id: cartId }
    });
  }

  async updateItem(itemId: string, cartId: string, quantity: number): Promise<CartItem | null> {
    const item = await CartItem.findOne({
      where: { id: itemId, cart_id: cartId }
    });

    if (!item) return null;

    return await item.update({ quantity });
  }

  async clearCartItems(cartId: string): Promise<void> {
    await CartItem.destroy({ where: { cart_id: cartId } });
  }
}