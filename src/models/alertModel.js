const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "BUDGET_EXCEEDED",
        "LOW_BALANCE",
        "HIGH_SPENDING",
        "CATEGORY_LIMIT",
        "PREDICTION_ALERT"
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);