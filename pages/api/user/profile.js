import dbConnect from '../../../src/lib/db';
import Creator from '../../../src/models/Creator';
import ProfileImage from '../../../src/models/ProfileImage';
import { verifyToken } from '../../../src/lib/jwt';

export default async function handler(req, res) {
  if (!['PUT','GET'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    if (req.method === 'GET') {
      const creator = await Creator.findById(decoded.id || decoded.userId)
        .select('-password')
        .populate('profileImageId'); // Populate profile image
        
      if (!creator) return res.status(404).json({ message: 'Creator tidak ditemukan' });
      
      // Convert to object to include virtuals
      const creatorObj = creator.toObject();
      
      // Add profileImage URL from API endpoint
      if (creator.profileImageId) {
        creatorObj.profileImage = `/api/user/profile-image/${creator._id}`;
      }
      
      // Add isPayoutReady status
      creatorObj.isPayoutReady = creator.hasCompletePayoutSettings();
      
      console.log('Profile GET - Payout data:', {
        payoutSettings: creator.payoutSettings,
        payoutBankName: creatorObj.payoutBankName,
        payoutAccountNumber: creatorObj.payoutAccountNumber,
        payoutAccountHolder: creatorObj.payoutAccountHolder,
        profileImage: creatorObj.profileImage,
        socialLinks: creatorObj.socialLinks,
        isPayoutReady: creatorObj.isPayoutReady
      });
      
      return res.status(200).json({ success: true, user: creatorObj });
    }

    const { 
      displayName, 
      username, 
      bio,
      profileImageUrl,
      socialLinks,
      payoutBankName, 
      payoutAccountNumber, 
      payoutAccountHolder 
    } = req.body;

    // Validate input
    if (!displayName) {
      return res.status(400).json({ message: 'Nama tampilan harus diisi' });
    }

    // Username validation - optional but must be unique if provided
    if (username && username.trim() !== '') {
      // Validate format
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ message: 'Username hanya boleh berisi huruf, angka, underscore, dan dash' });
      }
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: 'Username harus 3-30 karakter' });
      }
    }

    // Ambil creator dulu agar bisa cek apakah payout sudah terkunci
    const currentCreator = await Creator.findById(decoded.id || decoded.userId);
    if (!currentCreator) return res.status(404).json({ message: 'Creator tidak ditemukan' });

    console.log('Profile UPDATE - Request body:', { 
      displayName, 
      username, 
      bio, 
      socialLinks,
      payoutBankName, 
      payoutAccountNumber, 
      payoutAccountHolder 
    });

    // Check if payout is already locked
    const payoutAlreadySet = currentCreator.hasCompletePayoutSettings();

    // If payout locked, username cannot be changed
    if (payoutAlreadySet && username && username.toLowerCase() !== currentCreator.username) {
      return res.status(400).json({ 
        message: 'Username tidak dapat diubah setelah data payout diisi. Hubungi support jika perlu perubahan.' 
      });
    }

    // Check if username already exists (except current creator)
    if (username && username.toLowerCase() !== currentCreator.username) {
      const existingCreator = await Creator.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: decoded.id || decoded.userId }
      });

      if (existingCreator) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
    }

    // Update basic fields
    currentCreator.displayName = displayName;
    
    // Update username only if provided and not empty
    if (username && username.trim() !== '') {
      currentCreator.username = username.toLowerCase();
    }
    
    if (bio !== undefined) currentCreator.bio = bio;
    
    // Update social links if provided
    if (socialLinks) {
      currentCreator.socialLinks = {
        twitch: socialLinks.twitch || '',
        youtube: socialLinks.youtube || '',
        instagram: socialLinks.instagram || '',
        tiktok: socialLinks.tiktok || '',
        twitter: socialLinks.twitter || ''
      };
    }
    
    // Note: profileImageUrl is now handled separately via /api/user/upload-image
    // We don't update it here to avoid conflicts

    // Payout settings update logic
    if (payoutAlreadySet) {
      // Jika creator mencoba mengubah payout fields setelah terkunci
      const tryingToChange = (
        (payoutBankName && payoutBankName !== currentCreator.payoutSettings.bankName) ||
        (payoutAccountNumber && payoutAccountNumber !== currentCreator.payoutSettings.accountNumber) ||
        (payoutAccountHolder && payoutAccountHolder !== currentCreator.payoutSettings.accountName)
      );
      if (tryingToChange) {
        return res.status(400).json({ message: 'Data rekening sudah dikunci dan tidak bisa diubah. Hubungi support jika perlu perubahan.' });
      }
      // Jika ada request kosong, abaikan (jangan mengosongkan)
    } else {
      // Pertama kali set (hanya kalau ada isi minimal nomor & holder)
      if (payoutAccountNumber && payoutAccountHolder) {
        // Validasi nomor rekening hanya angka
        if (!/^\d+$/.test(payoutAccountNumber)) {
          return res.status(400).json({ message: 'Nomor rekening hanya boleh berisi angka' });
        }
        currentCreator.payoutSettings.bankName = payoutBankName || '';
        currentCreator.payoutSettings.accountNumber = payoutAccountNumber;
        currentCreator.payoutSettings.accountName = payoutAccountHolder;
      } else if (payoutBankName || payoutAccountNumber || payoutAccountHolder) {
        // Partial fill not allowed
        return res.status(400).json({ message: 'Lengkapi semua field rekening (Bank/Channel, Nomor, Nama Pemilik) sekaligus.' });
      }
    }

    await currentCreator.save();
    
    // Populate profile image before returning
    await currentCreator.populate('profileImageId');
    
    const sanitized = currentCreator.toObject();
    delete sanitized.password;
    
    // Add profileImage URL from API endpoint
    if (currentCreator.profileImageId) {
      sanitized.profileImage = `/api/user/profile-image/${currentCreator._id}`;
    }
    
    // Add isPayoutReady status
    sanitized.isPayoutReady = currentCreator.hasCompletePayoutSettings();
    
    console.log('Profile UPDATE - Complete data:', {
      payoutSettings: currentCreator.payoutSettings,
      payoutBankName: sanitized.payoutBankName,
      payoutAccountNumber: sanitized.payoutAccountNumber,
      payoutAccountHolder: sanitized.payoutAccountHolder,
      profileImage: sanitized.profileImage,
      socialLinks: sanitized.socialLinks,
      bio: sanitized.bio,
      isPayoutReady: sanitized.isPayoutReady
    });

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate',
      user: sanitized
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
