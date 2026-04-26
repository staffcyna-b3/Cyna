import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { CreateOrderRequest } from '../dto/request/CreateOrderRequest';
import { GetOrderRequest } from '../dto/request/GetOrderRequest';
import { IOrderService } from '../interfaces/OrderService';
import { OrderStatus } from '../enum/OrderStatus';
import { isValidUuid } from '../common/validation';

export class OrderController {
  private readonly orderService: IOrderService;

  constructor(orderService: IOrderService) {
    this.orderService = orderService;
  }

  async getAll(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

      if (!isValidUuid(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const orders = await this.orderService.getOrdersByUserId(userId);
      return res.status(200).json(orders);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error fetching orders');
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

      if (!isValidUuid(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { cartId, billingAddressId, shippingAddressId, stripePaymentIntentId } = req.body as Partial<CreateOrderRequest>;
      if (!cartId || !billingAddressId || !shippingAddressId) {
        return res.status(422).json({ message: 'Missing required fields' });
      }

      const userEmailHeader = req.headers['x-user-email'];
      const createOrderRequest: CreateOrderRequest = {
        userId,
        userEmail: Array.isArray(userEmailHeader) ? userEmailHeader[0] : userEmailHeader,
        cartId,
        billingAddressId,
        shippingAddressId,
        stripePaymentIntentId,
      };

      const order = await this.orderService.createOrder(createOrderRequest);

      return res.status(201).json(order);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error creating order');
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

      if (!isValidUuid(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const orderIdParam = req.params.id;
      const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
      if (!orderId) {
        return res.status(422).json({ message: 'Order id is required' });
      }

      const userEmailHeader = req.headers['x-user-email'];
      const getOrderRequest: GetOrderRequest = {
        orderId,
        userId,
        userEmail: Array.isArray(userEmailHeader) ? userEmailHeader[0] : userEmailHeader,
      };

      const order = await this.orderService.getOrderById(getOrderRequest);
      return res.status(200).json(order);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error fetching order');
    }
  }

  async updateStatusByPaymentIntent(req: Request, res: Response): Promise<void> {
    const paymentIntentId = req.params.paymentIntentId as string;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      res.status(422).json({ message: 'Invalid or missing status value' });
      return;
    }

    await this.orderService.updateOrderStatusByPaymentIntentId(paymentIntentId, status as OrderStatus);
    res.status(200).json({ message: 'Order status updated' });
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      const { status } = req.body;

      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        res.status(422).json({ message: 'Invalid or missing status value' });
        return;
      }

      await this.orderService.updateOrderStatus(id, status as OrderStatus);
      res.status(200).json({ message: 'Order status updated' });
    } catch (err: unknown) {
      if (err instanceof HttpError && err.statusCode === 404) {
        res.status(404).json({ message: err.message });
        return;
      }
      Logger.error('Failed to update order status', { message: err instanceof Error ? err.message : String(err) });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  private handleError(res: Response, error: unknown, fallbackMessage: string) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    Logger.error(fallbackMessage, { message: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ message: 'Internal server error' });
  }
}
