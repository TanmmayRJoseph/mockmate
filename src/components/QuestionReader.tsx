"use client";
import { useEffect, useState, useRef } from "react";

export interface QuestionReaderProps {
  questionId: string;
}

export default function QuestionReader({ questionId }: QuestionReaderProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!questionId) return;

    const fetchAudio = async () => {
      try {
        const res = await fetch(`/api/questions/readAloud/${questionId}`, {
          method: "POST",
        });

        if (!res.ok) throw new Error("Failed to fetch audio");
        const data = await res.json();

        // Stop old audio if still playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create new Audio and play automatically
        const newAudio = new Audio(data.audioUrl);
        audioRef.current = newAudio;
        await newAudio.play();

        setAudioUrl(data.audioUrl);
      } catch (err) {
        console.error("Error in QuestionReader:", err);
      }
    };

    fetchAudio();

    return () => {
      // cleanup old audio on unmount or before next play
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [questionId]);

  return null; // ✅ Nothing visible, hidden player
}
