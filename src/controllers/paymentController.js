const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");
const crypto = require("crypto");

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

exports.handleWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).send("Missing signature");
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body) // raw body buffer
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).send("Invalid signature");
        }

        const event = JSON.parse(req.body.toString());

        // Handle only success events
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            await paymentService.handleWebhookSuccess(payment);
        }

        res.json({ status: "ok" });

    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(500).send("Webhook processing failed");
    }
};