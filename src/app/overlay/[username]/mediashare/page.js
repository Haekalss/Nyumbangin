"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function MediaShareOverlay() {
  const params = useParams();
  const username = params.username;
  
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch queue
  const fetchQueue = async () => {
    try {
      console.log('🔄 Fetching queue for:', username);
      const res = await axios.get(`/api/mediashare/${username}`);
      const mediaShares = res.data.data || [];
      
      console.log('📊 Queue fetched:', mediaShares.length, 'videos');
      console.log('📹 Current video:', currentVideo ? 'Playing' : 'None');
      
      if (mediaShares.length > 0 && !currentVideo) {
        console.log('▶️ Starting to play first video');
        // Start playing first video
        playNext(mediaShares);
      } else {
        setQueue(mediaShares);
      }
    } catch (err) {
      console.error('❌ Error fetching media share queue:', err);
    }
  };

  // Play next video in queue
  const playNext = async (queueData = queue) => {
    console.log('🎬 playNext called with queue length:', queueData.length);
    
    if (queueData.length === 0) {
      console.log('⏹️ No videos in queue');
      setCurrentVideo(null);
      setIsPlaying(false);
      return;
    }

    const nextVideo = queueData[0];
    console.log('🎥 Playing video:', nextVideo.videoId, 'by', nextVideo.donorName);
    
    setCurrentVideo(nextVideo);
    setIsPlaying(true);

    // Update status to PLAYING
    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: nextVideo._id,
        status: 'PLAYING'
      });
      console.log('✅ Status updated to PLAYING');
    } catch (err) {
      console.error('❌ Error updating video status:', err);
    }

    // Auto-finish after duration
    console.log(`⏱️ Will finish in ${nextVideo.requestedDuration} seconds`);
    setTimeout(() => {
      finishVideo(nextVideo._id, nextVideo.requestedDuration);
    }, nextVideo.requestedDuration * 1000);
  };

  // Mark video as played and play next
  const finishVideo = async (videoId, actualDuration) => {
    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: videoId,
        status: 'PLAYED',
        actualDuration
      });

      setCurrentVideo(null);
      setIsPlaying(false);

      // Fetch new queue and play next
      const res = await axios.get(`/api/mediashare/${username}`);
      const newQueue = res.data.data || [];
      
      if (newQueue.length > 0) {
        setTimeout(() => playNext(newQueue), 2000); // 2s delay between videos
      }
    } catch (err) {
      console.error('Error finishing video:', err);
    }
  };

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch queue periodically
  useEffect(() => {
    if (!username) return;

    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, 10000); // Every 10s

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [username]);

  if (!currentVideo) {
    return (
      <div className="fixed inset-0 bg-transparent" />
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Video Player */}
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto">
        <iframe
          key={currentVideo._id} 
          ref={playerRef}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&start=0&end=${currentVideo.requestedDuration}`}
          title="Media Share"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Donor Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white text-2xl font-bold">{currentVideo.donorName}</p>
              <p className="text-white/80 text-lg">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(currentVideo.amount)}
              </p>
              {currentVideo.message && (
                <p className="text-white/90 text-base mt-2 italic">"{currentVideo.message}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Queue Counter */}
        {queue.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/80 rounded-lg px-4 py-2">
            <p className="text-white text-sm font-bold">
              Selanjutnya: {queue.length - 1} video
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
