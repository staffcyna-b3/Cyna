import { IShippingService } from '../interfaces/IShippingService';

const SHIPPING_FEE = 5.99;

export class ShippingService implements IShippingService {
  calculateFee(items: { isService: boolean }[]): number {
    const hasPhysicalProduct = items.some((item) => !item.isService);
    return hasPhysicalProduct ? SHIPPING_FEE : 0;
  }
}
