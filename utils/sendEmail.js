const nodemailer = require('nodemailer');

/**
 * Professional Email Utility for E-Library
 * Supports: Welcome Emails, Password Reset Tokens
 */
const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS is missing in environment variables!');
    throw new Error('Email configuration missing');
  }

  // 1) Create a transporter
  // Note: For production, use service like SendGrid, Mailgun, or Gmail with App Password
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"E-Library Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email sent: %s', info.messageId);
};

module.exports = sendEmail;
