import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import ProfileImage from '@/models/ProfileImage';
import fs from 'fs';
import path from 'path';

function returnDefaultAvatar(res) {
  const defaultImagePath = path.join(process.cwd(), 'public', 'default-avatar.png');
  const defaultImage = fs.readFileSync(defaultImagePath);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  return res.send(defaultImage);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    await dbConnect();

    // Get creator with profile image
    const creator = await Creator.findById(id).populate('profileImageId');
    
    if (!creator || !creator.profileImageId) {
      return returnDefaultAvatar(res);
    }

    const profileImage = creator.profileImageId;
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(profileImage.imageData, 'base64');
    
    // Set appropriate headers
    res.setHeader('Content-Type', profileImage.mimeType || 'image/jpeg');
    res.setHeader('Content-Length', imageBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.send(imageBuffer);

  } catch (error) {
    console.error('Get profile image error:', error);
    return returnDefaultAvatar(res);
  }
}
