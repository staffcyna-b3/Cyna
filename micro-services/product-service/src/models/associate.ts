import Category from './Category';
import Product from './Product';
import ProductImage from './ProductImage';
import Promotion from './Promotion';
import LignePromotion from './LignePromotion';

// Category Associations
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
  onDelete: 'CASCADE',
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Product Associations
Product.hasMany(ProductImage, {
  foreignKey: 'product_id',
  as: 'images',
  onDelete: 'CASCADE',
});
ProductImage.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Promotion Associations
Product.belongsToMany(Promotion, {
  through: LignePromotion,
  foreignKey: 'product_id',
  otherKey: 'promotion_id',
  as: 'promotions',
});
Promotion.belongsToMany(Product, {
  through: LignePromotion,
  foreignKey: 'promotion_id',
  otherKey: 'product_id',
  as: 'products',
});

LignePromotion.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});
LignePromotion.belongsTo(Promotion, {
  foreignKey: 'promotion_id',
  as: 'promotion',
});

export {
  Category,
  Product,
  ProductImage,
  Promotion,
  LignePromotion,
};
