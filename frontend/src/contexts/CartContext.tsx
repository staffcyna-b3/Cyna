import { createContext } from 'react';

export interface CartContextType {
    cartCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
