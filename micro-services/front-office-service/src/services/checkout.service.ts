import { HttpError } from '../common/httpError';
import { AddressType } from '../enum/AddressType';
import { ICartRepository } from '../interfaces/CartRepository';
import { IAddressRepository } from '../interfaces/AddressRepository';
import { ICheckoutService } from '../interfaces/CheckoutService';
import { CheckoutContextResponse } from '../dto/response/CheckoutContextResponse';
import CartItem from '../models/CartItem';
import Product from '../models/Product';

export class CheckoutService implements ICheckoutService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly addressRepository: IAddressRepository,
  ) {}

  async getCheckoutContext(userId: string): Promise<CheckoutContextResponse> {
    const addresses = await this.addressRepository.findAllByUserId(userId);
    const billingAddress = addresses.find((address) => address.type === AddressType.BILLING);
    const shippingAddress = addresses.find((address) => address.type === AddressType.SHIPPING);

    if (!billingAddress || !shippingAddress) {
      throw new HttpError(404, 'Missing billing or shipping address');
    }

    const cart = await this.cartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      throw new HttpError(404, 'Cart not found');
    }

    const cartItems = ((cart as unknown as { items?: CartItem[] }).items ?? []).map((item) => {
      const product = (item as unknown as { product?: Product }).product;
      return {
        id: item.id,
        productId: item.product_id,
        productName: product?.name ?? 'Unknown product',
        quantity: item.quantity,
        unitPrice: Number(product?.price ?? 0),
      };
    });

    return {
      user: {
        id: userId,
        email: '',
        fullName: '',
      },
      cart: {
        id: cart.id,
        items: cartItems,
      },
      addresses: {
        billing: {
          id: billingAddress.id,
          addressLine1: billingAddress.address_line1,
          city: billingAddress.city,
          postcode: billingAddress.postcode,
          country: billingAddress.country,
        },
        shipping: {
          id: shippingAddress.id,
          addressLine1: shippingAddress.address_line1,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: shippingAddress.country,
        },
      },
      checkout: {
        cartId: cart.id,
        billingAddressId: billingAddress.id,
        shippingAddressId: shippingAddress.id,
      },
    };
  }
}
