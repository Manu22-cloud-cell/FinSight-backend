const paymentService = require("../services/paymentService");

class PaymentController {

    async createOrder(req, res) {
        try {
            const order = await paymentService.createOrder(req.user._id);
            res.json(order);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async verifyPayment(req, res) {
        try {
            const result = await paymentService.verifyPayment(
                req.body,
                req.user._id
            );

            res.json(result);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = new PaymentController();