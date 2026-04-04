import { AddToCartOptions } from '@/types/interfaces/cart/AddToCartOptions';

const CART_STORAGE_KEY = 'cyna-cart';
const CART_UPDATED_EVENT = 'cyna:cart-updated';

type CartLine = {
    productId: string;
    quantity: number;
    period?: AddToCartOptions['period'];
};

function readCart(): CartLine[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!rawCart) {
            return [];
        }

        const parsedCart = JSON.parse(rawCart) as CartLine[];
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
}

function writeCart(cart: CartLine[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: cart }));
}

export function addToCart(productId: string, options: AddToCartOptions = {}) {
    const { quantity = 1, period } = options;
    const cart = readCart();
    const existingLine = cart.find((line) => line.productId === productId && line.period === period);

    if (existingLine) {
        existingLine.quantity += quantity;
    } else {
        cart.push({
            productId,
            quantity,
            period,
        });
    }

    writeCart(cart);
}

export function getCartCount(): number {
    return readCart().reduce((total, line) => total + line.quantity, 0);
}

export function getCartUpdatedEventName(): string {
    return CART_UPDATED_EVENT;
}
