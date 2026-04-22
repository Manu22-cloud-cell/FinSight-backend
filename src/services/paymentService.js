const Razorpay = require("razorpay");
const crypto = require("crypto");

const orderRepo = require("../repositories/orderRepository");
const User = require("../models/userModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
exports.createRazorpayOrder = async (userId) => {
  const amount = 49900; // ₹499 (in paise)

  const options = {
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  // Save in DB
  await orderRepo.createOrder({
    userId,
    amount: amount / 100,
    orderId: order.id,
    status: "PENDING",
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  };
};

exports.verifyPayment = async (data, userId) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Payment verification failed");
  }

  // Update Order
  await orderRepo.updateOrder(razorpay_order_id, {
    paymentId: razorpay_payment_id,
    status: "SUCCESS",
  });

  // Upgrade user
  await User.findByIdAndUpdate(userId, {
    isPremium: true,
  });

  return true;
};