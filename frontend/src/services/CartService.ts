const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? '';

export class CartService {
    private static instance: CartService;

    static getInstance(): CartService {
        if (!CartService.instance) {
            CartService.instance = new CartService();
        }
        return CartService.instance;
    }

    private getOptions(method: string, body?: object) {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        return {
            method,
            headers,
            credentials: 'include' as RequestCredentials,
            ...(body && { body: JSON.stringify(body) })
        };
    }

    public async getCart() {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart`, this.getOptions('GET'));
        if (!response.ok) {
            const err = new Error('Erreur récupération panier') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    public async addItem(productId: string, quantity: number, period?: number) {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart/items`, this.getOptions('POST', { productId, quantity, ...(period !== undefined && { period }) }));
        if (!response.ok) {
            const err = new Error('Erreur ajout au panier') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    public async updateItem(itemId: string, quantity: number) {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart/items/${itemId}`, this.getOptions('PATCH', { quantity }));
        if (!response.ok) {
            const err = new Error('Erreur mise à jour quantité') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    public async removeItem(itemId: string) {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart/items/${itemId}`, this.getOptions('DELETE'));
        if (!response.ok) {
            const err = new Error('Erreur suppression article') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    public async clearCart() {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart`, this.getOptions('DELETE'));
        if (!response.ok) {
            const err = new Error('Erreur vidage panier') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    public async applyPromo(code: string) {
        const response = await fetch(`${GATEWAY_URL}/api/front-office/cart/promo`, this.getOptions('POST', { code }));
        if (!response.ok) {
            const data = await response.json().catch(() => null);
            const err = new Error(data?.message || 'Code promotionnel invalide') as Error & { status: number };
            err.status = response.status;
            throw err;
        }
        return await response.json() as { valid: boolean; promoCode: string; discountAmount: number; discountedTotal: number };
    }
}
