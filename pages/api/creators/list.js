import dbConnect from '../../../src/lib/db';
import Creator from '../../../src/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Ambil semua creator yang aktif
    const creators = await Creator.find({ 
      isActive: true 
    })
    .select('username displayName bio profileImageId stats socialLinks')
    .sort({ 'stats.totalDonations': -1 }) // Urutkan berdasarkan total donasi
    .limit(50) // Batasi 50 creator teratas
    .lean();

    // Format data untuk response
    const formattedCreators = creators.map(creator => ({
      username: creator.username,
      displayName: creator.displayName,
      bio: creator.bio || '',
      profileImage: creator.profileImageId 
        ? `/api/user/profile-image/${creator._id}` 
        : '/default-avatar.png',
      totalDonations: creator.stats?.totalDonations || 0,
      totalAmount: creator.stats?.totalAmount || 0,
      donationUrl: `/donate/${creator.username}`,
      socialLinks: creator.socialLinks || {}
    }));

    res.status(200).json({ 
      success: true, 
      creators: formattedCreators 
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data creator' 
    });
  }
}
