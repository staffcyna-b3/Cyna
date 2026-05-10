import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromoService } from '../../services/promo.service';
import { IPromoRepository, PromotionWithProducts } from '../../interfaces/IPromoRepository';
import { ICartService } from '../../interfaces/CartService';
import { PromotionType } from '../../enum/PromotionType';
import { CartResponse } from '../../dto/response/CartResponse';

const makeRepoMock = () => ({
  findByCode: vi.fn(),
}) as unknown as IPromoRepository & { findByCode: ReturnType<typeof vi.fn> };

const makeCartServiceMock = () => ({
  getCart: vi.fn(),
}) as unknown as ICartService & { getCart: ReturnType<typeof vi.fn> };

// Code promo sans produits liés → s'applique sur tout le panier
const cartPromo: PromotionWithProducts = {
  id: 'promo-1',
  code: 'WELCOME10',
  discount_type: PromotionType.PRODUCT,
  discount_value: 10,
  active: true,
  products: [],
};

// Réduction automatique liée à des produits spécifiques
const reductionPromo: PromotionWithProducts = {
  id: 'promo-2',
  code: 'REDUCTION20',
  discount_type: PromotionType.PRODUCT,
  discount_value: 20,
  active: true,
  products: [{ id: 'prod-1' }],
};

describe('PromoService.validate', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let service: PromoService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new PromoService(repo);
  });

  it('applique la remise sur tout le panier (produits + services)', async () => {
    repo.findByCode.mockResolvedValue(cartPromo);

    const result = await service.validate('WELCOME10', [
      { productId: 'prod-1', isService: false, subtotal: 100 },
      { productId: 'svc-1', isService: true, subtotal: 200 },
    ]);

    expect(result.promoCode).toBe('WELCOME10');
    expect(result.discountAmount).toBe(30); // 10% de 300
    expect(result.discountedTotal).toBe(270);
    expect(result.valid).toBe(true);
  });

  it('applique la remise même si le panier ne contient que des services', async () => {
    repo.findByCode.mockResolvedValue(cartPromo);

    const result = await service.validate('WELCOME10', [
      { productId: 'svc-1', isService: true, subtotal: 200 },
    ]);

    expect(result.discountAmount).toBe(20); // 10% de 200
    expect(result.discountedTotal).toBe(180);
  });

  it('rejette une réduction automatique utilisée comme code promo', async () => {
    repo.findByCode.mockResolvedValue(reductionPromo);

    await expect(
      service.validate('REDUCTION20', [{ productId: 'prod-1', isService: false, subtotal: 100 }])
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it('lance HttpError 404 quand le code est introuvable', async () => {
    repo.findByCode.mockResolvedValue(null);

    await expect(
      service.validate('UNKNOWN', [{ productId: 'prod-1', isService: false, subtotal: 50 }])
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('PromoService.validateForCart', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let cartService: ReturnType<typeof makeCartServiceMock>;
  let service: PromoService;

  const makeCart = (items: CartResponse['items']): CartResponse => ({
    id: 'cart-1',
    items,
    totalAmount: 0,
    shippingFee: 0,
  });

  beforeEach(() => {
    repo = makeRepoMock();
    cartService = makeCartServiceMock();
    service = new PromoService(repo, cartService);
  });

  it('calcule la remise sur le total complet du panier (produits + services)', async () => {
    repo.findByCode.mockResolvedValue(cartPromo);
    cartService.getCart.mockResolvedValue(
      makeCart([
        { id: 'ci-1', productId: 'prod-1', name: 'Widget', quantity: 2, unitPrice: 50, subtotal: 100, isService: false },
        { id: 'ci-2', productId: 'svc-1', name: 'Service', quantity: 1, unitPrice: 200, subtotal: 200, isService: true },
      ])
    );

    const result = await service.validateForCart('user-1', 'WELCOME10');

    // 10% de (100 + 200) = 30
    expect(result.discountAmount).toBe(30);
    expect(result.discountedTotal).toBe(270);
  });

  it('lance HttpError 422 quand le panier est vide', async () => {
    cartService.getCart.mockResolvedValue(makeCart([]));

    await expect(service.validateForCart('user-1', 'WELCOME10')).rejects.toMatchObject({
      statusCode: 422,
    });

    expect(repo.findByCode).not.toHaveBeenCalled();
  });

  it('lance HttpError 500 quand cartService n\'est pas injecté', async () => {
    const serviceWithoutCart = new PromoService(repo);

    await expect(serviceWithoutCart.validateForCart('user-1', 'WELCOME10')).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
