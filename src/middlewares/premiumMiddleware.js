const User = require("../models/userModel");

const isPremiumUser = async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user || !user.isPremium) {
        return res.status(403).json({
            message: "Premium membership required",
        });
    }

    next();
};

module.exports = isPremiumUser;