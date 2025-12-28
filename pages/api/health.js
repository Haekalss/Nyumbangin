// Simple health check endpoint
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'yes' : 'no'
  });
}
