const User = require("../models/userModel");

// CREATE
exports.createUser = async (data) => {
  return await User.create(data);
};

// FIND BY EMAIL (for login)
exports.findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

// GET ALL USERS
exports.getAllUsers = async () => {
  return await User.find({}).select("_id email monthlyBudget");
};

// GET USER BY ID (basic)
exports.getUserById = async (userId) => {
  return await User.findById(userId).select("name email monthlyBudget profilePic");
};

// Get full profile
exports.getUserProfile = async (userId) => {
  return await User.findById(userId).select("-password");
};

// Update profile
exports.updateUser = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, {
    returnDocument: "after",
  }).select("-password");
};

// Get user with password (for password change)
exports.getUserWithPassword = async (userId) => {
  return await User.findById(userId).select("+password");
};

// Save updated user (after password change)
exports.saveUser = async (user) => {
  return await user.save();
};