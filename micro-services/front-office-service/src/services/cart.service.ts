import { HttpError } from '../common/HttpError';
import { ICartRepository } from '../interfaces/CartRepository';
import { ICartService } from '../interfaces/CartService';
import { IShippingService } from '../interfaces/IShippingService';
import { CartResponse } from '../dto/response/CartResponse';
import { CartItemResponse } from '../dto/response/CartItemResponse';
import { ProductStatus } from '../enum/ProductStatus';
import CartItem from '../models/CartItem';
import Cart from '../models/Cart';
import Product from '../models/Product';
import ProductImage from '../models/ProductImage';
import { IProductRepository } from '../interfaces/ProductRepository';

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly shippingService: IShippingService,
  ) { }

  async getCart(userId: string): Promise<CartResponse> {
    //Trouve le panier associé à l'utilisateur et récupère tous les items de ce panier
    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      return { id: null, items: [], totalAmount: 0, shippingFee: 0 };
    }

    //forcer typescript a comprendre que le cart contient les items, et que chaque item contient un product
    const cartWithItems = cart as Cart & { items: (CartItem & { product: Product & { images: ProductImage[] } })[] };

    const productIds = cartWithItems.items.map((item) => item.product_id);
    const promoResults = await Promise.all(
      productIds.map((id) => this.productRepository.findByIdWithActivePromo(id)),
    );
    const promoByProductId = new Map(
      promoResults
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => [p.id, p.promotions?.[0] ?? null]),
    );

    const items: CartItemResponse[] = cartWithItems.items.map((item) => {
      const mainImage = item.product.images?.find(img => img.is_main) ?? item.product.images?.[0];
      const imageUrl = mainImage?.image
        ? `data:image/jpeg;base64,${(mainImage.image as Buffer).toString('base64')}`
        : undefined;

      const unitPrice = Number(item.unit_price);
      const subtotal = item.period
        ? unitPrice * item.quantity * item.period
        : unitPrice * item.quantity;

      const activePromo = promoByProductId.get(item.product_id);
      const discountedUnitPrice = activePromo
        ? Number((unitPrice * (1 - Number(activePromo.discount_value) / 100)).toFixed(2))
        : undefined;

      const base: CartItemResponse = {
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        unitPrice,
        ...(discountedUnitPrice !== undefined && { discountedUnitPrice }),
        subtotal,
        isService: item.product.is_service,
        period: item.period ?? undefined,
        imageUrl,
      };

      if (item.product.status === ProductStatus.UNAVAILABLE) {
        return { ...base, unavailable: true };
      }

      return base;
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = this.shippingService.calculateFee(items);

    return {
      id: cart.id,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingFee,
    };
  }

  async addToCart(userId: string, productId: string, quantity: number, period?: number): Promise<CartItem> {

    if (quantity <= 0) {
      throw new HttpError(422, 'La quantité doit être supérieure à 0');
    }

    const product = await this.productRepository.findById(productId);

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

    //vérifie si le produit est déjà dans le panier
    const existingItem = await this.cartRepository.findItemByCartAndProduct(cart.id, productId);

    //si le produit est déjà dans le panier on incrémente
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (!product.is_service && product.stock < newQuantity) {
        throw new HttpError(422, `Stock insuffisant. Disponible: ${product.stock}`);
      }

      return await this.cartRepository.updateItem(
        existingItem.id,
        cart.id,
        newQuantity,
      ) as CartItem;
    }

    return await this.cartRepository.addItem(
      cart.id,
      productId,
      quantity,
      product.name,
      Number(product.price),
      period,
    );
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

    const item = await this.cartRepository.findItemByIdAndCart(itemId, cart.id);

    if (!item) {
      throw new HttpError(404, 'Item introuvable');
    }

    const product = await this.productRepository.findById(item.product_id);

    if (!product) {
      throw new HttpError(404, 'Produit introuvable');
    }

    if (!product.is_service && product.stock < quantity) {
      throw new HttpError(422, `Stock insuffisant. Disponible: ${product.stock}`);
    }

    return await this.cartRepository.updateItem(itemId, cart.id, quantity);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      throw new HttpError(404, 'Panier introuvable');
    }

    await this.cartRepository.clearByCartId(cart.id);
  }
}
