import Product from '../models/Product';
import Promotion from '../models/Promotion';
import { IProductRepository, ProductWithPromo } from '../interfaces/ProductRepository';

export class ProductRepository implements IProductRepository {
  async findById(productId: string): Promise<Product | null> {
    return await Product.findByPk(productId);
  }

  async findByIdWithActivePromo(productId: string): Promise<ProductWithPromo | null> {
    return await Product.findByPk(productId, {
      include: [{
        model: Promotion,
        as: 'promotions',
        where: { active: true },
        required: false,
      }],
    }) as ProductWithPromo | null;
  }
}
