"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function MediaShareOverlay() {
  const { username } = useParams();

  const playerRef = useRef(null);
  const ytReadyRef = useRef(false);

  const currentRef = useRef(null);
  const isPlayingRef = useRef(false);
  const playedIdsRef = useRef(new Set());

  const pollRef = useRef(null);
  const tickRef = useRef(null);

  const [remaining, setRemaining] = useState(0);
  const [, forceRender] = useState(0);
  const [transparentMode, setTransparentMode] = useState(false);

  /* ================= LOAD YT API (OBS SAFE) ================= */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        clearInterval(checkYT);
      }
    }, 300);

    return () => clearInterval(checkYT);
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player("yt-player", {
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => (ytReadyRef.current = true),
        onStateChange: onStateChange,
      },
    });
  };

  /* ================= PLAYER STATE ================= */
  const onStateChange = (e) => {
    if (!currentRef.current) return;

    if (e.data === window.YT.PlayerState.PLAYING) startTick();
    if (
      e.data === window.YT.PlayerState.PAUSED ||
      e.data === window.YT.PlayerState.BUFFERING
    )
      stopTick();
  };

  const startTick = () => {
    if (tickRef.current) return;

    tickRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          completeVideo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTick = () => {
    clearInterval(tickRef.current);
    tickRef.current = null;
  };

  /* ================= PLAY VIDEO ================= */
  const playVideo = async (video) => {
    if (!ytReadyRef.current || isPlayingRef.current) return;

    isPlayingRef.current = true;
    currentRef.current = video;
    playedIdsRef.current.add(video._id);
    setRemaining(video.requestedDuration);
    forceRender((v) => v + 1);

    playerRef.current.loadVideoById(video.videoId);

    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: video._id,
        status: "PLAYING",
      });
    } catch {}
  };

  /* ================= COMPLETE VIDEO ================= */
  const completeVideo = async () => {
    stopTick();

    const video = currentRef.current;
    if (!video) return;

    playerRef.current.stopVideo();

    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: video._id,
        status: "PLAYED",
        actualDuration: video.requestedDuration,
      });
    } catch {}

    currentRef.current = null;
    isPlayingRef.current = false;
    setRemaining(0);
    forceRender((v) => v + 1);
  };

  /* ================= FETCH QUEUE ================= */
  const fetchQueue = async () => {
    if (isPlayingRef.current) return;

    try {
      const res = await axios.get(`/api/mediashare/${username}`);
      const queue = res.data?.data || [];
      const next = queue.find((v) => !playedIdsRef.current.has(v._id));
      if (next) playVideo(next);
    } catch {}
  };

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!username) return;
    // Detect transparent mode via query param `?transparent=1` (for TikTok Studio)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('transparent') === '1' || params.get('tiktok') === '1') {
        setTransparentMode(true);
      }
    } catch (e) {}

    fetchQueue();
    pollRef.current = setInterval(fetchQueue, 5000);

    return () => {
      clearInterval(pollRef.current);
      stopTick();
    };
  }, [username]);

  /* ================= REPLAY LISTENER ================= */
  useEffect(() => {
    if (!username) return;

    const processReplayData = (replayData) => {
      if (!replayData || !replayData.youtubeUrl) return;
      
      // Extract video ID from URL
      const match = replayData.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (match && match[1]) {
        const replayVideo = {
          _id: `replay-${Date.now()}`,
          videoId: match[1],
          donorName: replayData.donorName,
          amount: replayData.amount,
          message: replayData.message || '',
          requestedDuration: replayData.duration || 30,
        };
        
        // Stop current video if playing
        stopTick();
        if (playerRef.current) {
          try { playerRef.current.stopVideo(); } catch {}
        }
        
        // Force play this video
        isPlayingRef.current = false;
        currentRef.current = null;
        playVideo(replayVideo);
      }
    };

    // Poll API for replay trigger (works with OBS)
    const checkAPIReplay = async () => {
      try {
        const res = await fetch(`/api/overlay/replay-trigger?username=${username}&type=mediashare`);
        const data = await res.json();
        if (data.success && data.trigger) {
          processReplayData(data.trigger.data);
        }
      } catch {}
    };

    // Check API every 2 seconds
    const apiCheckInterval = setInterval(checkAPIReplay, 2000);

    // Also listen for localStorage (for browser-based testing)
    const handleStorageChange = (e) => {
      if (e.key === 'mediashare-replay-trigger' && e.newValue) {
        try {
          const replayData = JSON.parse(e.newValue);
          processReplayData(replayData);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check localStorage on mount
    const checkLocalStorage = () => {
      const replayData = localStorage.getItem('mediashare-replay-trigger');
      if (!replayData) return;
      
      try {
        const data = JSON.parse(replayData);
        if (data.timestamp && Date.now() - data.timestamp < 5000) {
          processReplayData(data);
          localStorage.removeItem('mediashare-replay-trigger');
        }
      } catch {}
    };

    checkLocalStorage();
    const localCheckInterval = setInterval(checkLocalStorage, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(apiCheckInterval);
      clearInterval(localCheckInterval);
    };
  }, [username]);

  const video = currentRef.current;
  const visible = Boolean(video);

  /* ================= RENDER (DOM SELALU ADA) ================= */
  return (
    <div
      className={`fixed inset-0 bg-transparent flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full flex justify-center px-6">
        <div style={{ width: 'min(90vw, 880px)' }}>
          <div className={`${transparentMode ? 'bg-transparent border-0' : 'bg-[#e9e9e9] border-4 border-[#b8a492]'} rounded-xl overflow-hidden`}>
            {/* Video area (can be transparent for TikTok Studio) */}
            <div
              className={`${transparentMode ? 'bg-transparent' : 'bg-white'} w-full flex items-center justify-center`}
              style={{ aspectRatio: '16/9', width: '100%' }}
            >
              <div id="yt-player" className="w-full h-full" />
            </div>

          {/* Info area */}
          {video && (
            <div className={`${transparentMode ? 'bg-transparent' : 'bg-[#b8a492]'} p-6 ${transparentMode ? '' : 'border-t-2 border-[#2d2d2d]'} ${transparentMode ? 'text-white' : 'text-[#2d2d2d]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className={`${transparentMode ? 'text-white' : 'text-[#2d2d2d]'} text-2xl font-extrabold font-mono`}>{video.donorName}</p>
                  <p className={`${transparentMode ? 'text-white' : 'text-[#2d2d2d]'} text-lg font-mono mt-1`}>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(video.amount)}
                  </p>
                </div>

                {video.message ? (
                  <div className={`${transparentMode ? 'text-white/80' : 'text-[#2d2d2d]/80'} text-sm md:text-base font-mono`}>
                    <div className="italic">{video.message}</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
