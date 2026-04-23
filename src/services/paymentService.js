const Razorpay = require("razorpay");
const crypto = require("crypto");

const orderRepo = require("../repositories/orderRepository");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
exports.createRazorpayOrder = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const amount = 49900; // ₹499

  const options = {
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  let order;

  try {
    order = await razorpay.orders.create(options);
  } catch (err) {
    console.error("Razorpay Order Error:", err.message);
    throw new AppError("Failed to create payment order", 500);
  }

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


// Verify Payment
exports.verifyPayment = async (data, userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Invalid payment data", 400);
  }

  // Fetch existing order (for duplicate protection)
  const existingOrder = await orderRepo.getOrderByOrderId(razorpay_order_id);

  if (!existingOrder) {
    throw new AppError("Order not found", 404);
  }

  // Prevent duplicate processing
  if (existingOrder.status === "SUCCESS") {
    throw new AppError("Payment already processed", 400);
  }

  // Signature verification
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Payment verification failed", 400);
  }

  // Update Order
  await orderRepo.updateOrder(razorpay_order_id, {
    paymentId: razorpay_payment_id,
    status: "SUCCESS",
  });

  // Idempotent user upgrade (only if not already premium)
  if (!existingOrder.userId) {
    throw new AppError("Invalid order data", 500);
  }

  await User.findByIdAndUpdate(
    userId,
    { isPremium: true },
    { new: true }
  );

  return true;
};