const alertService = require("../services/alertService");
const asyncHandler = require("../utils/asyncHandler");

exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertService.getUserAlerts(req.user._id);
  res.json(alerts);
});