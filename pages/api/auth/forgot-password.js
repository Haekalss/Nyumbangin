import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import crypto from 'crypto';
import axios from 'axios';
import emailLib from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email wajib diisi' });

  try {
    await dbConnect();

    const creator = await Creator.findOne({ email: email.toLowerCase() });
    // Don't reveal whether the email exists — always return success
    if (!creator) {
      return res.status(200).json({ success: true });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

    creator.resetPasswordToken = otp;
    creator.resetPasswordExpires = new Date(expires);
    await creator.save();
    const subject = 'Kode OTP Reset Password - Nyumbangin';
    const html = `
      <p>Halo,</p>
      <p>Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP berikut untuk mengganti password. Kode berlaku 15 menit.</p>
      <div style="text-align:center; margin:18px 0; font-size:22px; font-weight:700;">${otp}</div>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      <p>Salam,<br/>Tim Nyumbangin</p>
    `;

    // Prefer Resend if key is set, otherwise fallback to SMTP via existing helper
    if (process.env.RESEND_API_KEY) {
      try {
        await axios.post('https://api.resend.com/emails', {
          from: process.env.REPLY_EMAIL_FROM || 'Nyumbangin <no-reply@nyumbangin.web.id>',
          to: email,
          subject,
          html
        }, {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Resend send error:', err?.response?.data || err.message || err);
        // Try SMTP fallback
        await emailLib.sendEmail({ to: email, subject, html });
      }
    } else {
      // SMTP fallback
      await emailLib.sendEmail({ to: email, subject, html });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
