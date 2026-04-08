import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { CartContext } from '../contexts/CartContext';
import { CartService } from '../services/CartService';
import { CartItem } from '../types/interfaces/cart/CartItem';
import { AddToCartOptions } from '../types/interfaces/cart/AddToCartOptions';
import { saveSaaSDuration, removeSaaSDuration, getAllSaaSDurations } from '../lib/cartStorage';
import { toast } from 'react-hot-toast';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const service = CartService.getInstance();

    const [items, setItems] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // cartId exposé dans le context 
    const [cartId, setCartId] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await service.getCart();
            const fetchedItems: CartItem[] = data.items || [];

            // Fusionner les périodes choisies (localStorage) dans chaque item service
            const durations = getAllSaaSDurations();
            const itemsWithPeriod = fetchedItems.map((item) =>
                item.isService ? { ...item, billingPeriod: durations[item.productId] } : item
            );

            setItems(itemsWithPeriod);
            setTotalAmount(data.totalAmount || 0);
            setCartId(data.id || null);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const addToCart = useCallback(async (productId: string, options: AddToCartOptions) => {
        try {
            const qty = options.quantity || 1;

            if (options.period) {
                saveSaaSDuration(productId, String(options.period));
            }

            await service.addItem(productId, qty);
            await fetchCart();
            toast.success('Produit ajouté au panier');
        } catch (error) {
            toast.error('Erreur lors de l\'ajout');
            throw error;
        }
    }, [service, fetchCart]);

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        try {
            await service.updateItem(itemId, quantity);
            await fetchCart();
        } catch (error) {
            toast.error('Erreur de mise à jour');
            throw error;
        }
    }, [service, fetchCart]);

    const removeFromCart = useCallback(async (itemId: string, productId: string) => {
        try {
            await service.removeItem(itemId);
            removeSaaSDuration(productId);
            await fetchCart();
            toast.success('Produit retiré');
        } catch (error) {
            toast.error('Erreur de suppression');
            throw error;
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
                fetchCart,
                addToCart,
                removeFromCart,
                updateQuantity
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;