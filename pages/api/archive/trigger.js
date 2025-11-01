// Manual trigger for archive process
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `https://${req.headers.host}`;
    
    console.log('🔧 Manual trigger - calling archive endpoint...');
    
    // Call the cron endpoint internally
    const response = await fetch(`${baseUrl}/api/cron/archive-donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': process.env.CRON_SECRET || ''
      }
    });
    
    const data = await response.json();
    
    console.log('✅ Archive completed:', data);
    
    return res.status(response.status).json({
      message: 'Manual archive triggered',
      result: data
    });
    
  } catch (error) {
    console.error('❌ Trigger error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
