const userRepo = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

// GET PROFILE
exports.getUserProfile = async (userId) => {
    const user = await userRepo.getUserProfile(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

// UPDATE PROFILE
exports.updateProfile = async (userId, data, file) => {
    const { name, monthlyBudget } = data;

    if (!name || monthlyBudget === undefined) {
        throw new AppError("Name and monthly budget are required", 400);
    }

    const updateData = {
        name,
        monthlyBudget,
    };

    if (file) {
        updateData.profilePic = file.location;
    }

    const updatedUser = await userRepo.updateUser(userId, updateData);

    if (!updatedUser) {
        throw new AppError("Failed to update profile", 500);
    }

    return updatedUser;
};

// CHANGE PASSWORD
exports.changePassword = async (userId, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw new AppError("Old and new passwords are required", 400);
    }

    if (oldPassword === newPassword) {
        throw new AppError("New password must be different", 400);
    }

    const user = await userRepo.getUserWithPassword(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        throw new AppError("Old password incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await userRepo.saveUser(user);
};