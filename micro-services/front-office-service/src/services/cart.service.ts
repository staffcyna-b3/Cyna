import { HttpError } from '../common/HttpError';
import { ICartRepository } from '../interfaces/CartRepository';
import { ICartService } from '../interfaces/CartService';
import { CartResponse } from '../dto/response/CartResponse';
import { CartItemResponse } from '../dto/response/CartItemResponse';
import { ProductStatus } from '../enum/ProductStatus';
import CartItem from '../models/CartItem';
import Cart from '../models/Cart';
import Product from '../models/Product';

export class CartService implements ICartService {
  constructor(private readonly cartRepository: ICartRepository) { }

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      return { id: null, items: [], totalAmount: 0 };
    }

    const cartWithItems = cart as Cart & { items: (CartItem & { product: Product })[] };

    const items: CartItemResponse[] = cartWithItems.items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.product.price),
      subtotal: item.quantity * Number(item.product.price),
      isService: item.product.is_service,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      items,
      totalAmount: Number(totalAmount.toFixed(2))
    };
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new HttpError(404, 'Produit introuvable');
    }

    if (product.status === ProductStatus.UNAVAILABLE) {
      throw new HttpError(422, 'Le produit est indisponible');
    }

    if (!product.is_service && product.stock < quantity) {
      throw new HttpError(422, `Stock insuffisant. Disponible: ${product.stock}`);
    }

    const cart = await this.cartRepository.findOrCreateCart(userId);

    const existingItem = await this.cartRepository.findItemByCartAndProduct(cart.id, productId);

    if (existingItem) {
      return await this.cartRepository.updateItem(
        existingItem.id,
        existingItem.quantity + quantity
      ) as CartItem;
    }

    return await this.cartRepository.addItem(cart.id, productId, quantity);
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      throw new HttpError(404, 'Panier introuvable');
    }

    await this.cartRepository.removeItem(itemId, cart.id);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      throw new HttpError(422, 'La quantité doit être supérieure à 0');
    }

    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      throw new HttpError(404, 'Panier introuvable');
    }

    return await this.cartRepository.updateItem(itemId, quantity);
  }
}