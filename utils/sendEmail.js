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
  // We use a direct SMTP configuration which is more reliable than the "service" alias on cloud platforms
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE !== 'false', // Default to true (465)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Do not fail on invalid certs (common issue with some SMTP proxies)
      rejectUnauthorized: false
    }
  });

  // Verify connection configuration
  try {
    // Increased timeout for verification to handle slow cold starts
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP Verification Timeout')), 10000))
    ]);
    console.log('✅ SMTP Transporter Verified');
  } catch (err) {
    console.error('❌ SMTP Verification Failed:', err.message);
    // We log but don't necessarily crash here if we want to try sending anyway, 
    // but in this case we throw to catch it in the controller
    throw new Error(`Email verification failed: ${err.message}`);
  }

  // 2) Define the email options
  const mailOptions = {
    from: `"E-Library Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.text || 'Verification Code',
    html: options.html,
  };

  // 3) Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ SendMail Error:', err.message);
    throw err;
  }
};

module.exports = sendEmail;

