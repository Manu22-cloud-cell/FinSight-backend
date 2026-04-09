const financialHealthService = require("../services/financialHealthService");

exports.getHealthScore = async (req, res) => {
    try {
        const data = await financialHealthService.getFinancialHealthScore(req.user._id);

        res.status(200).json({
            health: data,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};