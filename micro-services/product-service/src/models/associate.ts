import Category from './Category';
import Product from './Product';
import ProductImage from './ProductImage';

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



export {
  Category,
  Product,
  ProductImage,
};
