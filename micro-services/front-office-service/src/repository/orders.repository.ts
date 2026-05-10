import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Address from "../models/Address";
import Cart from "../models/Cart";
import CartItem from "../models/CartItem";
import Product from "../models/Product";
import { generateLicenseKey } from "../utils/licenseKey";
import { OrderCreationAttributes } from "../models/Order";
import { OrderItemCreationAttributes } from "../models/OrderItem";
import { IOrderRepository } from "../interfaces/OrderRepository";
import { OrderStatus } from "../enum/OrderStatus";

export class OrderRepository implements IOrderRepository {
    async findAddressByIdAndUserId(id: string, userId: string): Promise<Address | null> {
        return Address.findOne({
            where: {
                id,
                user_id: userId,
            },
        });
    }

    async findCartWithItemsByIdAndUserId(id: string, userId: string): Promise<Cart | null> {
        return Cart.findOne({
            where: {
                id,
                user_id: userId,
            },
            include: [
                {
                    model: CartItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                        },
                    ],
                },
            ],
        });
    }

    async clearCartItems(cartId: string): Promise<number> {
        return CartItem.destroy({ where: { cart_id: cartId } });
    }

    async create(data: OrderCreationAttributes): Promise<Order> {
        return Order.create(data);
    }

    async createItems(items: OrderItemCreationAttributes[]): Promise<OrderItem[]> {
        return OrderItem.bulkCreate(items);
    }

    async findAllByUserId(userId: string): Promise<Order[]> {
        return Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }],
                },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async findByIdWithItems(id: string): Promise<Order | null> {
        return Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{ model: Product, as: "product" }],
                },
                { model: Address, as: "billingAddress" },
                { model: Address, as: "shippingAddress" },
            ],
        });
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Order | null> {
        return Order.findOne({
            where: {
                id,
                user_id: userId,
            },
        });
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
        const order = await Order.findByPk(id);
        if (!order) return null;
        order.status = status;
        await order.save();
        return order;
    }

    async updateStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<boolean> {
        const [affectedCount] = await Order.update(
            { status },
            { where: { stripe_payment_intent_id: paymentIntentId } }
        );
        return affectedCount > 0;
    }

    async generateLicenseKeysForOrderItems(paymentIntentId: string): Promise<void> {
        const order = await Order.findOne({
            where: { stripe_payment_intent_id: paymentIntentId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: Product, as: 'product', attributes: ['id', 'is_service'] }],
            }],
        });
        if (!order) return;
        const items: OrderItem[] = (order as any).items ?? [];
        for (const item of items) {
            if ((item as any).product?.is_service && !item.license_key) {
                await OrderItem.update(
                    { license_key: generateLicenseKey() },
                    { where: { id: item.id } }
                );
            }
        }
    }

    async findItemsByPaymentIntentId(paymentIntentId: string): Promise<{ product_id: string; quantity: number }[]> {
        const order = await Order.findOne({
            where: { stripe_payment_intent_id: paymentIntentId },
            include: [{ model: OrderItem, as: 'items', attributes: ['product_id', 'quantity'] }],
        });
        const items = (order as any)?.items ?? [];
        return items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity }));
    }
}