import { HttpError } from "../common/httpError";
import { Logger } from "../common/logger";
import { OrderStatus } from "../enum/OrderStatus";
import { CreateOrderRequest } from "../dto/request/CreateOrderRequest";
import { GetOrderRequest } from "../dto/request/GetOrderRequest";
import { CreateOrderResponse } from "../dto/response/CreateOrderResponse";
import { GetOrderResponse } from "../dto/response/GetOrderResponse";
import { GetOrdersResponse } from "../dto/response/GetOrdersResponse";
import { IOrderRepository } from "../interfaces/OrderRepository";
import { IOrderService } from "../interfaces/OrderService";

export class OrderService implements IOrderService {
    private readonly orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async createOrder(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse> {
        const { userId, userEmail, cartId, billingAddressId, shippingAddressId, stripePaymentIntentId } = createOrderRequest;

        const normalizedCartId = String(cartId);
        const normalizedBillingAddressId = String(billingAddressId);
        const normalizedShippingAddressId = String(shippingAddressId);

        const [billingAddress, shippingAddress] = await Promise.all([
            this.orderRepository.findAddressByIdAndUserId(normalizedBillingAddressId, String(userId)),
            this.orderRepository.findAddressByIdAndUserId(normalizedShippingAddressId, String(userId)),
        ]);

        if (!billingAddress || !shippingAddress) {
            throw new HttpError(404, "Address not found");
        }

        const cart = await this.orderRepository.findCartWithItemsByIdAndUserId(normalizedCartId, String(userId));

        if (!cart) {
            throw new HttpError(404, "Cart not found");
        }

        const cartItems = ((cart as unknown as {
            items?: Array<{
                product_id: string;
                quantity: number;
                product?: {
                    price?: number | string;
                };
            }>;
        }).items ?? []).map((item) => {
            const product = item.product;

            return {
                productId: item.product_id,
                quantity: item.quantity,
                unitPrice: Number(product?.price ?? 0),
            };
        });

        if (!cartItems.length) {
            throw new HttpError(422, "Cart is empty");
        }

        const orderItems = cartItems.map((item) => ({
            product_id: String(item.productId ?? ""),
            quantity: Number(item.quantity ?? 0),
            unit_price: Number(item.unitPrice ?? 0),
        }));

        const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

        const order = await this.orderRepository.create({
            user_id: userId,
            billing_address_id: normalizedBillingAddressId,
            shipping_address_id: normalizedShippingAddressId,
            billing_address_snapshot: billingAddress.toJSON(),
            shipping_address_snapshot: shippingAddress.toJSON(),
            total_amount: Number(totalAmount.toFixed(2)),
            status: OrderStatus.PENDING,
            stripe_payment_intent_id: stripePaymentIntentId ?? null,
        });

        await this.orderRepository.createItems(
            orderItems.map((item) => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }))
        );

        await this.orderRepository.clearCartItems(normalizedCartId).catch((error: unknown) => {
            Logger.warn("Failed to clear cart after order", {
                message: error instanceof Error ? error.message : String(error),
                cartId: normalizedCartId,
                userId,
            });
        });

        if (userEmail) {
            Logger.info("Order confirmation email dispatch deferred", {
                userId,
                orderId: order.id,
            });
            // TODO: auth token provided by DESIR's auth flow
            // pending merge of gateway JWT middleware
        }

        return await this.orderRepository.findByIdWithItems(order.id) as unknown as CreateOrderResponse;
    }

    async getOrdersByUserId(userId: string): Promise<GetOrdersResponse[]> {
        const orders = await this.orderRepository.findAllByUserId(userId);

        return orders.map((order) => {
            const raw = order as unknown as {
                items?: Array<{
                    id: string;
                    unit_price: number;
                    quantity: number;
                    product?: { name?: string; is_service?: boolean; duration?: number | null };
                }>;
                billing_period?: never;
            };

            const items = (raw.items ?? []).map((item) => ({
                id: item.id,
                product_name: item.product?.name ?? null,
                unit_price: Number(item.unit_price),
                quantity: item.quantity,
                is_recurring: item.product?.is_service ?? false,
            }));

            return {
                id: order.id,
                status: order.status,
                total_amount: Number(order.total_amount),
                created_at: order.created_at.toISOString(),
                billing_period: this.resolveBillingPeriod(raw.items ?? []),
                stripe_payment_intent_id: order.stripe_payment_intent_id ?? null,
                items,
            };
        });
    }

    async getOrderById({ orderId, userId }: GetOrderRequest): Promise<GetOrderResponse> {
        const order = await this.orderRepository.findByIdWithItems(orderId);

        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        if (order.user_id !== userId) {
            throw new HttpError(403, "Forbidden");
        }

        const raw = order as unknown as {
            items?: Array<{
                id: string;
                unit_price: number;
                quantity: number;
                product?: { name?: string; is_service?: boolean; duration?: number | null };
            }>;
            billingAddress?: object;
            shippingAddress?: object;
        };

        return {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total_amount: Number(order.total_amount),
            billing_period: this.resolveBillingPeriod(raw.items ?? []),
            stripe_payment_intent_id: order.stripe_payment_intent_id ?? null,
            items: (raw.items ?? []).map((item) => ({
                id: item.id,
                product_name: item.product?.name ?? '',
                unit_price: Number(item.unit_price),
                quantity: item.quantity,
            })),
            billing_address_snapshot: order.billing_address_snapshot as GetOrderResponse['billing_address_snapshot'],
            billingAddress: raw.billingAddress as GetOrderResponse['billingAddress'],
            shippingAddress: raw.shippingAddress as GetOrderResponse['shippingAddress'],
            // TODO: populate from GET /api/payments/:paymentIntentId once Marie's endpoint is available
            payment_last4: null,
            payment_brand: null,
            created_at: order.created_at.toISOString(),
        };
    }

    private resolveBillingPeriod(
        items: Array<{ product?: { is_service?: boolean; duration?: number | null } }>
    ): 'monthly' | 'yearly' | null {
        const firstService = items.find((i) => i.product?.is_service);
        if (firstService?.product?.duration === 30) return 'monthly';
        if (firstService?.product?.duration === 365) return 'yearly';
        return null;
    }

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
        const order = await this.orderRepository.updateStatus(orderId, status);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }
        Logger.info("Order status updated", { orderId, status });
    }

    async getOrderItemsByPaymentIntentId(paymentIntentId: string): Promise<{ product_id: string; quantity: number }[]> {
        return this.orderRepository.findItemsByPaymentIntentId(paymentIntentId);
    }

    async updateOrderStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<void> {
        const updated = await this.orderRepository.updateStatusByPaymentIntentId(paymentIntentId, status);
        if (!updated) {
            throw new HttpError(404, "Order not found for payment intent");
        }
        Logger.info("Order status updated by payment intent", { paymentIntentId, status });
    }
}