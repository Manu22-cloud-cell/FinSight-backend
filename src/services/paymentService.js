const Razorpay = require("razorpay");
const crypto = require("crypto");
const orderRepository = require("../repositories/orderRepository");
const User = require("../models/userModel");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService {

    async createOrder(userId) {
        const options = {
            amount: 50000, // ₹500
            currency: "INR",
        };

        const razorpayOrder = await razorpay.orders.create(options);

        await orderRepository.createOrder({
            userId,
            amount: options.amount,
            orderId: razorpayOrder.id,
        });

        return razorpayOrder;
    }

    async verifyPayment(data, userId) {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = data;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw new Error("Payment verification failed");
        }

        // Update order
        await orderRepository.updateOrder(razorpay_order_id, {
            status: "SUCCESS",
            paymentId: razorpay_payment_id,
        });

        // Upgrade user
        await User.findByIdAndUpdate(req.user._id, {
            isPremium: true,
            premiumSince: new Date(),
        });

        return { success: true };
    }
}

module.exports = new PaymentService();