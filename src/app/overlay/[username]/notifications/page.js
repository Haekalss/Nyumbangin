'use client'

import { useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { formatRupiah } from '@/utils/format';

// Constants
const NOTIFICATION_DURATION = 8000; // 8 seconds
const POLLING_INTERVAL = 5000; // 5 seconds (reduced from 3s)
const STORAGE_CHECK_INTERVAL = 1000; // 1 second (reduced from 500ms)
const RECENT_NOTIFICATION_THRESHOLD = 2000; // 2 seconds

export default function NotificationsOverlay() {
  const params = useParams();
  const username = params?.username;
  
  // Refs for state management without re-renders
  const isShowingRef = useRef(false);
  const queueRef = useRef([]);
  const lastCheckRef = useRef(new Date().toISOString());
  
  // Refs for timers and DOM elements
  const pollingIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const notificationRef = useRef(null);
  const progressBarRef = useRef(null);
  const messageRef = useRef(null);
  const detailRef = useRef(null);
  const timeRef = useRef(null);
  const progressAnimationFrameRef = useRef(null);
  const progressStartTimeRef = useRef(null);

  // Play notification sound (memoized to prevent recreation)
  const playNotificationSound = useCallback(async () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      // Silent fail for OBS compatibility
      console.warn('Audio notification failed:', error.message);
    }
  }, []);

  // Cleanup function for timers and animations
  const cleanupTimers = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (progressAnimationFrameRef.current) {
      cancelAnimationFrame(progressAnimationFrameRef.current);
      progressAnimationFrameRef.current = null;
    }
  }, []);

  // Animate progress bar with optimized requestAnimationFrame
  const startProgressBar = useCallback(() => {
    if (progressAnimationFrameRef.current) {
      cancelAnimationFrame(progressAnimationFrameRef.current);
    }
    
    // Reset progress bar
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
    
    progressStartTimeRef.current = performance.now();
    
    // Optimized animation loop
    const animate = (currentTime) => {
      // Early exit if ref is null
      if (!progressBarRef.current) {
        progressAnimationFrameRef.current = null;
        return;
      }
      
      const elapsed = currentTime - progressStartTimeRef.current;
      const progress = Math.min((elapsed / NOTIFICATION_DURATION) * 100, 100);
      
      progressBarRef.current.style.width = `${progress}%`;
      
      // Continue only if not complete
      if (progress < 100) {
        progressAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        progressAnimationFrameRef.current = null;
      }
    };
    
    progressAnimationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Display notification (extracted for reuse)
  const displayNotification = useCallback((notificationData) => {
    if (!notificationRef.current) return;
    
    // Update all DOM elements
    notificationRef.current.style.display = 'flex';
    
    if (messageRef.current) {
      messageRef.current.textContent = notificationData.message;
    }
    
    if (detailRef.current && timeRef.current) {
      if (notificationData.detail) {
        detailRef.current.textContent = `Pesan: ${notificationData.detail}`;
        detailRef.current.style.display = 'block';
      } else {
        detailRef.current.style.display = 'none';
      }
      timeRef.current.textContent = notificationData.time;
    }
    
    startProgressBar();
    playNotificationSound();
  }, [startProgressBar, playNotificationSound]);

  // Process queue - using ref pattern to avoid circular dependency
  const processQueue = useCallback(() => {
    if (isShowingRef.current || queueRef.current.length === 0) return;
    
    const [current, ...rest] = queueRef.current;
    queueRef.current = rest;
    isShowingRef.current = true;
    
    displayNotification(current);
    
    // Auto-hide after duration
    hideTimeoutRef.current = setTimeout(() => {
      cleanupTimers();
      
      if (notificationRef.current) {
        notificationRef.current.style.display = 'none';
      }
      isShowingRef.current = false;
      
      // Process next in queue after small delay - call directly from ref
      setTimeout(() => {
        if (!isShowingRef.current && queueRef.current.length > 0) {
          processQueue();
        }
      }, 100);
    }, NOTIFICATION_DURATION);
  }, [displayNotification, cleanupTimers]);

  // Polling function (memoized)
  const checkNewDonations = useCallback(async () => {
    if (!username) return;
    
    try {
      const response = await fetch(
        `/api/overlay/latest-donations?username=${username}&since=${lastCheckRef.current}`,
        { signal: AbortSignal.timeout(5000) } // Add timeout
      );
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.success && data.donations?.length > 0) {
        // Map donations efficiently
        const newDonations = data.donations.reverse().map(donation => ({
          message: `Donasi baru dari ${donation.name} sebesar ${formatRupiah(donation.amount)}`,
          detail: donation.message || '',
          time: new Date(donation.createdAt).toLocaleTimeString('id-ID'),
          timestamp: Date.now(),
          _id: donation._id
        }));
        
        queueRef.current = [...queueRef.current, ...newDonations];
        lastCheckRef.current = data.timestamp;
        
        // Call processQueue after update
        if (!isShowingRef.current) {
          processQueue();
        }
      }
    } catch (error) {
      // Silent fail for network errors
      if (error.name !== 'AbortError') {
        console.error('Polling error:', error);
      }
    }
  }, [username, processQueue]);

  // Start polling on mount
  useEffect(() => {
    if (!username) return;
    
    // Initial check
    checkNewDonations();
    
    // Reduced polling frequency to 5 seconds
    pollingIntervalRef.current = setInterval(checkNewDonations, POLLING_INTERVAL);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [username, checkNewDonations]);

  // Listen for preview notifications (optimized)
  useEffect(() => {
    if (!username) return;

    const showPreviewNotification = (notificationData) => {
      cleanupTimers();
      isShowingRef.current = true;
      displayNotification(notificationData);
      
      // Auto-hide after duration
      hideTimeoutRef.current = setTimeout(() => {
        cleanupTimers();
        if (notificationRef.current) {
          notificationRef.current.style.display = 'none';
        }
        isShowingRef.current = false;
      }, NOTIFICATION_DURATION);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'overlay-notification-trigger' && e.newValue) {
        try {
          const notificationData = JSON.parse(e.newValue);
          showPreviewNotification(notificationData);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Reduced check frequency to 1 second
    const checkForTrigger = () => {
      const triggerData = localStorage.getItem('overlay-notification-trigger');
      if (!triggerData) return;
      
      try {
        const notificationData = JSON.parse(triggerData);
        // Only show if recent
        if (Date.now() - notificationData.timestamp < RECENT_NOTIFICATION_THRESHOLD) {
          showPreviewNotification(notificationData);
        }
      } catch (error) {
        console.error('Error parsing stored notification:', error);
      }
    };
    
    checkForTrigger();
    const checkInterval = setInterval(checkForTrigger, STORAGE_CHECK_INTERVAL);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
      cleanupTimers();
    };
  }, [username, displayNotification, cleanupTimers]);

  if (!username) {
    return null; // Don't render anything if no username
  }

  return (
    <div className="fixed inset-0 font-mono">
      {/* Audio element */}
      <audio
        ref={audioRef}
        preload="auto"
        src="/taco-bell-bong-sfx.mp3"
      />
      
      {/* Notification container (always mounted, display controlled) */}
      <div 
        ref={notificationRef}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ display: 'none' }}
      >
        <div className="bg-[#b8a492] text-[#2d2d2d] px-8 py-6 rounded-xl border-4 border-[#2d2d2d] flex flex-col gap-2 shadow-lg" style={{ minWidth: 400, maxWidth: 600 }}>
          <div ref={messageRef} className="font-bold text-xl font-mono text-center"></div>
          <div ref={detailRef} className="text-base font-mono text-center" style={{ display: 'none' }}></div>
          <div ref={timeRef} className="text-sm opacity-80 font-mono text-center"></div>
          <div className="w-full h-2 bg-[#2d2d2d]/30 rounded mt-3 overflow-hidden">
            <div 
              ref={progressBarRef}
              className="h-2 bg-[#2d2d2d]"
              style={{ width: '0%', transition: 'none', willChange: 'width' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
