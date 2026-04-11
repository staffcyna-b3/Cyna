import Product from '../models/Product';

export interface IProductRepository {
  findById(productId: string): Promise<Product | null>;
}