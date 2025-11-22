const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    console.log('Email configuration not set. Would send email to:', to);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendSMS(to, message) {
  // Placeholder for SMS functionality
  // In production, integrate with Twilio or similar service
  console.log(`SMS to ${to}: ${message}`);
  return { success: true, message: 'SMS sent (simulated)' };
}

module.exports = { sendEmail, sendSMS };
