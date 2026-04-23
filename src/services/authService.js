require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/userRepository");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const PasswordResetToken = require("../models/passwordResetTokenModel");
const User = require("../models/userModel");
const { sendEmail } = require("./emailService");
const { resetPasswordTemplate } = require("../utils/emailTemplates");
const AppError = require("../utils/AppError");

// REGISTER
exports.registerUser = async (data) => {
  const { name, email, password, monthlyBudget } = data;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepo.createUser({
    name,
    email,
    password: hashedPassword,
    monthlyBudget,
  });

  return user;
};


// LOGIN
exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};


// FORGOT PASSWORD
exports.forgotPassword = async (email) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    return true; // don't reveal user existence
  }

  // REMOVE old tokens before creating new one
  await PasswordResetToken.deleteMany({ user: user._id });

  const rawToken = uuidv4();

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordResetToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt,
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  sendEmail({
    to: user.email,
    subject: "Reset your FinSight password",
    text: `Reset your password: ${resetLink}`,
    html: resetPasswordTemplate(user.name, resetLink),
  }).catch((err) => {
    console.error("Email failed:", err.message);
  });

  return true;
};


// RESET PASSWORD
exports.resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const resetDoc = await PasswordResetToken.findOne({
    token: hashedToken,
    used: false,
  });

  if (!resetDoc) {
    throw new AppError("Invalid or already used token", 400);
  }

  if (resetDoc.expiresAt < new Date()) {
    throw new AppError("Token expired", 400);
  }

  const user = await User.findById(resetDoc.user);

  if (!user) {
    return true; // don't reveal user existence
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = newHashedPassword;
  await user.save();

  // Mark token as used
  resetDoc.used = true;
  await resetDoc.save();

  return true;
};