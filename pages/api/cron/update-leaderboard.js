// Update leaderboard untuk semua creator (dijalankan setiap jam via cron)
// Dan finalisasi leaderboard bulan sebelumnya jika belum
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';

export default async function handler(req, res) {
  console.log('=== CRON: UPDATE LEADERBOARD ===');
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify cron secret for security (skip in development)
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const cronSecret = req.headers['x-cron-secret'];
  
  if (!isDevelopment && cronSecret !== process.env.CRON_SECRET) {
    console.log('❌ Unauthorized: Invalid cron secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (isDevelopment) {
    console.log('⚠️  Running in DEVELOPMENT mode - security check skipped');
  }

  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    // Get all active creators
    const creators = await Creator.find({ 
      isApproved: true 
    }).select('_id username');
    
    console.log(`👥 Found ${creators.length} active creators`);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let updated = 0;
    let failed = 0;
    let finalized = 0;
    const errors = [];
    
    // Update current month leaderboard for all creators
    for (const creator of creators) {
      try {
        // Update current month
        await MonthlyLeaderboard.updateMonthlyData(
          creator._id,
          currentYear,
          currentMonth
        );
        updated++;
        console.log(`✅ Updated leaderboard: ${creator.username}`);
        
        // Check if we need to finalize previous month
        // Hanya finalisasi di tanggal 1-2 bulan baru
        if (now.getDate() <= 2) {
          const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
          const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
          
          const previousLeaderboard = await MonthlyLeaderboard.findOne({
            creatorId: creator._id,
            year: prevYear,
            month: prevMonth,
            isFinalized: false
          });
          
          if (previousLeaderboard) {
            await previousLeaderboard.finalize();
            finalized++;
            console.log(`🎯 Finalized previous month: ${creator.username} (${prevYear}-${prevMonth})`);
          }
        }
        
      } catch (error) {
        failed++;
        const errorMsg = `Failed to update ${creator.username}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalCreators: creators.length,
      currentMonth: `${currentYear}-${currentMonth}`,
      updated,
      failed,
      finalized,
      errors: failed > 0 ? errors : undefined
    };
    
    console.log('=== LEADERBOARD UPDATE SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    
    return res.status(200).json(summary);
  } catch (error) {
    console.error('=== ❌ CRON ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      error: 'Server error', 
      details: error.message 
    });
  }
}
