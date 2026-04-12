import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { CartItem } from '../types/interfaces/cart/CartItem';
import { AddToCartOptions } from '../types/interfaces/cart/AddToCartOptions';
import {
    loadGuestCart,
    saveGuestCart,
    computeCartTotal,
    PERIOD_TO_MONTHS,
} from '../lib/cartStorage';

export function useGuestCart() {
    const [items, setItems] = useState<CartItem[]>(() => loadGuestCart());
    const [totalAmount, setTotalAmount] = useState<number>(() =>
        computeCartTotal(loadGuestCart())
    );

    const persist = useCallback((updated: CartItem[]) => {
        saveGuestCart(updated);
        setItems(updated);
        setTotalAmount(computeCartTotal(updated));
    }, []);

    const fetchCart = useCallback(async () => {
        const stored = loadGuestCart();
        setItems(stored);
        setTotalAmount(computeCartTotal(stored));
    }, []);

    const addToCart = useCallback(async (productId: string, options: AddToCartOptions) => {
        const qty = options.quantity || 1;
        const unitPrice = options.unitPrice ?? 0;
        const isService = options.isService ?? false;
        const stock = options.stock;

        const current = loadGuestCart();
        const existing = current.find(i => i.productId === productId);

        if (existing) {
            const newQty = existing.quantity + qty;
            if (!isService && existing.stock !== undefined && newQty > existing.stock) {
                toast.error(`Stock insuffisant. Disponible : ${existing.stock}`);
                return;
            }
            persist(current.map(i =>
                i.productId === productId
                    ? { ...i, quantity: newQty, subtotal: i.unitPrice * newQty }
                    : i
            ));
        } else {
            if (!isService && stock !== undefined && qty > stock) {
                toast.error(`Stock insuffisant. Disponible : ${stock}`);
                return;
            }
            const periodMonths = options.period ? PERIOD_TO_MONTHS[options.period] : undefined;
            const subtotal = periodMonths
                ? unitPrice * qty * periodMonths
                : unitPrice * qty;
            const newItem: CartItem = {
                id: crypto.randomUUID(),
                productId,
                name: options.name ?? productId,
                quantity: qty,
                unitPrice,
                subtotal,
                isService,
                period: periodMonths,
                stock,
            };
            persist([...current, newItem]);
        }

        toast.success('Produit ajouté au panier');
    }, [persist]);

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        const current = loadGuestCart();
        const item = current.find(i => i.id === itemId);
        if (item && !item.isService && item.stock !== undefined && quantity > item.stock) {
            toast.error(`Stock insuffisant. Disponible : ${item.stock}`);
            return;
        }
        persist(current.map(i =>
            i.id === itemId ? { ...i, quantity, subtotal: i.unitPrice * quantity } : i
        ));
    }, [persist]);

    const removeFromCart = useCallback(async (itemId: string) => {
        persist(loadGuestCart().filter(i => i.id !== itemId));
        toast.success('Produit retiré');
    }, [persist]);

    const clearCart = useCallback(async () => {
        persist([]);
        toast.success('Panier vidé');
    }, [persist]);

    return {
        cartId: null as string | null,
        items,
        totalAmount,
        isLoading: false,
        error: null as string | null,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };
}
