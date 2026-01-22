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
      <div style="max-width:420px;margin:32px auto;padding:32px 24px;background:#fff;border-radius:16px;border:1px solid #eee;box-shadow:0 2px 12px 0 #0001;font-family:Segoe UI,Arial,sans-serif;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <img src="https://nyumbangin.web.id/logo.png" alt="Nyumbangin" style="width:40px;height:40px;border-radius:8px;border:1px solid #b8a492;background:#f5e9da;object-fit:cover;">
          <div>
            <div style="font-size:18px;font-weight:600;color:#2d2d2d;">Nyumbangin</div>
            <div style="font-size:12px;color:#b8a492;">Reset Password</div>
          </div>
        </div>
        <p style="font-size:15px;color:#222;margin:0 0 12px 0;">Halo,</p>
        <p style="font-size:14px;color:#444;margin:0 0 18px 0;">Kami menerima permintaan untuk mereset password akun Anda.<br>Gunakan kode OTP berikut untuk mengganti password. Kode berlaku <b>15 menit</b>.</p>
        <div style="text-align:center;margin:28px 0;">
          <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:6px;color:#2d2d2d;background:#f5e9da;border-radius:8px;padding:16px 32px;border:1px solid #b8a492;">${otp}</span>
        </div>
        <p style="font-size:13px;color:#888;margin:0 0 18px 0;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <div style="font-size:13px;color:#b8a492;">Salam,<br>Tim Nyumbangin</div>
      </div>
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
