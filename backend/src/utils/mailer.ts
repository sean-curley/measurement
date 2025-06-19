import nodemailer from "nodemailer";

const APP_NAME = process.env.APP_NAME || "Your App";
const MAIL_FROM = process.env.MAIL_FROM || `"${APP_NAME}" <no-reply@yourapp.com>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // use true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  logger: true,
  debug: true,
});

export async function sendResetEmail(to: string, resetLink: string) {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} – Reset your password`,
    html: `
      <h2>${APP_NAME} Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });

  console.log(`[${APP_NAME}] Reset email sent to ${to}: ${info.messageId}`);
}
