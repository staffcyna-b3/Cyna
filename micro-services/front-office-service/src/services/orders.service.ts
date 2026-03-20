import { HttpError } from "../common/httpError";
import { Logger } from "../common/logger";
import { OrderStatus } from "../enum/OrderStatus";
import { CreateOrderRequest } from "../dto/request/CreateOrderRequest";
import { GetOrderRequest } from "../dto/request/GetOrderRequest";
import { CreateOrderResponse } from "../dto/response/CreateOrderResponse";
import { GetOrderResponse } from "../dto/response/GetOrderResponse";
import { IOrderRepository } from "../interfaces/IOrderRepository";
import { IOrderService } from "../interfaces/IOrderService";

export class OrderService implements IOrderService {
    private readonly orderRepository: IOrderRepository;

    constructor(orderRepository: IOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async createOrder(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse> {
        const { userId, userEmail, cartId, billingAddressId, shippingAddressId } = createOrderRequest;

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
                quantity: number;
                product?: {
                    price?: number | string;
                    name?: string;
                };
            }>;
        }).items ?? []).map((item) => {
            const product = item.product;

            return {
                quantity: item.quantity,
                unitPrice: Number(product?.price ?? 0),
                productName: product?.name ?? "Unknown product",
            };
        });

        if (!cartItems.length) {
            throw new HttpError(422, "Cart is empty");
        }

        const snapshotItems = cartItems.map((item) => {
            const quantity = Number(item.quantity ?? 0);
            const unitPrice = Number(item.unitPrice ?? 0);
            const productName = String(item.productName ?? "");

            return {
                product_name: productName,
                quantity,
                unit_price: unitPrice,
            };
        });

        const totalAmount = snapshotItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

        const order = await this.orderRepository.create({
            user_id: userId,
            billing_address_id: normalizedBillingAddressId,
            shipping_address_id: normalizedShippingAddressId,
            billing_address_snapshot: billingAddress.toJSON(),
            shipping_address_snapshot: shippingAddress.toJSON(),
            total_amount: Number(totalAmount.toFixed(2)),
            status: OrderStatus.PENDING,
        });

        await this.orderRepository.createItems(
            snapshotItems.map((item) => ({
                order_id: order.id,
                product_name: item.product_name,
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

        if (userEmail && process.env.GATEWAY_INTERNAL_URL) {
            fetch(`${process.env.GATEWAY_INTERNAL_URL}/internal/mail/order-confirmation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: userEmail,
                    orderId: order.id,
                    items: snapshotItems,
                    totalAmount: Number((order as unknown as { total_amount?: number }).total_amount ?? totalAmount),
                }),
            }).catch((err: unknown) => {
                Logger.error("Failed to send order confirmation email", {
                    err: err instanceof Error ? err.message : String(err),
                });
            });
        }

        return await this.orderRepository.findByIdWithItems(order.id) as unknown as CreateOrderResponse;
    }

    async getOrderById({ orderId, userId }: GetOrderRequest): Promise<GetOrderResponse> {
        const orderForUser = await this.orderRepository.findByIdAndUserId(orderId, userId);

        if (!orderForUser) {
            const existingOrder = await this.orderRepository.findByIdWithItems(orderId);
            if (existingOrder) {
                throw new HttpError(403, "Forbidden");
            }
            throw new HttpError(404, "Order not found");
        }

        return await this.orderRepository.findByIdWithItems(orderId) as unknown as GetOrderResponse;
    }

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
        const order = await this.orderRepository.updateStatus(orderId, status);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }
        Logger.info("Order status updated", { orderId, status });
    }
}