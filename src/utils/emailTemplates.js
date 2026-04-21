exports.resetPasswordTemplate = (name, resetLink) => {
    return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password.</p>

      <a href="${resetLink}" 
         style="
           display: inline-block;
           padding: 10px 20px;
           background: #2563eb;
           color: #fff;
           text-decoration: none;
           border-radius: 6px;
           margin: 10px 0;
         ">
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request this, ignore this email.</p>

      <hr />
      <small>FinSight Team</small>
    </div>
  `;
};