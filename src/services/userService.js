const userRepo = require("../repositories/userRepository");
const bcrypt = require("bcrypt");

// GET PROFILE
exports.getUserProfile = async (userId) => {
    return await userRepo.getUserProfile(userId);
};

// UPDATE PROFILE
exports.updateProfile = async (userId, data, file) => {
    const updateData = {
        name: data.name,
        monthlyBudget: data.monthlyBudget,
    };

    if (file) {
        updateData.profilePic = file.location;
    }

    return await userRepo.updateUser(userId, updateData);
};

// CHANGE PASSWORD
exports.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await userRepo.getUserWithPassword(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        throw new Error("Old password incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await userRepo.saveUser(user);
};