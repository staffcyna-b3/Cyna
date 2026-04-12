import { CartItem } from "./CartItem.interface";
import { AddressFormData } from "./Checkout/AddressFormData";

export interface LocationState {
  cartItems?: CartItem[];
  cartId?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
  billingAddress?: AddressFormData;
}