import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';

/**
 * Statistik publik untuk landing page.
 * - Tanpa autentikasi (hanya data agregat, bukan data pribadi)
 * - Cache 60 detik di edge/CDN
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  try {
    await dbConnect();

    const [creatorCount, donationAgg] = await Promise.all([
      Creator.countDocuments({ isActive: true }),
      Donation.aggregate([
        { $match: { status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            uniqueDonors: { $addToSet: '$name' },
          },
        },
      ]),
    ]);

    const agg = donationAgg[0] || { totalDonations: 0, totalAmount: 0, uniqueDonors: [] };

    // Hindari error serialisasi pada ObjectId
    const safeDonors = (agg.uniqueDonors || [])
      .filter((n) => typeof n === 'string')
      .length;

    return res.status(200).json({
      success: true,
      stats: {
        creators: creatorCount,
        donations: agg.totalDonations || 0,
        totalAmount: agg.totalAmount || 0,
        donors: safeDonors,
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik' });
  }
}
