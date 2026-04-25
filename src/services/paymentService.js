const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const orderRepo = require("../repositories/orderRepository");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE ORDER =================
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

// ================= VERIFY PAYMENT =================
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

  // Fetch order
  const existingOrder = await orderRepo.findByOrderId(razorpay_order_id);

  if (!existingOrder) {
    throw new AppError("Order not found", 404);
  }

  if (existingOrder.userId.toString() !== userId.toString()) {
    throw new AppError("Unauthorized payment access", 403);
  }

  // Prevent duplicate processing
  if (existingOrder.status === "SUCCESS") {
    // Already processed → just return success
    return true;
  }

  // ================= SIGNATURE VERIFY =================
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Payment verification failed", 400);
  }

  // ================= TRANSACTION START =================
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Update Order
    await orderRepo.updateOrder(
      razorpay_order_id,
      {
        paymentId: razorpay_payment_id,
        status: "SUCCESS",
      },
      session // pass session
    );

    // 2. Upgrade User (idempotent)
    await User.findByIdAndUpdate(
      userId,
      { isPremium: true },
      { new: true, session }
    );

    // Commit
    await session.commitTransaction();
    session.endSession();

    return true;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Payment transaction failed:", error.message);
    throw new AppError("Payment processing failed", 500);
  }
};

exports.handleWebhookSuccess = async (payment) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = payment.order_id;
    const paymentId = payment.id;

    // Find order
    const existingOrder = await orderRepo.findByOrderId(orderId);

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    // Idempotency (VERY IMPORTANT)
    if (existingOrder.status === "SUCCESS") {
      console.log("Webhook already processed:", orderId);
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Update order
    await orderRepo.updateOrder(
      orderId,
      {
        paymentId,
        status: "SUCCESS",
      },
      session
    );

    // Upgrade user
    await User.findByIdAndUpdate(
      existingOrder.userId,
      { isPremium: true },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log("Webhook payment processed:", orderId);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Webhook transaction failed:", error.message);
    throw error;
  }
};