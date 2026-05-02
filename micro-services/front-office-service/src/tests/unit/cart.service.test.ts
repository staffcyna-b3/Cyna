import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartService } from '../../services/cart.service';
import { ProductWithPromo } from '../../interfaces/ProductRepository';
import { PromotionType } from '../../enum/PromotionType';
import { ProductStatus } from '../../enum/ProductStatus';

const makeCartRepoMock = () => ({
  findByUserIdWithItems: vi.fn(),
  clearByCartId: vi.fn(),
  findOrCreateCart: vi.fn(),
  findItemByIdAndCart: vi.fn(),
  findItemByCartAndProduct: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
});

const makeProductRepoMock = () => ({
  findById: vi.fn(),
  findByIdWithActivePromo: vi.fn(),
});

const makeShippingMock = () => ({
  calculateFee: vi.fn().mockReturnValue(0),
});

const makeCartWithItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      product_id: 'prod-1',
      product_name: 'Produit Test',
      quantity: 2,
      unit_price: 100,
      period: null,
      product: {
        id: 'prod-1',
        is_service: false,
        status: ProductStatus.AVAILABLE,
        images: [],
      },
      ...overrides,
    },
  ],
});

describe('CartService.getCart', () => {
  let cartRepo: ReturnType<typeof makeCartRepoMock>;
  let productRepo: ReturnType<typeof makeProductRepoMock>;
  let shippingService: ReturnType<typeof makeShippingMock>;
  let service: CartService;

  beforeEach(() => {
    cartRepo = makeCartRepoMock();
    productRepo = makeProductRepoMock();
    shippingService = makeShippingMock();
    service = new CartService(cartRepo, productRepo, shippingService);
  });

  it('returns empty cart when no cart exists for user', async () => {
    cartRepo.findByUserIdWithItems.mockResolvedValue(null);

    const result = await service.getCart('user-1');

    expect(result).toEqual({ id: null, items: [], totalAmount: 0, shippingFee: 0 });
  });

  it('returns item without discountedUnitPrice when no active promo exists', async () => {
    cartRepo.findByUserIdWithItems.mockResolvedValue(makeCartWithItem());
    productRepo.findByIdWithActivePromo.mockResolvedValue({
      id: 'prod-1',
      promotions: [],
    } as unknown as ProductWithPromo);

    const result = await service.getCart('user-1');

    expect(result.items[0].discountedUnitPrice).toBeUndefined();
    expect(result.items[0].unitPrice).toBe(100);
  });

  it('returns discountedUnitPrice when product has an active PRODUCT promotion', async () => {
    cartRepo.findByUserIdWithItems.mockResolvedValue(makeCartWithItem());
    productRepo.findByIdWithActivePromo.mockResolvedValue({
      id: 'prod-1',
      promotions: [{
        id: 'promo-1',
        code: 'SUMMER20',
        discount_type: PromotionType.PRODUCT,
        discount_value: 20,
        active: true,
      }],
    } as unknown as ProductWithPromo);

    const result = await service.getCart('user-1');

    expect(result.items[0].unitPrice).toBe(100);
    expect(result.items[0].discountedUnitPrice).toBe(80);
  });

  it('applies discount correctly for fractional discount values', async () => {
    cartRepo.findByUserIdWithItems.mockResolvedValue(makeCartWithItem());
    productRepo.findByIdWithActivePromo.mockResolvedValue({
      id: 'prod-1',
      promotions: [{
        id: 'promo-1',
        code: 'PROMO15',
        discount_type: PromotionType.PRODUCT,
        discount_value: 15,
        active: true,
      }],
    } as unknown as ProductWithPromo);

    const result = await service.getCart('user-1');

    expect(result.items[0].discountedUnitPrice).toBe(85);
  });

  it('uses only the first active promotion when multiple exist', async () => {
    cartRepo.findByUserIdWithItems.mockResolvedValue(makeCartWithItem());
    productRepo.findByIdWithActivePromo.mockResolvedValue({
      id: 'prod-1',
      promotions: [
        { id: 'promo-1', code: 'FIRST10', discount_type: PromotionType.PRODUCT, discount_value: 10, active: true },
        { id: 'promo-2', code: 'SECOND50', discount_type: PromotionType.PRODUCT, discount_value: 50, active: true },
      ],
    } as unknown as ProductWithPromo);

    const result = await service.getCart('user-1');

    expect(result.items[0].discountedUnitPrice).toBe(90);
  });
});
