const Order = require("../models/orderModel");

exports.createOrder = (data) => {
    return Order.create(data);
};

exports.updateOrder = (orderId, update) => {
    return Order.findOneAndUpdate({ orderId }, update, { new: true });
};

exports.findByOrderId = (orderId) => {
    return Order.findOne({ orderId });
};