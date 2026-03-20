import { OrdersRepository } from "../repository/orders.repository";

export class OrdersService {
    private ordersRepository = new OrdersRepository();

    async getAllOrders(userId: string) {
        try {
            return this.ordersRepository.getAll(userId);
        } catch (error) {
            console.log(error);
            throw new Error('Error fetching orders');
        }
    }

    async getOrderById(id: string, userId: string) {
        try {
            return this.ordersRepository.getById(id, userId);
        } catch (error) {
            console.log(error);
            throw new Error('Error fetching order');
        }
    }

    async createOrder(userId: string, data: any) { // DTO ?
        try {
            // validate address
            if (!data.address) {
                throw new Error('Address is required');
            }
            // check creation ok then send email to user with order details ?
            const newOrder = await this.ordersRepository.create({ ...data, user_id: userId });
            if (!newOrder) {
                throw new Error('Error creating order');
            }
            return newOrder;
        } catch (error) {
            console.log(error);
            throw new Error('Error creating order');
        }
    }
}