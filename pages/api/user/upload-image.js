import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import ProfileImage from '@/models/ProfileImage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication - get token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    await dbConnect();

    // Get creator - handle both decoded.id and decoded.userId
    const creatorId = decoded.userId || decoded.id;
    console.log('Upload image - Creator ID:', creatorId);
    
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      console.error('Creator not found:', creatorId);
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    console.log('Creator found:', { 
      id: creator._id, 
      username: creator.username,
      currentProfileImageId: creator.profileImageId 
    });

    // Get base64 image from request body
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Validate base64 image format
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract mime type and base64 data
    const matches = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Validate size (base64 is ~33% larger than original)
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 2 * 1024 * 1024) { // 2MB limit
      return res.status(400).json({ error: 'Image size exceeds 2MB limit' });
    }

    // Update or create ProfileImage
    let profileImage;
    if (creator.profileImageId) {
      console.log('Updating existing ProfileImage:', creator.profileImageId);
      // Update existing
      profileImage = await ProfileImage.findByIdAndUpdate(
        creator.profileImageId,
        {
          imageData: base64Data,
          mimeType,
          imageType: 'upload',
          uploadedAt: new Date(),
        },
        { new: true }
      );
      console.log('ProfileImage updated:', profileImage?._id);
    } else {
      console.log('Creating new ProfileImage for creator:', creator._id);
      // Create new
      profileImage = await ProfileImage.create({
        creatorId: creator._id,
        imageData: base64Data,
        mimeType,
        imageType: 'upload',
        uploadedAt: new Date(),
      });
      console.log('ProfileImage created:', profileImage._id);

      // Link to creator
      creator.profileImageId = profileImage._id;
      await creator.save();
      console.log('Creator updated with profileImageId:', creator.profileImageId);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: `/api/user/profile-image/${creator._id}`,
    });

  } catch (error) {
    console.error('Upload image error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
}
