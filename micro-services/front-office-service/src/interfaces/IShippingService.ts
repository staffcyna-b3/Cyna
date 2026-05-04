export interface IShippingService {
  calculateFee(items: { isService: boolean }[]): number;
}
