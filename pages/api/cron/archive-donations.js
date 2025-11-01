// Auto-archive donations older than 24 hours
// This endpoint should be called by a cron job every 6 hours
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import DonationHistory from '@/models/DonationHistory';

export default async function handler(req, res) {
  console.log('=== CRON: ARCHIVE DONATIONS ===');
  
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
    
    // Find donations older than 24 hours with PAID status
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldDonations = await Donation.find({
      status: 'PAID',
      createdAt: { $lt: twentyFourHoursAgo }
    }).populate('createdBy', 'username');
    
    console.log(`📦 Found ${oldDonations.length} donations to archive`);
    
    let archived = 0;
    let failed = 0;
    const errors = [];
    
    for (const donation of oldDonations) {
      try {
        // Archive to donation_history collection
        await DonationHistory.archiveDonation(donation, 'AUTO_24H');
        
        // Delete from donations collection
        await Donation.findByIdAndDelete(donation._id);
        
        archived++;
        console.log(`✅ Archived: ${donation.merchant_ref} (${donation.createdByUsername})`);
      } catch (error) {
        failed++;
        const errorMsg = `Failed to archive ${donation.merchant_ref}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total: oldDonations.length,
      archived,
      failed,
      errors: failed > 0 ? errors : undefined
    };
    
    console.log('=== ARCHIVE SUMMARY ===');
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
