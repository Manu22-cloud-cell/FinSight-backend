const Alert = require("../models/alertModel");

exports.createAlert = async (data) => {
    return await Alert.create(data);
};

exports.getUserAlerts = async (userId) => {
    return await Alert.find({ userId }).sort({ createdAt: -1 });
};

exports.markAsRead = async (alertId) => {
    return await Alert.findByIdAndUpdate(alertId, { isRead: true }, { new: true });
};

exports.getRecentAlert = async (userId, type) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return await Alert.findOne({
        userId,
        type,
        createdAt: { $gte: oneHourAgo },
    });
};