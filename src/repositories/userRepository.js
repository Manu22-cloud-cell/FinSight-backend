const User = require("../models/userModel");

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

exports.getAllUsers = async () => {
  return await User.find({}).select("_id email monthlyBudget");
}

exports.getUserById = async (userId) => {
  return await User.findById(userId).select("email monthlyBudget");
}