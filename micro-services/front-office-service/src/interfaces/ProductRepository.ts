import Product from '../models/Product';
import Promotion from '../models/Promotion';

export type ProductWithPromo = Product & { promotions: Promotion[] };

export interface IProductRepository {
  findById(productId: string): Promise<Product | null>;
  findByIdWithActivePromo(productId: string): Promise<ProductWithPromo | null>;
}
