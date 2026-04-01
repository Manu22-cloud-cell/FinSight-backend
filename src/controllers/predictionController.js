const predictionService = require("../services/predictionService");

exports.getPrediction = async (req, res) => {
  try {
    const data = await predictionService.getPrediction(req.user);

    res.status(200).json({
      prediction: data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};