import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { name, email, subject, message } = req.body;

    // Validasi input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }

    // Validasi panjang
    if (name.length > 100) {
      return res.status(400).json({ error: 'Nama terlalu panjang (maksimal 100 karakter)' });
    }
    if (subject.length > 200) {
      return res.status(400).json({ error: 'Subjek terlalu panjang (maksimal 200 karakter)' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Pesan terlalu panjang (maksimal 2000 karakter)' });
    }

    // Ambil IP address dan user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Simpan ke database
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress,
      userAgent,
      status: 'unread'
    });

    return res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject
      }
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan server',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
