const Order = require("../models/userModel");

class OrderRepository {
    async createOrder(data) {
        return await Order.create(data);
    }

    async findByOrderId(orderId) {
        return await Order.findOne({ orderId });
    }

    async updateOrder(orderId, updateData) {
        return await Order.findOneAndUpdate(
            { orderId },
            updateData,
            { returnDocument: "after" }
        );
    }
}

module.exports = new OrderRepository();