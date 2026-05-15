import { AbstractApi } from './AbstractApi';

export class CartApi extends AbstractApi {
  private static instance: CartApi;

  private constructor() {
    super();
  }

  static getInstance(): CartApi {
    if (!CartApi.instance) {
      CartApi.instance = new CartApi();
    }
    return CartApi.instance;
  }

  async getCart() {
    return this.get('/front-office/cart');
  }

  async addItem(productId: string, quantity: number, period?: number) {
    return this.post('/front-office/cart/items', {
      body: { productId, quantity, ...(period !== undefined && { period }) },
    });
  }

  async updateItem(itemId: string, quantity: number) {
    return this.patch(`/front-office/cart/items/${itemId}`, { body: { quantity } });
  }

  async updatePeriod(itemId: string, period: number) {
    return this.patch(`/front-office/cart/items/${itemId}`, { body: { period } });
  }

  async removeItem(itemId: string) {
    return this.delete(`/front-office/cart/items/${itemId}`);
  }

  async clearCart() {
    return this.delete('/front-office/cart');
  }

  async applyPromo(code: string): Promise<{ valid: boolean; promoCode: string; discountAmount: number; discountedTotal: number }> {
    return this.post('/front-office/cart/promo', { body: { code } });
  }
}
