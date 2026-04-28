import { Op } from 'sequelize';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Subscription from '../models/Subscription';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import { DateFilter, ISalesRepository, SaleRow } from './ISalesRepository';

export class SalesRepository implements ISalesRepository {
  async findAllOrders(filter?: DateFilter): Promise<SaleRow[]> {
    const where = filter
      ? { created_at: { [Op.between]: [filter.from, filter.to] } }
      : undefined;
    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name'],
            include: [{ model: Category, as: 'category', attributes: ['name'] }],
          }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return orders.map((order) => {
      const orderRow = order as unknown as {
        id: string;
        created_at: Date;
        user?: { email?: string | null } | null;
        items?: Array<{
          product?: { name?: string | null; category?: { name?: string | null } | null } | null;
        }> | null;
        total_amount: number;
        status: string;
      };
      const items = orderRow.items ?? [];
      const productNames = items.map((item) => item.product?.name ?? null);
      const categoryNames = Array.from(new Set(
        items
          .map((item) => item.product?.category?.name ?? '')
          .map((name) => name.trim())
          .filter((name) => name.length > 0),
      ));
      return {
        id: orderRow.id,
        date: orderRow.created_at,
        userEmail: orderRow.user?.email ?? null,
        productNames,
        categoryNames,
        type: 'order' as const,
        amount: Number(orderRow.total_amount),
        status: orderRow.status,
      };
    });
  }

  async findAllSubscriptions(filter?: DateFilter): Promise<SaleRow[]> {
    const where = filter
      ? { created_at: { [Op.between]: [filter.from, filter.to] } }
      : undefined;
    const subscriptions = await Subscription.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['email'] },
        {
          model: Product,
          as: 'product',
          attributes: ['name'],
          include: [{ model: Category, as: 'category', attributes: ['name'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return subscriptions.map((subscription) => {
      const subscriptionRow = subscription as unknown as {
        id: string;
        created_at: Date;
        user?: { email?: string | null } | null;
        product?: { name?: string | null; category?: { name?: string | null } | null } | null;
        price: number;
        status: string;
      };

      return {
        id: subscriptionRow.id,
        date: subscriptionRow.created_at,
        userEmail: subscriptionRow.user?.email ?? null,
        productNames: [subscriptionRow.product?.name ?? null],
        categoryNames: subscriptionRow.product?.category?.name
          ? [subscriptionRow.product.category.name.trim()].filter((name) => name.length > 0)
          : [],
        type: 'subscription' as const,
        amount: Number(subscriptionRow.price),
        status: subscriptionRow.status,
      };
    });
  }
}
