import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Address from "../models/Address";
import Cart from "../models/Cart";
import CartItem from "../models/CartItem";
import Product from "../models/Product";
import { OrderCreationAttributes } from "../models/Order";
import { OrderItemCreationAttributes } from "../models/OrderItem";
import { IOrderRepository } from "../interfaces/IOrderRepository";
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

    async findByIdWithItems(id: string): Promise<Order | null> {
        return Order.findByPk(id, {
            include: [
                { model: OrderItem, as: "items" },
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
}