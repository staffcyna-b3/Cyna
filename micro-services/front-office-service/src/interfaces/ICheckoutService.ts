export interface CheckoutContext {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  cart: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
  addresses: {
    billing: {
      id: string;
      addressLine1: string;
      city: string;
      postcode: string;
      country: string;
    };
    shipping: {
      id: string;
      addressLine1: string;
      city: string;
      postcode: string;
      country: string;
    };
  };
  checkout: {
    cartId: string;
    billingAddressId: string;
    shippingAddressId: string;
  };
}

export interface ICheckoutService {
  getCheckoutContext(userId: string): Promise<CheckoutContext>;
}
