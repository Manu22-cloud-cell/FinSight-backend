const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    provider: {
      type: String,
      enum: ["RAZORPAY", "CASHFREE"],
      default: "RAZORPAY",
    },

    orderId: String,   // from Razorpay
    paymentId: String, // from Razorpay
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);