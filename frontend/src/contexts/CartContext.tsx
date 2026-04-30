import { createContext } from 'react';
import { CartContextValue } from '../types/interfaces/cart/CartContextValue';

export const CartContext = createContext<CartContextValue | undefined>(undefined);
