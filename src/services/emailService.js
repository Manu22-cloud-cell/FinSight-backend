const nodemailer = require("nodemailer");
const AppError = require("../utils/AppError");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP Config Error:", err);
  } else {
    console.log("SMTP Ready");
  }
});

exports.sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new AppError("Invalid email data", 400);
  }

  try {
    const info = await transporter.sendMail({
      from: `"FinSight" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email Error:", error.message);

    throw new AppError("Email sending failed", 500);
  }
};