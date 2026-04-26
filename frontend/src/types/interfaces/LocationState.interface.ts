import { CartItem } from "./cart/CartItem";
import { AddressFormData } from "./Checkout/AddressFormData";

export interface LocationState {
  cartItems?: CartItem[];
  cartId?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
  billingAddress?: AddressFormData;
  promoCode?: string;
  shippingFee?: number;
  discountAmount?: number;
}