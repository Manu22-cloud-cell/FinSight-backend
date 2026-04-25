const Order = require("../models/orderModel");

// CREATE
exports.createOrder = (data, session = null) => {
    return Order.create([data], { session }).then(res => res[0]);
};

// UPDATE
exports.updateOrder = (orderId, update, session = null) => {
    return Order.findOneAndUpdate(
        { orderId },
        update,
        { new: true, session }
    );
};

// FIND
exports.findByOrderId = (orderId) => {
    return Order.findOne({ orderId });
};