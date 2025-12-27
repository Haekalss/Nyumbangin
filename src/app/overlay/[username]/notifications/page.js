'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { formatRupiah } from '@/utils/format';

export default function NotificationsOverlay() {
  const params = useParams();
  const username = params?.username;
  
  const [notif, setNotif] = useState(null);
  const [notifProgress, setNotifProgress] = useState(0);
  const [queue, setQueue] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  
  const lastCheckRef = useRef(new Date().toISOString());
  const pollingIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const progressTimerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

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
    }
  };

  // Polling function to check for new donations
  const checkNewDonations = async () => {
    if (!username) return;
    
    try {
      const response = await fetch(
        `/api/overlay/latest-donations?username=${username}&since=${lastCheckRef.current}`
      );
      const data = await response.json();
      
      if (data.success && data.donations.length > 0) {
        console.log(`📥 Found ${data.donations.length} new donation(s)`);
        
        // Add new donations to queue (reverse to show oldest first)
        const newDonations = data.donations.reverse().map(donation => ({
          message: `Donasi baru dari ${donation.name} sebesar ${formatRupiah(donation.amount)}`,
          detail: donation.message || '',
          time: new Date(donation.createdAt).toLocaleTimeString('id-ID'),
          timestamp: Date.now(),
          _id: donation._id
        }));
        
        setQueue(prev => [...prev, ...newDonations]);
        lastCheckRef.current = data.timestamp;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // Start polling on mount
  useEffect(() => {
    if (!username) return;

    console.log('🔄 Starting polling for donations...');
    
    // Initial check
    checkNewDonations();
    
    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkNewDonations, 3000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log('🛑 Stopped polling');
      }
    };
  }, [username]);

  // Show notification from queue
  useEffect(() => {
    if (!isShowing && queue.length > 0) {
      setIsShowing(true);
      const [current, ...rest] = queue;
      setQueue(rest);
      
      console.log('🎉 Showing notification:', current);
      
      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      setNotif(current);
      setNotifProgress(0);
      
      // Play notification sound
      playNotificationSound();
      
      // Start progress bar animation after a small delay to ensure 0% is rendered
      setTimeout(() => {
        const duration = 5000;
        const interval = 50;
        let elapsed = 0;
        progressTimerRef.current = setInterval(() => {
          elapsed += interval;
          setNotifProgress((elapsed / duration) * 100);
          if (elapsed >= duration) {
            clearInterval(progressTimerRef.current);
          }
        }, interval);
      }, 50);
      
      // After 5 seconds, mark as done
      hideTimeoutRef.current = setTimeout(() => {
        setIsShowing(false);
        setNotif(null);
        setNotifProgress(0);
      }, 5000);
    }
  }, [queue, isShowing]);

  // Listen for localStorage events from dashboard (for preview notifications)
  useEffect(() => {
    if (!username) return;

    const showPreviewNotification = (notificationData) => {
      // Gunakan logika yang sama dengan queue notification
      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      console.log('Preview notification triggered:', notificationData);
      
      // Set states dengan cara yang sama seperti queue notification
      setNotif(notificationData);
      setNotifProgress(0);
      setIsShowing(true);
      
      // Play sound effect for preview too
      playNotificationSound();
      
      // Start progress bar animation after a small delay to ensure 0% is rendered
      setTimeout(() => {
        const duration = 5000;
        const interval = 50;
        let elapsed = 0;
        progressTimerRef.current = setInterval(() => {
          elapsed += interval;
          setNotifProgress((elapsed / duration) * 100);
          if (elapsed >= duration) {
            clearInterval(progressTimerRef.current);
          }
        }, interval);
      }, 50);
      
      // Auto-hide after 5 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setIsShowing(false);
        setNotif(null);
        setNotifProgress(0);
      }, 5000);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'overlay-notification-trigger') {
        try {
          const notificationData = JSON.parse(e.newValue);
          showPreviewNotification(notificationData);
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
            showPreviewNotification(notificationData);
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
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [username]);

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
              <div className="h-2 bg-[#2d2d2d]" style={{ width: `${notifProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
