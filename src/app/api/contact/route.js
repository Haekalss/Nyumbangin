import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validasi input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Ambil IP address dan user agent untuk tracking
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Simpan ke database
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: ip,
      userAgent: userAgent
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      message: 'Pesan Anda berhasil dikirim! Kami akan merespons dalam 1x24 jam.'
    });

  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    // Simple GET untuk admin - bisa diperluas nanti dengan auth
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}