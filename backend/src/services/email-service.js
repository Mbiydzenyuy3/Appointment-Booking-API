// services/email-service.js
import sgMail from "@sendgrid/mail";
import { logError, logInfo } from "../utils/logger.js";

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "support@bookeasy.com",
        name: "BOOKEasy Support"
      },
      subject: "Password Reset Request - BOOKEasy",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - BOOKEasy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📅 BOOKEasy</h1>
            <p style="margin: 10px 0 0 0;">Password Reset Request</p>
          </div>

          <div class="content">
            <h2>Hello!</h2>

            <p>You have requested to reset your password for your BOOKEasy account. Click the button below to reset your password:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>

            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.
            </div>

            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>

            <p>If you have any questions or need help, please don't hesitate to contact our support team.</p>

            <p>Best regards,<br>The BOOKEasy Team</p>
          </div>

          <div class="footer">
            <p>This email was sent to you because a password reset was requested for your BOOKEasy account.</p>
            <p>If you no longer wish to receive these emails, you can update your account settings.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        BOOKEasy - Password Reset Request

        Hello!

        You have requested to reset your password for your BOOKEasy account.

        Click this link to reset your password: ${resetUrl}

        This link will expire in 1 hour for your security.

        If you didn't request this password reset, please ignore this email.

        If you have any questions, please contact our support team.

        Best regards,
        The BOOKEasy Team
      `
    };

    const result = await sgMail.send(msg);
    logInfo(`Password reset email sent to ${email}`);

    return { success: true, messageId: result[0]?.headers?.["x-message-id"] };
  } catch (error) {
    logError("Error sending password reset email", error);
    throw new Error("Failed to send password reset email");
  }
};

// Send appointment cancellation notification
export const sendAppointmentCancellationEmail = async (
  clientEmail,
  clientName,
  providerName,
  serviceName,
  appointmentDate,
  appointmentTime
) => {
  try {
    const msg = {
      to: clientEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "support@bookeasy.com",
        name: "BOOKEasy Support"
      },
      subject: "Appointment Cancelled - BOOKEasy",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Cancelled - BOOKEasy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .appointment-details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📅 BOOKEasy</h1>
            <p style="margin: 10px 0 0 0;">Appointment Cancellation Notice</p>
          </div>

          <div class="content">
            <h2>Hello ${clientName}!</h2>

            <p>We're writing to inform you that your appointment has been cancelled by the service provider. We apologize for any inconvenience this may cause.</p>

            <div class="appointment-details">
              <h3 style="margin-top: 0; color: #dc2626;">Cancelled Appointment Details:</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Provider:</strong> ${providerName}</p>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
            </div>

            <p>We understand this cancellation may disrupt your plans. Please feel free to book another appointment with ${providerName} or explore other available services on our platform.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Book New Appointment</a>
            </div>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team or the service provider directly.</p>

            <p>We appreciate your understanding and hope to serve you again soon.</p>

            <p>Best regards,<br>The BOOKEasy Team</p>
          </div>

          <div class="footer">
            <p>This email was sent to you because you had a booked appointment on BOOKEasy.</p>
            <p>If you no longer wish to receive these emails, you can update your account settings.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        BOOKEasy - Appointment Cancellation Notice

        Hello ${clientName}!

        We're writing to inform you that your appointment has been cancelled by the service provider. We apologize for any inconvenience this may cause.

        Cancelled Appointment Details:
        Service: ${serviceName}
        Provider: ${providerName}
        Date: ${appointmentDate}
        Time: ${appointmentTime}

        We understand this cancellation may disrupt your plans. Please feel free to book another appointment with ${providerName} or explore other available services on our platform.

        Book new appointment: ${process.env.FRONTEND_URL}/dashboard

        If you have any questions, please contact our support team.

        Best regards,
        The BOOKEasy Team
      `
    };

    const result = await sgMail.send(msg);
    logInfo(`Appointment cancellation email sent to ${clientEmail}`);

    return { success: true, messageId: result[0]?.headers?.["x-message-id"] };
  } catch (error) {
    logError("Error sending appointment cancellation email", error);
    throw new Error("Failed to send appointment cancellation email");
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    // SendGrid doesn't have a direct verify method, but we can try sending a test email or check API key
    // For now, just check if API key is set
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }
    logInfo("SendGrid API key configured");
    return { success: true };
  } catch (error) {
    logError("Email service connection failed", error);
    return { success: false, error: error.message };
  }
};
