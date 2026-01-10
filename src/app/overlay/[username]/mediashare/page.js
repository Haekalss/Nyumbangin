"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function MediaShareOverlay() {
  const { username } = useParams();

  const playerRef = useRef(null);
  const ytReadyRef = useRef(false);

  const [currentVideo, setCurrentVideo] = useState(null);
  const isPlayingRef = useRef(false);
  const playedIdsRef = useRef(new Set());

  const pollRef = useRef(null);
  const tickRef = useRef(null);

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (window.YT) return initPlayer();

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = initPlayer;
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

  const onStateChange = (e) => {
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

  const playVideo = async (video) => {
    if (!ytReadyRef.current || isPlayingRef.current) return;

    isPlayingRef.current = true;
    setCurrentVideo(video);
    playedIdsRef.current.add(video._id);
    setRemaining(video.requestedDuration);

    playerRef.current.loadVideoById(video.videoId);

    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: video._id,
        status: "PLAYING",
      });
    } catch {}
  };

  const completeVideo = async () => {
    stopTick();

    if (!currentVideo) return;

    playerRef.current.stopVideo();

    try {
      await axios.put(`/api/mediashare/${username}`, {
        id: currentVideo._id,
        status: "PLAYED",
        actualDuration: currentVideo.requestedDuration,
      });
    } catch {}

    setCurrentVideo(null);
    isPlayingRef.current = false;
    setRemaining(0);
  };

  const fetchQueue = async () => {
    if (isPlayingRef.current) return;

    try {
      const res = await axios.get(`/api/mediashare/${username}`);
      const queue = res.data?.data || [];
      const next = queue.find((v) => !playedIdsRef.current.has(v._id));
      if (next) playVideo(next);
    } catch {}
  };

  useEffect(() => {
    if (!username) return;

    fetchQueue();
    pollRef.current = setInterval(fetchQueue, 5000);

    return () => {
      clearInterval(pollRef.current);
      stopTick();
    };
  }, [username]);

  if (!currentVideo) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
        <div id="yt-player" className="w-full h-full" />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <p className="text-white text-2xl font-bold">{currentVideo.donorName}</p>
          <p className="text-white/80 text-lg">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(currentVideo.amount)}
          </p>

          {currentVideo.message && (
            <p className="text-white/90 mt-2 italic">"{currentVideo.message}"</p>
          )}

          <p className="text-white/50 text-sm mt-2">
            ⏱️ {remaining}s
          </p>
        </div>
      </div>
    </div>
  );
}
