import { CartItem } from "./cart/CartItem";
import { AddressFormData } from "./checkout/AddressFormData";

export interface LocationState {
  cartItems?: CartItem[];
  cartId?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
  billingAddress?: AddressFormData;
}