const paymentService = require("../services/paymentService");

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id; // from auth middleware

        const order = await paymentService.createRazorpayOrder(userId);

        res.json(order);
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const userId = req.user._id;

        await paymentService.verifyPayment(req.body, userId);

        res.json({
            message: "Payment successful, premium activated",
        });
    } catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
};