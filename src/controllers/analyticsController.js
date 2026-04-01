const analyticsService = require("../services/analyticsService");

exports.getSummary = async (req, res) => {
    try {
        const summary = await analyticsService.getSummary(req.user._id);

        res.status(200).json({
            summary,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCategoryBreakdown = async (req, res) => {
    try {
        const data = await analyticsService.getCategoryBreakdown(req.user._id);

        res.status(200).json({
            categoryBreakdown: data,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMonthlyTrends = async (req, res) => {
  try {
    const data = await analyticsService.getMonthlyTrends(req.user._id);

    res.status(200).json({
      monthlyTrends: data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await analyticsService.getDashboard(req.user._id);

    res.status(200).json({
      dashboard: data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};