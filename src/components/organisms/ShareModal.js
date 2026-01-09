import React, { useState } from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

const ShareModal = ({ isOpen, onClose, creatorUsername, donationId, onShare }) => {
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Generate donation URL
  const donationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/donate/${creatorUsername}`
    : '';

  // Track share analytics
  const trackShare = async (platform) => {
    try {
      await axios.post('/api/donate/track-share', {
        creatorUsername,
        platform,
        donationId
      });
    } catch (error) {
      console.error('Failed to track share:', error);
      // Don't show error to user, just log it
    }
  };

  // Copy link handler
  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(donationUrl);
      await trackShare('copy');
      toast.success('Link berhasil disalin!');
      
      // Auto close modal and trigger callback
      setTimeout(() => {
        onClose();
        if (onShare) onShare();
      }, 500);
    } catch (error) {
      toast.error('Gagal menyalin link');
    } finally {
      setCopying(false);
    }
  };

  // Share handlers
  const handleWhatsAppShare = async () => {
    setSharing(true);
    const text = `Yuk dukung ${creatorUsername} melalui donasi di Nyumbangin!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + donationUrl)}`;
    await trackShare('whatsapp');
    window.open(whatsappUrl, '_blank');
    setSharing(false);
    toast.success('Membuka WhatsApp...');
    
    // Auto close modal and trigger callback
    setTimeout(() => {
      onClose();
      if (onShare) onShare();
    }, 500);
  };

  const handleTwitterShare = async () => {
    setSharing(true);
    const text = `Yuk dukung ${creatorUsername} melalui Nyumbangin!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(donationUrl)}`;
    await trackShare('twitter');
    window.open(twitterUrl, '_blank');
    setSharing(false);
    toast.success('Membuka Twitter...');
    
    // Auto close modal and trigger callback
    setTimeout(() => {
      onClose();
      if (onShare) onShare();
    }, 500);
  };

  const handleFacebookShare = async () => {
    setSharing(true);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(donationUrl)}`;
    await trackShare('facebook');
    window.open(facebookUrl, '_blank');
    setSharing(false);
    toast.success('Membuka Facebook...');
    
    // Auto close modal and trigger callback
    setTimeout(() => {
      onClose();
      if (onShare) onShare();
    }, 500);
  };

  const handleTelegramShare = async () => {
    setSharing(true);
    const text = `Yuk dukung ${creatorUsername} melalui donasi! 💖`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(donationUrl)}&text=${encodeURIComponent(text)}`;
    await trackShare('telegram');
    window.open(telegramUrl, '_blank');
    setSharing(false);
    toast.success('Membuka Telegram...');
    
    // Auto close modal and trigger callback
    setTimeout(() => {
      onClose();
      if (onShare) onShare();
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 Bagikan Link" maxWidth="max-w-sm">
      <div className="space-y-3">
        {/* Success Message */}
        <p className="text-[#b8a492] font-mono text-xs text-center">
          Bantu sebarkan link donasi <strong>{creatorUsername}</strong>
        </p>

        {/* Share Buttons - Grid 2 kolom */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWhatsAppShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-2 px-3 rounded-lg font-mono text-sm transition-all disabled:opacity-50"
          >
            💬 WhatsApp
          </button>

          <button
            onClick={handleTwitterShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-2 px-3 rounded-lg font-mono text-sm transition-all disabled:opacity-50"
          >
            🐦 Twitter
          </button>

          <button
            onClick={handleFacebookShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white py-2 px-3 rounded-lg font-mono text-sm transition-all disabled:opacity-50"
          >
            👥 Facebook
          </button>

          <button
            onClick={handleTelegramShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white py-2 px-3 rounded-lg font-mono text-sm transition-all disabled:opacity-50"
          >
            ✈️ Telegram
          </button>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          disabled={copying}
          className="w-full flex items-center justify-center gap-2 bg-[#b8a492] hover:bg-[#d6c6b9] text-[#2d2d2d] py-2 px-3 rounded-lg font-bold font-mono text-sm transition-all disabled:opacity-50"
        >
          📋 {copying ? 'Menyalin...' : 'Salin Link'}
        </button>

        {/* URL Display - Compact */}
        <div className="bg-[#2d2d2d] border border-[#b8a492]/30 rounded p-2">
          <p className="text-[#b8a492]/60 font-mono text-xs break-all text-center">
            {donationUrl}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
