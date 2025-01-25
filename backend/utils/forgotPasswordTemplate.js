const forgotPasswordTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear ${name},</p>
      <p>We received a request to reset your password. If you didn't request this change, please ignore this email. Otherwise, use the following one-time password (OTP) to proceed with resetting your password:</p>
      <h2 style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #333; font-size: 24px; border-radius: 5px;">${otp}</h2>
      <p>This OTP is valid for <strong>1 hour</strong> from the time of this request. Please enter it on the GrocerEase website to reset your password.</p>
      <br />
      <p>If you encounter any issues or did not request a password reset, please contact our support team immediately.</p>
      <br />
      <p>Best regards,</p>
      <p><strong>The GrocerEase Team</strong></p>
      <p><small>If you did not request a password reset, please disregard this email.</small></p>
    </div>
  `;
};

export default forgotPasswordTemplate;
