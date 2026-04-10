import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { CartContext } from '../contexts/CartContext';
import { CartService } from '../services/CartService';
import { CartItem } from '../types/interfaces/cart/CartItem';
import { AddToCartOptions } from '../types/interfaces/cart/AddToCartOptions';
import { toast } from 'react-hot-toast';

const PERIOD_TO_MONTHS: Record<string, number> = {
    '3m': 3,
    '6m': 6,
    '1y': 12,
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const service = CartService.getInstance();

    const [items, setItems] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // cartId exposé dans le context
    const [cartId, setCartId] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await service.getCart();
            setItems(data.items || []);
            setTotalAmount(data.totalAmount || 0);
            setCartId(data.id || null);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger le panier');
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const addToCart = useCallback(async (productId: string, options: AddToCartOptions) => {
        try {
            const qty = options.quantity || 1;
            const periodMonths = options.period ? (PERIOD_TO_MONTHS[options.period] ?? undefined) : undefined;
            await service.addItem(productId, qty, periodMonths);
            await fetchCart();
            toast.success('Produit ajouté au panier');
        } catch (err) {
            toast.error('Erreur lors de l\'ajout');
            throw err;
        }
    }, [service, fetchCart]);

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        try {
            await service.updateItem(itemId, quantity);
            await fetchCart();
        } catch (err) {
            toast.error('Erreur de mise à jour');
            throw err;
        }
    }, [service, fetchCart]);

    const removeFromCart = useCallback(async (itemId: string) => {
        try {
            await service.removeItem(itemId);
            await fetchCart();
            toast.success('Produit retiré');
        } catch (err) {
            toast.error('Erreur de suppression');
            throw err;
        }
    }, [service, fetchCart]);

    const clearCart = useCallback(async () => {
        try {
            await service.clearCart();
            await fetchCart();
            toast.success('Panier vidé');
        } catch (err) {
            toast.error('Erreur lors du vidage du panier');
            throw err;
        }
    }, [service, fetchCart]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            void fetchCart();
        }
    }, [fetchCart]);

    return (
        <CartContext.Provider
            value={{
                cartId,
                items,
                totalAmount,
                isLoading,
                error,
                fetchCart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
