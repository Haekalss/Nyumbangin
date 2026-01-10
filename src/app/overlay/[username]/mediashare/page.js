"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function MediaShareOverlay() {
  const params = useParams();
  const username = params.username;
  
  const [currentVideo, setCurrentVideo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const pollRef = useRef(null);
  const playedIdsRef = useRef(new Set());
  const isPlayingRef = useRef(false);

  // Complete video and cleanup
  const completeVideo = async (video) => {
    console.log('✅ COMPLETE:', video._id);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setCurrentVideo(null);
    setTimeRemaining(0);
    
    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: video._id,
        status: 'PLAYED',
        actualDuration: video.requestedDuration
      });
    } catch (e) {
      console.error('API error:', e);
    }
    
    setTimeout(() => {
      isPlayingRef.current = false;
    }, 1500);
  };

  // Play video
  const playVideo = async (video) => {
    if (isPlayingRef.current) return;
    if (playedIdsRef.current.has(video._id)) return;
    
    console.log('🎬 PLAY:', video._id, video.requestedDuration, 'sec');
    
    isPlayingRef.current = true;
    playedIdsRef.current.add(video._id);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setCurrentVideo(video);
    setTimeRemaining(video.requestedDuration);
    
    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: video._id,
        status: 'PLAYING'
      });
    } catch (e) {
      console.error('API error:', e);
    }
    
    countdownRef.current = setInterval(() => {
      setTimeRemaining(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    
    timerRef.current = setTimeout(() => {
      completeVideo(video);
    }, video.requestedDuration * 1000);
  };

  // Fetch queue
  const fetchQueue = async () => {
    if (isPlayingRef.current) return;
    
    try {
      const res = await axios.get(`/api/mediashare/${username}`);
      const queue = res.data.data || [];
      const next = queue.find(v => !playedIdsRef.current.has(v._id));
      
      if (next) playVideo(next);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    if (!username) return;
    
    fetchQueue();
    pollRef.current = setInterval(fetchQueue, 5000);
    
    return () => {
      clearInterval(pollRef.current);
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [username]);

  if (!currentVideo) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto">
        <iframe
          key={currentVideo._id}
          src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <p className="text-white text-2xl font-bold">{currentVideo.donorName}</p>
          <p className="text-white/80 text-lg">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(currentVideo.amount)}
          </p>
          {currentVideo.message && (
            <p className="text-white/90 mt-2 italic">"{currentVideo.message}"</p>
          )}
          <p className="text-white/50 text-sm mt-2">
            ⏱️ {timeRemaining}s
          </p>
        </div>
      </div>
    </div>
  );
}
