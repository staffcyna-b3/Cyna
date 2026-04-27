import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Subscription from '../models/Subscription';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';

export interface SaleRow {
  id: string;
  date: Date;
  userEmail: string | null;
  productName: string;
  categoryName: string | null;
  type: 'order' | 'subscription';
  amount: number;
  status: string;
}

export class SalesRepository {
  async findAllOrders(): Promise<SaleRow[]> {
    const orders = await Order.findAll({
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

    return orders.map((o: any) => {
      const items: any[] = o.items ?? [];
      const productName =
        items.map((i: any) => i.product?.name ?? '—').filter(Boolean).join(', ') || '—';
      const categoryName = items[0]?.product?.category?.name ?? null;
      return {
        id: o.id,
        date: o.created_at,
        userEmail: o.user?.email ?? null,
        productName,
        categoryName,
        type: 'order' as const,
        amount: Number(o.total_amount),
        status: o.status,
      };
    });
  }

  async findAllSubscriptions(): Promise<SaleRow[]> {
    const subscriptions = await Subscription.findAll({
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

    return subscriptions.map((s: any) => ({
      id: s.id,
      date: s.created_at,
      userEmail: s.user?.email ?? null,
      productName: s.product?.name ?? '—',
      categoryName: s.product?.category?.name ?? null,
      type: 'subscription' as const,
      amount: Number(s.price),
      status: s.status,
    }));
  }
}
