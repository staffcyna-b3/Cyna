import Product from '../models/Product';
import { IProductRepository } from '../interfaces/ProductRepository';

export class ProductRepository implements IProductRepository {
  async findById(productId: string): Promise<Product | null> {
    return await Product.findByPk(productId);
  }
}