const User = require("../models/userModel");

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};