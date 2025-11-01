import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const ProfileImage = mongoose.model('ProfileImage', new mongoose.Schema({}, { strict: false }));
    
    // Find all ProfileImages
    const allImages = await ProfileImage.find({});
    console.log(`Found ${allImages.length} ProfileImage documents`);
    
    // Delete invalid ones (those without imageData)
    const deleted = await ProfileImage.deleteMany({ 
      $or: [
        { imageData: { $exists: false } },
        { imageData: '' },
        { imageData: null }
      ]
    });
    
    console.log(`Deleted ${deleted.deletedCount} invalid ProfileImage documents`);
    
    // Show remaining
    const remaining = await ProfileImage.find({});
    console.log(`\nRemaining ProfileImages: ${remaining.length}`);
    remaining.forEach(img => {
      console.log(`- Creator: ${img.creatorId}, Type: ${img.imageType}, HasData: ${!!img.imageData}`);
    });

    console.log('\nCleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
