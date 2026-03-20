import Order from "../models/Order";

export class OrdersRepository {
    async getAll(userId: string) {
        return Order.findAll(
           { where: { user_id: userId } }
        );
    }

    async getById(id: string, userId: string) {
        return Order.findOne({
            where: { id, user_id: userId },
        });
    }

    async create(data: any) { // DTO ?
        return Order.create(data);
    }
}