// Quick test — sends a real OTP email via Gmail
// Run with: node test-mail.js

require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

if (!user || !pass) {
  console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD not set in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
});

const otp = Math.floor(100000 + Math.random() * 900000).toString();

transporter.sendMail({
  from: `"منصة مَعْشَرو" <${user}>`,
  to: user, // send to self as test
  subject: 'اختبار - رمز التحقق',
  html: `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:16px">
      <h2 style="color:#e05252">اختبار إرسال OTP</h2>
      <p>رمز التحقق التجريبي:</p>
      <div style="font-size:36px;font-weight:900;letter-spacing:8px;text-align:center;padding:20px;background:#fff5f5;border-radius:12px;color:#e05252">${otp}</div>
      <p style="color:#888;font-size:13px">هذا بريد اختباري فقط ✅</p>
    </div>
  `,
}, (err, info) => {
  if (err) {
    console.error('❌ Failed to send:', err.message);
    process.exit(1);
  }
  console.log('✅ Email sent successfully!');
  console.log('   OTP:', otp);
  console.log('   To:', user);
  console.log('   MessageId:', info.messageId);
});
