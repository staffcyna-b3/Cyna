export class CartService {
    private static instance: CartService;

    static getInstance(): CartService {
        if (!CartService.instance) {
            CartService.instance = new CartService();
        }
        return CartService.instance;
    }

    private getOptions(method: string, body?: any) {
        //Chercher le token
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        //S'il existe, on l'ajoute en tant que passeport (Bearer)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return {
            method,
            headers,
            credentials: 'include' as RequestCredentials,
            ...(body && { body: JSON.stringify(body) })
        };
    }

    public async getCart() {
        const response = await fetch('/api/front-office/cart', this.getOptions('GET'));
        if (!response.ok) throw new Error('Erreur récupération panier');
        return await response.json();
    }

    public async addItem(productId: string, quantity: number) {
        const response = await fetch('/api/front-office/cart/items', this.getOptions('POST', { productId, quantity }));
        if (!response.ok) throw new Error('Erreur ajout au panier');
        return await response.json();
    }

    public async updateItem(itemId: string, quantity: number) {
        const response = await fetch(`/api/front-office/cart/items/${itemId}`, this.getOptions('PUT', { quantity }));
        if (!response.ok) throw new Error('Erreur mise à jour quantité');
        return await response.json();
    }

    public async removeItem(itemId: string) {
        const response = await fetch(`/api/front-office/cart/items/${itemId}`, this.getOptions('DELETE'));
        if (!response.ok) throw new Error('Erreur suppression article');
        return await response.json();
    }
}