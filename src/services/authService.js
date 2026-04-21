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


exports.registerUser = async (data) => {
  const { name, email, password, monthlyBudget } = data;

  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
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

exports.loginUser = async ({ email, password }) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

// Forgot Password
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return true; // don't reveal user existence
  }

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

  // Create frontend reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Reset your FinSight password",
    text: `Reset your password: ${resetLink}`,
    html: resetPasswordTemplate(user.name, resetLink),
  });

  return true;
};

exports.resetPassword = async (token, newPassword) => {
  // Hash incoming token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const resetDoc = await PasswordResetToken.findOne({
    token: hashedToken,
    used: false,
  });

  if (!resetDoc) {
    throw new Error("Invalid or already used token");
  }

  if (resetDoc.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  const user = await User.findById(resetDoc.user);

  if (!user) {
    return true; // don't reveal user existence
  }

  // Update password
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = newHashedPassword;
  await user.save();

  // Mark token as used
  resetDoc.used = true;
  await resetDoc.save();

  return true;
};

