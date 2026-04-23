const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  user.password = undefined;

  res.status(200).json({
    message: "Login successful",
    user,
    token,
  });
});

// Forgot Password Controller
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  res.json({
    message: "Password reset link sent to your email",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  res.json({
    message: "Password reset successful",
  });
});