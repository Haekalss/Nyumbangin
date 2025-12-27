import dbConnect from '@/lib/db';
import DonationShare from '@/models/DonationShare';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  const { username } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify creator exists
    const creator = await Creator.findOne({ 
      username: username.toLowerCase() 
    }).select('username displayName');

    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    // Get current date in YYYY-MM-DD format (Indonesia timezone)
    const now = new Date();
    const indonesiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const todayDate = indonesiaTime.toISOString().split('T')[0];

    // Get today's share count
    const todayShares = await DonationShare.countDocuments({
      creatorUsername: creator.username,
      date: todayDate
    });

    // Get today's share breakdown by platform
    const todayBreakdown = await DonationShare.aggregate([
      {
        $match: {
          creatorUsername: creator.username,
          date: todayDate
        }
      },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get last 7 days statistics
    const sevenDaysAgo = new Date(indonesiaTime);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7Days = await DonationShare.aggregate([
      {
        $match: {
          creatorUsername: creator.username,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          platforms: { 
            $push: '$platform' 
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Format last 7 days data with platform breakdown
    const formattedLast7Days = last7Days.map(day => {
      const platformCounts = {};
      day.platforms.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
      
      return {
        date: day._id,
        totalShares: day.count,
        platforms: platformCounts
      };
    });

    // Get total all-time shares
    const totalShares = await DonationShare.countDocuments({
      creatorUsername: creator.username
    });

    res.json({
      success: true,
      creator: {
        username: creator.username,
        displayName: creator.displayName
      },
      today: {
        date: todayDate,
        totalShares: todayShares,
        breakdown: todayBreakdown.map(item => ({
          platform: item._id,
          count: item.count
        }))
      },
      last7Days: formattedLast7Days,
      totalShares
    });
  } catch (error) {
    console.error('Error fetching share stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
