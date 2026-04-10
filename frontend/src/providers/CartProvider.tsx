import { ReactNode, useEffect, useState } from 'react';
import { CartContext } from '@/contexts/CartContext';
import { getCartCount, getCartUpdatedEventName } from '@/lib/cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState<number>(() => getCartCount());

    useEffect(() => {
        const handleCartUpdate = () => setCartCount(getCartCount());
        const cartEventName = getCartUpdatedEventName();

        window.addEventListener(cartEventName, handleCartUpdate as EventListener);
        window.addEventListener('storage', handleCartUpdate);

        return () => {
            window.removeEventListener(cartEventName, handleCartUpdate as EventListener);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, []);

    return <CartContext.Provider value={{ cartCount }}>{children}</CartContext.Provider>;
}
