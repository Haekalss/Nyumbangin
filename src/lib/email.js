import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email utility function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send.');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Nyumbangin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send payout approved email
export const sendPayoutApprovedEmail = async ({ creatorEmail, creatorName, amount, payoutReference, bankInfo }) => {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const subject = `✅ Pembayaran Selesai - ${formattedAmount}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #2d2d2d;
          background: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: #b8a492;
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        .content p {
          margin: 0 0 16px 0;
          color: #4a4a4a;
        }
        .highlight-box {
          background: #f5e9da;
          border: 2px solid #d6c6b9;
          padding: 24px;
          margin: 24px 0;
          border-radius: 6px;
          text-align: center;
        }
        .amount {
          font-size: 42px;
          font-weight: 700;
          color: #2d2d2d;
          margin: 0 0 8px 0;
        }
        .amount-label {
          font-size: 14px;
          color: #6a6a6a;
          margin: 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d2d2d;
          margin: 32px 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e0e0e0;
        }
        .info-table {
          width: 100%;
          margin: 16px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #2d2d2d;
        }
        .info-value {
          color: #6a6a6a;
          text-align: right;
        }
        .info-box {
          background: #f9f9f9;
          border-left: 4px solid #b8a492;
          padding: 16px;
          margin: 16px 0;
          border-radius: 4px;
        }
        .info-box strong {
          color: #2d2d2d;
          display: block;
          margin-bottom: 8px;
        }
        .info-box p {
          margin: 4px 0;
          font-size: 14px;
          color: #6a6a6a;
        }
        .button {
          display: inline-block;
          background: #b8a492;
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          margin: 24px 0;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s ease;
        }
        .button:hover {
          background: #a89482;
        }
        .footer {
          background: #2d2d2d;
          padding: 32px 30px;
          text-align: center;
          color: #ffffff;
        }
        .footer-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .footer-subtitle {
          font-size: 14px;
          color: #d0d0d0;
          margin: 0 0 16px 0;
        }
        .footer-note {
          font-size: 12px;
          color: #a0a0a0;
          margin: 16px 0 0 0;
          line-height: 1.5;
        }
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          body {
            background: #1a1a1a !important;
          }
          .email-container {
            background: #2d2d2d !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
          }
          .header {
            background: #8a7a6a !important;
          }
          .content {
            background: #2d2d2d !important;
          }
          .content p {
            color: #d0d0d0 !important;
          }
          .highlight-box {
            background: #3a3a3a !important;
            border-color: #6a5a4a !important;
          }
          .amount {
            color: #f5e9da !important;
          }
          .amount-label {
            color: #b0b0b0 !important;
          }
          .section-title {
            color: #f5e9da !important;
            border-bottom-color: #4a4a4a !important;
          }
          .info-row {
            border-bottom-color: #3a3a3a !important;
          }
          .info-label {
            color: #f5e9da !important;
          }
          .info-value {
            color: #d0d0d0 !important;
          }
          .info-box {
            background: #3a3a3a !important;
            border-left-color: #8a7a6a !important;
          }
          .info-box strong {
            color: #f5e9da !important;
          }
          .info-box p {
            color: #d0d0d0 !important;
          }
          .button {
            background: #8a7a6a !important;
          }
          .button:hover {
            background: #9a8a7a !important;
          }
          .footer {
            background: #1a1a1a !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✓ Pembayaran Berhasil</h1>
        </div>
        
        <div class="content">
          <p>Halo <strong>${creatorName}</strong>,</p>
          
          <p>Dana payout Anda telah berhasil ditransfer ke rekening bank yang terdaftar. Silakan cek rekening Anda.</p>
          
          <div class="highlight-box">
            <div class="amount">${formattedAmount}</div>
            <p class="amount-label">Telah ditransfer ke rekening Anda</p>
          </div>
          
          <h3 class="section-title">Detail Transfer</h3>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">Referensi</span>
              <span class="info-value">${payoutReference}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Bank</span>
              <span class="info-value">${bankInfo.bankName || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. Rekening</span>
              <span class="info-value">${bankInfo.accountNumber || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Atas Nama</span>
              <span class="info-value">${bankInfo.accountName || '-'}</span>
            </div>
          </div>
          
          <div class="info-box">
            <strong>Waktu Pencairan</strong>
            <p>Dana akan muncul di rekening Anda dalam 1-2 jam (tergantung bank). Jika belum muncul setelah 24 jam, silakan hubungi support.</p>
          </div>
          
          <div class="info-box">
            <strong>Catatan</strong>
            <p>Simpan email ini sebagai bukti transfer. Jika ada perbedaan jumlah atau masalah lain, segera hubungi support kami.</p>
          </div>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyumbangin.web.id'}/dashboard" class="button">Lihat Dashboard</a>
          </center>
        </div>
        
        <div class="footer">
          <p class="footer-title">Nyumbangin</p>
          <p class="footer-subtitle">Platform Donasi untuk Creator Indonesia</p>
          <p class="footer-note">
            Email ini dikirim otomatis. Jangan balas email ini.<br>
            Untuk bantuan, hubungi support@nyumbangin.web.id
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: creatorEmail,
    subject,
    html,
  });
};

// Send payout rejected email
export const sendPayoutRejectedEmail = async ({ creatorEmail, creatorName, amount, payoutReference, reason }) => {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const subject = `❌ Payout Ditolak - ${formattedAmount}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #2d2d2d;
          background: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: #c9a68a;
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        .content p {
          margin: 0 0 16px 0;
          color: #4a4a4a;
        }
        .warning-box {
          background: #fff8f0;
          border-left: 4px solid #d4a574;
          padding: 20px;
          margin: 24px 0;
          border-radius: 4px;
        }
        .warning-box-title {
          font-size: 16px;
          font-weight: 600;
          color: #2d2d2d;
          margin: 0 0 12px 0;
        }
        .warning-box p {
          margin: 0;
          color: #6a6a6a;
          font-size: 14px;
        }
        .action-box {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          padding: 20px;
          margin: 24px 0;
          border-radius: 6px;
        }
        .action-box-title {
          font-size: 16px;
          font-weight: 600;
          color: #2d2d2d;
          margin: 0 0 12px 0;
        }
        .action-box ul {
          margin: 0;
          padding-left: 20px;
        }
        .action-box li {
          margin: 8px 0;
          color: #6a6a6a;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #b8a492;
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          margin: 24px 0;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s ease;
        }
        .button:hover {
          background: #a89482;
        }
        .footer {
          background: #2d2d2d;
          padding: 32px 30px;
          text-align: center;
          color: #ffffff;
        }
        .footer-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .footer-subtitle {
          font-size: 14px;
          color: #d0d0d0;
          margin: 0 0 16px 0;
        }
        .footer-note {
          font-size: 12px;
          color: #a0a0a0;
          margin: 16px 0 0 0;
          line-height: 1.5;
        }
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          body {
            background: #1a1a1a !important;
          }
          .email-container {
            background: #2d2d2d !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
          }
          .header {
            background: #8a7060 !important;
          }
          .content {
            background: #2d2d2d !important;
          }
          .content p {
            color: #d0d0d0 !important;
          }
          .warning-box {
            background: #3a2a1a !important;
            border-left-color: #d4a574 !important;
          }
          .warning-box-title {
            color: #f5e9da !important;
          }
          .warning-box p {
            color: #d0d0d0 !important;
          }
          .action-box {
            background: #3a3a3a !important;
            border-color: #4a4a4a !important;
          }
          .action-box-title {
            color: #f5e9da !important;
          }
          .action-box li {
            color: #d0d0d0 !important;
          }
          .button {
            background: #8a7a6a !important;
          }
          .button:hover {
            background: #9a8a7a !important;
          }
          .footer {
            background: #1a1a1a !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>⚠ Payout Tidak Dapat Diproses</h1>
        </div>
        
        <div class="content">
          <p>Halo <strong>${creatorName}</strong>,</p>
          
          <p>Permintaan payout Anda dengan referensi <strong>${payoutReference}</strong> sebesar <strong>${formattedAmount}</strong> tidak dapat diproses saat ini.</p>
          
          <div class="warning-box">
            <p class="warning-box-title">Alasan Penolakan</p>
            <p>${reason || 'Tidak ada keterangan dari admin.'}</p>
          </div>
          
          <div class="action-box">
            <p class="action-box-title">Langkah Selanjutnya</p>
            <ul>
              <li>Periksa kembali informasi bank Anda di dashboard</li>
              <li>Pastikan semua data sudah lengkap dan benar</li>
              <li>Jika ada pertanyaan, hubungi support kami</li>
            </ul>
          </div>
          
          <p>Anda dapat mengajukan permintaan payout baru setelah memperbaiki informasi yang diperlukan.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://nyumbangin.web.id'}" class="button">Lihat Dashboard</a>
          </center>
        </div>
        
        <div class="footer">
          <p class="footer-title">Nyumbangin</p>
          <p class="footer-subtitle">Platform Donasi untuk Creator Indonesia</p>
          <p class="footer-note">
            Email ini dikirim otomatis. Jangan balas email ini.<br>
            Untuk bantuan, hubungi admin@nyumbangin.web.id
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: creatorEmail,
    subject,
    html,
  });
};

export default { sendEmail, sendPayoutApprovedEmail, sendPayoutRejectedEmail };
