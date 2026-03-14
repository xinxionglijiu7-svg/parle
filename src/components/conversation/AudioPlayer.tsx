"use client";

import { useCallback, useRef } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingIdRef = useRef<string | null>(null);

  const play = useCallback(async (text: string, messageId: string) => {
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingIdRef.current === messageId) {
      playingIdRef.current = null;
      return null;
    }

    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return null;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audioRef.current = audio;
      playingIdRef.current = messageId;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        playingIdRef.current = null;
        audioRef.current = null;
      };

      await audio.play();
      return messageId;
    } catch {
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    playingIdRef.current = null;
  }, []);

  return { play, stop, playingIdRef };
}
