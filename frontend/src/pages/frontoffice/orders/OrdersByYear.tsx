import type { OrderSummary } from '@/types/interfaces/Order/OrderSummary';
import OrderCard from './OrderCard';

interface Props {
  year: number;
  orders: OrderSummary[];
  onOrderClick: (id: string) => void;
}

export default function OrdersByYear({ year, orders, onOrderClick }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-[#372cca] mb-3">{year}</h2>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onOrderClick={onOrderClick} />
      ))}
    </section>
  );
}
