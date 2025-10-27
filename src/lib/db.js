// lib/db.js
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('Please define MONGO_URI in your .env.local');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('📦 Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new database connection...');
    const opts = {
      bufferCommands: false,
    };
    
    cached.promise = mongoose.connect(MONGO_URI, opts)
      .then(mongoose => {
        console.log('✅ Database connected successfully to:', MONGO_URI.split('@')[1]?.split('/')[0] || 'MongoDB');
        console.log('📊 Connection state:', mongoose.connection.readyState);
        return mongoose;
      })
      .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error awaiting database promise:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
