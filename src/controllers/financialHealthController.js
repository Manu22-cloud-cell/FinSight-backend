const asyncHandler = require("../utils/asyncHandler");
const financialHealthService = require("../services/financialHealthService");

exports.getHealthScore = asyncHandler(async (req, res) => {
    const data = await financialHealthService.getFinancialHealthScore(
        req.user._id
    );

    res.status(200).json({
        health: data,
    });
});