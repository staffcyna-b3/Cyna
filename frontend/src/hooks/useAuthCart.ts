import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CartService } from '../services/CartService';
import { CartItem } from '../types/interfaces/cart/CartItem';
import { AddToCartOptions } from '../types/interfaces/cart/AddToCartOptions';
import { PERIOD_TO_MONTHS } from '../lib/cartStorage';

export function useAuthCart() {
    const service = CartService.getInstance();

    const [items, setItems] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [cartId, setCartId] = useState<string | null>(null);

    const handleExpiredToken = useCallback(() => {
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('cart:auth-change'));
    }, []);

    const is401 = (err: unknown) =>
        err instanceof Error && (err as Error & { status?: number }).status === 401;

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await service.getCart();
            setItems(data.items || []);
            setTotalAmount(data.totalAmount || 0);
            setCartId(data.id || null);
        } catch (err) {
            if (is401(err)) {
                handleExpiredToken();
                return;
            }
            console.error(err);
            setError('Impossible de charger le panier');
        } finally {
            setIsLoading(false);
        }
    }, [service, handleExpiredToken]);

    const addToCart = useCallback(async (productId: string, options: AddToCartOptions) => {
        const qty = options.quantity || 1;
        const periodMonths = options.period ? (PERIOD_TO_MONTHS[options.period] ?? undefined) : undefined;
        try {
            await service.addItem(productId, qty, periodMonths);
            await fetchCart();
            toast.success('Produit ajouté au panier');
        } catch (err) {
            if (is401(err)) { handleExpiredToken(); return; }
            toast.error("Erreur lors de l'ajout");
            throw err;
        }
    }, [service, fetchCart, handleExpiredToken]);

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        try {
            await service.updateItem(itemId, quantity);
            await fetchCart();
        } catch (err) {
            if (is401(err)) { handleExpiredToken(); return; }
            toast.error('Erreur de mise à jour');
            throw err;
        }
    }, [service, fetchCart, handleExpiredToken]);

    const removeFromCart = useCallback(async (itemId: string) => {
        try {
            await service.removeItem(itemId);
            await fetchCart();
            toast.success('Produit retiré');
        } catch (err) {
            if (is401(err)) { handleExpiredToken(); return; }
            toast.error('Erreur de suppression');
            throw err;
        }
    }, [service, fetchCart, handleExpiredToken]);

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

    return {
        cartId,
        items,
        totalAmount,
        isLoading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };
}
