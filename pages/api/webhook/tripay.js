import dbConnect from '@/lib/db';
import Donation from '@/models/donations'; // pastikan ini sesuai nama file

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { merchant_ref, status } = req.body;

    console.log('Webhook received:', req.body);

    if (!merchant_ref || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Coba cari berdasarkan ID MongoDB dulu
    let donation = null;

    // Check apakah merchant_ref adalah ObjectId valid
    const isObjectId = merchant_ref.match(/^[0-9a-fA-F]{24}$/);

    if (isObjectId) {
      donation = await Donation.findByIdAndUpdate(merchant_ref, { status }, { new: true });
    }

    // Kalau bukan ObjectId atau tidak ketemu, cari pakai merchant_ref (custom)
    if (!donation) {
      donation = await Donation.findOneAndUpdate(
        { merchant_ref },
        { status },
        { new: true }
      );
    }

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    return res.status(200).json({ message: 'Donation status updated', donation });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
