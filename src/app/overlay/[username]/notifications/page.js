'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import { formatRupiah } from '@/utils/format';
import { SOCKET_SERVER_URL } from '@/constants/realtime';

export default function NotificationsOverlay() {
  const params = useParams();
  const username = params?.username;
  
  const [notif, setNotif] = useState(null);
  const [notifProgress, setNotifProgress] = useState(0);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Play notification sound using MP3 file (simplified for OBS compatibility)
  const playNotificationSound = async () => {
    try {
      if (audioRef.current) {
        console.log('Attempting to play notification sound...');
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        
        // Try to play the audio
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Notification sound played successfully');
        }
      }
    } catch (error) {
      console.warn('Audio notification failed (this is normal in OBS):', error.message);
      // Don't try to initialize audio on failure as it won't work in OBS anyway
    }
  };

  useEffect(() => {
    if (!username) return;

    // Connect to socket.io server for realtime notification
    if (!socketRef.current) {
  const socketUrl = SOCKET_SERVER_URL;
        
      socketRef.current = io(socketUrl);
      
      socketRef.current.on('connect', () => {
        console.log('Connected to socket server:', socketUrl);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      socketRef.current.on('new-donation', (data) => {
        console.log('🎉 Received new donation notification:', data);
        
        // Only show notification if donation is for this username
        if (data.ownerUsername && data.ownerUsername !== username) {
          console.log('Donation not for current user, ignoring notification');
          return;
        }
        
        const notifObj = {
          message: `Donasi baru dari ${data.name} sebesar ${formatRupiah(data.amount)}`,
          detail: data.message || '',
          time: new Date(data.createdAt).toLocaleTimeString('id-ID'),
          timestamp: Date.now()
        };
        
        console.log('Setting notification:', notifObj);
        setNotif(notifObj);
        setNotifProgress(0);
        
        // Play notification sound
        playNotificationSound();
      });

    }

    // Listen for localStorage events from dashboard (for preview notifications)
    const handleStorageChange = (e) => {
      if (e.key === 'overlay-notification-trigger') {
        try {
          const notificationData = JSON.parse(e.newValue);
          console.log('Preview notification triggered from dashboard:', notificationData);
          
          setNotif(notificationData);
          setNotifProgress(0);
          
          // Play sound effect for preview too
          playNotificationSound();
        } catch (error) {
          console.error('Error parsing notification data:', error);
        }
      }
    };
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage on mount in case we missed the event
    const checkForTrigger = () => {
      const triggerData = localStorage.getItem('overlay-notification-trigger');
      if (triggerData) {
        try {
          const notificationData = JSON.parse(triggerData);
          // Only show if it's recent (within last 2 seconds)
          if (Date.now() - notificationData.timestamp < 2000) {
            console.log('Found recent notification trigger:', notificationData);
            setNotif(notificationData);
            setNotifProgress(0);
            
            playNotificationSound();
          }
        } catch (error) {
          console.error('Error parsing stored notification data:', error);
        }
      }
    };
    
    // Check immediately and then periodically
    checkForTrigger();
    const checkInterval = setInterval(checkForTrigger, 500);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Cleanup event listeners
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [username]);

  // Auto-hide notification with progress bar
  useEffect(() => {
    if (notif) {
      setNotifProgress(0);
      const duration = 5000; // 5 seconds
      const interval = 50;
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += interval;
        setNotifProgress((elapsed / duration) * 100);
        if (elapsed >= duration) {
          setNotif(null);
          clearInterval(timer);
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [notif]);

  if (!username) {
    return null; // Don't render anything if no username
  }

  return (
    <div className="fixed inset-0 font-mono">
      {/* Audio notification */}
      <audio
        ref={audioRef}
        preload="auto"
        src="/taco-bell-bong-sfx.mp3"
        onLoadedData={() => {
          console.log('Audio loaded successfully');
        }}
        onError={(e) => {
          console.error('Audio loading error:', e);
        }}
      />
      
      {/* Realtime Notification */}
      {notif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-[#b8a492] text-[#2d2d2d] px-8 py-6 rounded-xl border-4 border-[#2d2d2d] flex flex-col gap-2 shadow-lg" style={{ minWidth: 400, maxWidth: 600 }}>
            <div className="font-bold text-xl font-mono text-center">{notif.message}</div>
            {notif.detail && <div className="text-base font-mono text-center">Pesan: {notif.detail}</div>}
            <div className="text-sm opacity-80 font-mono text-center">{notif.time}</div>
            <div className="w-full h-2 bg-[#2d2d2d]/30 rounded mt-3 overflow-hidden">
              <div className="h-2 bg-[#2d2d2d] transition-all duration-50" style={{ width: `${notifProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
