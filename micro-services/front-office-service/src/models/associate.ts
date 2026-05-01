import User from './User';
import UserRole from './UserRole';
import ContactMessage from './ContactMessage';
import Address from './Address';
import Category from './Category';
import Product from './Product';
import ProductImage from './ProductImage';
import Promotion from './Promotion';
import LignePromotion from './LignePromotion';
import Cart from './Cart';
import CartItem from './CartItem';
import Order from './Order';
import OrderItem from './OrderItem';
import Subscription from './Subscription';

// User Associations
User.hasMany(UserRole, {
  foreignKey: 'user_id',
  as: 'roles',
  onDelete: 'CASCADE',
});
UserRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Address, {
  foreignKey: 'user_id',
  as: 'addresses',
  onDelete: 'CASCADE',
});
Address.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasOne(Cart, {
  foreignKey: 'user_id',
  as: 'cart',
  onDelete: 'CASCADE',
});
Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Subscription, {
  foreignKey: 'user_id',
  as: 'subscriptions',
  onDelete: 'CASCADE',
});
Subscription.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  onDelete: 'CASCADE',
});
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

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

Product.hasMany(CartItem, {
  foreignKey: 'product_id',
  as: 'cartItems',
  onDelete: 'CASCADE',
});
CartItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

Product.hasMany(Subscription, {
  foreignKey: 'product_id',
  as: 'subscriptions',
  onDelete: 'CASCADE',
});
Subscription.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Promotion Associations
Promotion.belongsToMany(Product, {
  through: LignePromotion,
  foreignKey: 'promotion_id',
  otherKey: 'product_id',
  as: 'products',
});
Product.belongsToMany(Promotion, {
  through: LignePromotion,
  foreignKey: 'product_id',
  otherKey: 'promotion_id',
  as: 'promotions',
});

LignePromotion.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});
LignePromotion.belongsTo(Promotion, {
  foreignKey: 'promotion_id',
  as: 'promotion',
});

// Cart Associations
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  as: 'items',
  onDelete: 'CASCADE',
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id',
  as: 'cart',
});

// Order Associations
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems',
  onDelete: 'RESTRICT',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
  onDelete: 'CASCADE',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

Order.belongsTo(Address, {
  foreignKey: 'billing_address_id',
  as: 'billingAddress',
});

Order.belongsTo(Address, {
  foreignKey: 'shipping_address_id',
  as: 'shippingAddress',
});

export {
  User,
  UserRole,
  Address,
  Category,
  Product,
  ProductImage,
  Promotion,
  LignePromotion,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Subscription,
  ContactMessage,
};
