/**
 * @file emailService.js
 * @description SMTP email service for sending transactional emails.
 */

const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  FROM_NAME,
} = process.env;

/**
 * Creates a nodemailer transporter.
 * @returns {Object} Nodemailer transporter instance.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Helper to send email using the transporter.
 * @param {Object} mailOptions - Mail options.
 */
const sendMail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      ...mailOptions,
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Sends a verification email.
 * @param {string} to - Recipient email.
 * @param {string} token - Verification token or link.
 */
const sendVerificationEmail = async (to, token) => {
  const html = `
    <h2>Verify your Email</h2>
    <p>Please use the following token to verify your account:</p>
    <h3>${token}</h3>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return sendMail({
    to,
    subject: 'Email Verification - Library Sathi',
    html,
  });
};

/**
 * Sends a welcome email.
 * @param {string} to - Recipient email.
 * @param {string} name - Recipient name.
 */
const sendWelcomeEmail = async (to, name) => {
  const html = `
    <h2>Welcome to Library Sathi, ${name}!</h2>
    <p>We are thrilled to have you on board. Explore the features and let us know if you need any help.</p>
  `;
  return sendMail({
    to,
    subject: 'Welcome to Library Sathi!',
    html,
  });
};

/**
 * Sends an invoice email.
 * @param {string} to - Recipient email.
 * @param {Object} invoiceData - Invoice details.
 */
const sendInvoiceEmail = async (to, invoiceData) => {
  const html = `
    <h2>Your Invoice from Library Sathi</h2>
    <p>Invoice Number: <strong>${invoiceData.invoiceNumber}</strong></p>
    <p>Amount: <strong>${invoiceData.amount}</strong></p>
    <p>Status: <strong>${invoiceData.status}</strong></p>
    <p>Thank you for your business!</p>
  `;
  return sendMail({
    to,
    subject: `Invoice ${invoiceData.invoiceNumber} - Library Sathi`,
    html,
  });
};

/**
 * Sends a password reset email.
 * @param {string} to - Recipient email.
 * @param {string} token - Reset token or link.
 */
const sendPasswordResetEmail = async (to, token) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Use the following token/link:</p>
    <h3>${token}</h3>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return sendMail({
    to,
    subject: 'Password Reset - Library Sathi',
    html,
  });
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendPasswordResetEmail,
};
