import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Send an email using SMTP
 * @param {Object} param0
 * @param {string} param0.to - Recipient email
 * @param {string} param0.subject - Email subject
 * @param {string} param0.html - HTML content
 */
export async function sendemail({ to, subject, html }) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("Missing SMTP configuration in .env");
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: "nikhildubey461@gmail.com",
        pass: "ycdqdaxydpzzsksj",
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};
