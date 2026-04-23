const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");

// Create Order
exports.createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const order = await paymentService.createRazorpayOrder(userId);

    res.status(200).json(order);
});

// Verify Payment
exports.verifyPayment = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await paymentService.verifyPayment(req.body, userId);

    res.status(200).json({
        message: "Payment successful, premium activated",
    });
});