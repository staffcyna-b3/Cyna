import { Request, Response } from 'express';
import { OrdersService } from "../services/orders.service";

export class OrdersController {
    private ordersService = new OrdersService();

    async getAllOrders(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            const orders = await this.ordersService.getAllOrders(userId);
            if (!orders) {
                return res.status(404).json({ message: 'No orders found' });
            }
            res.json(orders);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error fetching orders' });
        }
    }

    async getOrderById(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            if (!req.params.id) {
                return res.status(400).json({ message: 'Order ID is required' });
            }
            const order = await this.ordersService.getOrderById(req.params.id as string, userId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(order);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error fetching order' });
        }
    }

    // Endpoint POST /orders — créer une commande à partir du panier (snapshot produits + prix)
    async createOrder(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const newOrder = await this.ordersService.createOrder(userId, req.body);
            if (!newOrder) {
                return res.status(400).json({ message: 'Error creating order' });
            }
            res.status(201).json(newOrder);
        } catch (error) {   
            console.log(error);
            res.status(500).json({ message: 'Error creating order' });
        }
    }
}