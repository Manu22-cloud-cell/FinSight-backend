const userService = require("../services/userService");

exports.getProfile = async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const updated = await userService.updateProfile(
    req.user._id,
    req.body,
    req.file
  );

  res.json({ message: "Profile updated", user: updated });
};

exports.changePassword = async (req, res) => {
  await userService.changePassword(
    req.user._id,
    req.body.oldPassword,
    req.body.newPassword
  );

  res.json({ message: "Password updated" });
};