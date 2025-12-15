import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { name, email, subject, message, image } = req.body;

    // Validasi input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }    // Validasi panjang
    if (name.length > 100) {
      return res.status(400).json({ error: 'Nama terlalu panjang (maksimal 100 karakter)' });
    }
    if (subject.length > 200) {
      return res.status(400).json({ error: 'Subjek terlalu panjang (maksimal 200 karakter)' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Pesan terlalu panjang (maksimal 2000 karakter)' });
    }    // Handle image upload
    let imageUrl = null;
    if (image) {
      try {
        // Dynamically import fs and path only when needed
        const fs = await import('fs');
        const path = await import('path');
        
        // Validate image is base64
        const matches = image.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)/);
        if (matches && matches.length === 3) {
          const imageType = matches[1];
          const base64Data = matches[2];
          
          // Validate file size (max 5MB)
          const imageSizeInBytes = (base64Data.length * 3) / 4;
          if (imageSizeInBytes > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Ukuran gambar terlalu besar (maksimal 5MB)' });
          }

          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contact');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(7);
          const fileName = `contact-${timestamp}-${randomString}.${imageType}`;
          const filePath = path.join(uploadsDir, fileName);

          // Save image file
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(filePath, buffer);

          imageUrl = `/uploads/contact/${fileName}`;
        } else {
          return res.status(400).json({ error: 'Format gambar tidak valid' });
        }
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(400).json({ error: 'Gagal mengupload gambar' });
      }
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
      imageUrl,
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
