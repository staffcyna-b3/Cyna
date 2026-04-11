import { useEffect, useState, type ReactNode } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useGuestCart } from '../hooks/useGuestCart';
import { useAuthCart } from '../hooks/useAuthCart';

const hasValidToken = () => !!localStorage.getItem('accessToken');

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(hasValidToken);
    const guestCart = useGuestCart();
    const authCart = useAuthCart();

    // Écoute les changements de token (login / logout depuis AuthProvider)
    useEffect(() => {
        const handleTokenChange = () => setIsLoggedIn(hasValidToken());
        window.addEventListener('cart:auth-change', handleTokenChange);
        return () => window.removeEventListener('cart:auth-change', handleTokenChange);
    }, []);

    // Charge le bon panier quand l'état d'auth change
    useEffect(() => {
        if (isLoggedIn) {
            void authCart.fetchCart();
        } else {
            void guestCart.fetchCart();
        }
    }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

    const cart = isLoggedIn ? authCart : guestCart;

    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
