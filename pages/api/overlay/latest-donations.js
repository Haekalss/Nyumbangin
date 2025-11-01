import dbConnect from '@/lib/db';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { username, since } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // Query donations created after 'since' timestamp
    const query = {
      createdByUsername: username,
      status: 'PAID'
    };
    
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    // Get latest 10 donations, sorted by newest first
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name amount message createdAt showMessage')
      .lean();

    return res.json({ 
      success: true, 
      donations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Latest donations error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
