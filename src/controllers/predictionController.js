const asyncHandler = require("../utils/asyncHandler");
const predictionService = require("../services/predictionService");

exports.getPrediction = asyncHandler(async (req, res) => {
  const data = await predictionService.getPrediction(req.user);

  res.status(200).json({
    prediction: data,
  });
});