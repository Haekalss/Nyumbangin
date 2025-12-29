import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import DonationHistory from '@/models/DonationHistory';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  console.log('=== CRON: ARCHIVE DONATIONS (App Router) ===');
  
  try {
    // Get headers
    const cronSecret = request.headers.get('x-cron-secret');
    
    console.log('📝 Received cron request');
    console.log('🔑 Secret provided:', cronSecret ? 'YES' : 'NO');
    console.log('🔑 Expected secret:', process.env.CRON_SECRET ? 'SET' : 'NOT SET');
    
    // Verify cron secret for security (skip in development)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!isDevelopment && cronSecret !== process.env.CRON_SECRET) {
      console.log('❌ Unauthorized: Invalid cron secret');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid or missing cron secret' },
        { status: 401 }
      );
    }
    
    if (isDevelopment) {
      console.log('⚠️  Running in DEVELOPMENT mode - security check skipped');
    }

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
    let leaderboardUpdated = 0;
    const errors = [];
    const affectedCreators = new Set();
    
    for (const donation of oldDonations) {
      try {
        // Track affected creator untuk update leaderboard nanti
        if (donation.createdBy) {
          affectedCreators.add(donation.createdBy.toString());
        }
        
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
    
    // Update leaderboard untuk semua creator yang terpengaruh
    console.log(`📊 Updating leaderboard for ${affectedCreators.size} creators...`);
    for (const creatorId of affectedCreators) {
      try {
        await MonthlyLeaderboard.updateCurrentMonth(creatorId);
        leaderboardUpdated++;
        console.log(`✅ Leaderboard updated for creator: ${creatorId}`);
      } catch (error) {
        console.error(`❌ Failed to update leaderboard for ${creatorId}:`, error.message);
        // Don't fail the whole job if leaderboard update fails
      }
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total: oldDonations.length,
      archived,
      failed,
      leaderboardUpdated,
      affectedCreators: affectedCreators.size,
      errors: failed > 0 ? errors : undefined
    };
    
    console.log('=== ARCHIVE SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('=== ❌ CRON ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cron-secret',
    },
  });
}
