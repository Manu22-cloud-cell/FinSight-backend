const alertService = require("../services/alertService");

exports.getAlerts = async (req, res) => {
  const alerts = await alertService.getUserAlerts(req.user._id);
  res.json(alerts);
};