import dbConnect from '@/lib/db';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const username = (req.query.username || '').toString().toLowerCase();
    const paymentMethod = req.query.payment_method || null; // optional filter

    if (!username) {
      return res.status(400).json({ error: 'username query required' });
    }

    // Lookback period: 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const query = {
      createdByUsername: username,
      status: 'PENDING',
      createdAt: { $gte: since }
    };

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    console.error('Error in debug pending-donations:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

export const config = { api: { bodyParser: true } };