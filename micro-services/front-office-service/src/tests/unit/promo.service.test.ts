import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromoService } from '../../services/promo.service';
import { IPromoRepository, PromotionWithProducts } from '../../interfaces/IPromoRepository';
import { ICartService } from '../../interfaces/CartService';
import { HttpError } from '../../common/httpError';
import { PromotionType } from '../../enum/PromotionType';
import { CartResponse } from '../../dto/response/CartResponse';

const makeRepoMock = () => ({
  findByCode: vi.fn(),
}) as unknown as IPromoRepository & { findByCode: ReturnType<typeof vi.fn> };

const makeCartServiceMock = () => ({
  getCart: vi.fn(),
}) as unknown as ICartService & { getCart: ReturnType<typeof vi.fn> };

const productPromo: PromotionWithProducts = {
  id: 'promo-1',
  code: 'PRODUCT10',
  discount_type: PromotionType.PRODUCT,
  discount_value: 10,
  active: true,
  products: [{ id: 'prod-1' }, { id: 'prod-2' }],
};

const servicePromo: PromotionWithProducts = {
  id: 'promo-2',
  code: 'SERVICE20',
  discount_type: PromotionType.SERVICE,
  discount_value: 20,
  active: true,
  products: [{ id: 'svc-1' }],
};

describe('PromoService.validate', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let service: PromoService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new PromoService(repo);
  });

  it('returns correct discount for a product promo', async () => {
    repo.findByCode.mockResolvedValue(productPromo);

    const result = await service.validate('PRODUCT10', [
      { productId: 'prod-1', isService: false, subtotal: 100 },
      { productId: 'prod-2', isService: false, subtotal: 50 },
    ]);

    expect(result.promoCode).toBe('PRODUCT10');
    expect(result.discountAmount).toBe(15); // 10% of 150
    expect(result.discountedTotal).toBe(135);
    expect(result.valid).toBe(true);
  });

  it('returns correct discount for a service promo', async () => {
    repo.findByCode.mockResolvedValue(servicePromo);

    const result = await service.validate('SERVICE20', [
      { productId: 'svc-1', isService: true, subtotal: 200 },
    ]);

    expect(result.discountAmount).toBe(40); // 20% of 200
    expect(result.discountedTotal).toBe(160);
  });

  it('only discounts eligible items, not the whole cart', async () => {
    repo.findByCode.mockResolvedValue(productPromo);

    const result = await service.validate('PRODUCT10', [
      { productId: 'prod-1', isService: false, subtotal: 100 },
      { productId: 'other-prod', isService: false, subtotal: 200 }, // not in promo products
    ]);

    // Only prod-1 is eligible: 10% of 100 = 10
    expect(result.discountAmount).toBe(10);
    expect(result.discountedTotal).toBe(290); // 300 - 10
  });

  it('does not apply product promo to service items', async () => {
    repo.findByCode.mockResolvedValue(productPromo);

    await expect(
      service.validate('PRODUCT10', [
        { productId: 'prod-1', isService: true, subtotal: 100 }, // isService true, promo is PRODUCT
      ])
    ).rejects.toMatchObject<HttpError>({ statusCode: 422 });
  });

  it('throws HttpError 404 when promo code does not exist', async () => {
    repo.findByCode.mockResolvedValue(null);

    await expect(
      service.validate('UNKNOWN', [{ productId: 'prod-1', isService: false, subtotal: 50 }])
    ).rejects.toMatchObject<HttpError>({ statusCode: 404 });
  });

  it('throws HttpError 422 when no cart item matches the promo', async () => {
    repo.findByCode.mockResolvedValue(productPromo);

    await expect(
      service.validate('PRODUCT10', [
        { productId: 'unrelated-prod', isService: false, subtotal: 100 },
      ])
    ).rejects.toMatchObject<HttpError>({ statusCode: 422 });
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

  it('maps cart items as unitPrice × quantity and delegates to validate', async () => {
    repo.findByCode.mockResolvedValue(productPromo);
    cartService.getCart.mockResolvedValue(
      makeCart([
        { id: 'ci-1', productId: 'prod-1', name: 'Widget', quantity: 2, unitPrice: 50, subtotal: 100, isService: false },
      ])
    );

    const result = await service.validateForCart('user-1', 'PRODUCT10');

    // subtotal passed to validate = unitPrice(50) × quantity(2) = 100; 10% = 10
    expect(result.discountAmount).toBe(10);
    expect(repo.findByCode).toHaveBeenCalledWith('PRODUCT10');
  });

  it('throws HttpError 422 when cart is empty', async () => {
    cartService.getCart.mockResolvedValue(makeCart([]));

    await expect(service.validateForCart('user-1', 'PRODUCT10')).rejects.toMatchObject<HttpError>({
      statusCode: 422,
    });

    expect(repo.findByCode).not.toHaveBeenCalled();
  });

  it('throws HttpError 500 when no cartService was injected', async () => {
    const serviceWithoutCart = new PromoService(repo);

    await expect(serviceWithoutCart.validateForCart('user-1', 'PRODUCT10')).rejects.toMatchObject<HttpError>({
      statusCode: 500,
    });
  });
});
