import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import FilteredWords from '@/models/FilteredWords';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    // Get filtered words
    try {
      const filteredWords = await FilteredWords.getOrCreate(decoded.userId);
      
      res.json({
        success: true,
        filteredWords: filteredWords.words || []
      });
    } catch (error) {
      console.error('Error fetching filtered words:', error);
      res.status(500).json({ error: 'Server error' });
    }
  } 
  
  else if (req.method === 'PUT') {
    // Update filtered words
    try {
      const { filteredWords: newWords } = req.body;

      if (!Array.isArray(newWords)) {
        return res.status(400).json({ error: 'filteredWords harus berupa array' });
      }

      // Clean dan validate words
      const cleanedWords = newWords
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length > 0 && word.length <= 50) // Max 50 char per word
        .slice(0, 100); // Max 100 words

      // Get or create filtered words document
      let filteredWords = await FilteredWords.getOrCreate(decoded.userId);
      
      // Update words
      filteredWords.words = cleanedWords;
      await filteredWords.save();

      res.json({
        success: true,
        message: 'Filter kata berhasil diperbarui',
        filteredWords: filteredWords.words
      });
    } catch (error) {
      console.error('Error updating filtered words:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
