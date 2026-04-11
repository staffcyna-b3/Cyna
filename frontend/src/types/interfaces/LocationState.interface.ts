import { CartItem } from "./CartItem.interface";

export interface LocationState {
  cartItems?: CartItem[];
  cartId?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
}