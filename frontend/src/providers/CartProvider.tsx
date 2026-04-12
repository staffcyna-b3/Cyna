import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useGuestCart } from '../hooks/useGuestCart';
import { useAuthCart } from '../hooks/useAuthCart';
import { loadGuestCart, saveGuestCart } from '../lib/cartStorage';
import { CartService } from '../services/CartService';

const hasValidToken = () => !!localStorage.getItem('accessToken');

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(hasValidToken);
    const prevIsLoggedIn = useRef(isLoggedIn);
    const guestCart = useGuestCart();
    const authCart = useAuthCart();

    // Écoute les changements de token (login / logout depuis AuthProvider)
    useEffect(() => {
        const handleTokenChange = () => setIsLoggedIn(hasValidToken());
        window.addEventListener('cart:auth-change', handleTokenChange);
        return () => window.removeEventListener('cart:auth-change', handleTokenChange);
    }, []);

    // Charge le bon panier quand l'état d'auth change.
    // Si l'utilisateur vient de se connecter (transition guest → auth),
    // migre silencieusement les items du guest cart vers le panier DB.
    useEffect(() => {
        const wasGuest = !prevIsLoggedIn.current;
        prevIsLoggedIn.current = isLoggedIn;

        if (isLoggedIn) {
            if (wasGuest) {
                const guestItems = loadGuestCart();
                if (guestItems.length > 0) {
                    const service = CartService.getInstance();
                    void Promise.allSettled(
                        guestItems.map(item =>
                            service.addItem(item.productId, item.quantity, item.period)
                        )
                    ).finally(() => {
                        saveGuestCart([]);
                        void authCart.fetchCart();
                    });
                } else {
                    void authCart.fetchCart();
                }
            } else {
                void authCart.fetchCart();
            }
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
