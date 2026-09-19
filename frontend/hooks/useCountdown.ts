"use client";

import { useEffect, useState } from "react";
import { AgendaItem } from "@/types";

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isUrgent: boolean;
  isOvertime: boolean;
  progressPercent: number;
}

export function useCountdown(session?: AgendaItem | null): CountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(1800); // 30 min default

  useEffect(() => {
    if (!session) {
      setRemainingSeconds(0);
      return;
    }

    // Determine target duration
    const durMins = session.duration_minutes || 30;
    const durSecs = durMins * 60;
    setTotalSeconds(durSecs);

    // If actual_start_time exists, calculate accurate elapsed time
    if (session.actual_start_time) {
      const startTime = new Date(session.actual_start_time).getTime();
      const calculateFromStart = () => {
        const now = Date.now();
        const elapsedSecs = Math.floor((now - startTime) / 1000);
        setRemainingSeconds(durSecs - elapsedSecs);
      };
      calculateFromStart();
      const interval = setInterval(calculateFromStart, 1000);
      return () => clearInterval(interval);
    }

    // Fallback based on end_time string "HH:MM"
    if (session.end_time && session.start_time) {
      const parts = session.end_time.split(":");
      const startParts = session.start_time.split(":");
      if (parts.length >= 2 && startParts.length >= 2) {
        const now = new Date();
        const target = new Date();
        target.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);

        const startTarget = new Date();
        startTarget.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

        const calc = () => {
          const currentTime = new Date();
          const diffMs = target.getTime() - currentTime.getTime();
          setRemainingSeconds(Math.floor(diffMs / 1000));
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
      }
    }

    // Default simulation countdown
    setRemainingSeconds(durSecs);
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.id, session?.end_time, session?.start_time, session?.duration_minutes, session?.actual_start_time]);

  const isOvertime = remainingSeconds < 0;
  const absSecs = Math.abs(remainingSeconds);

  const hours = Math.floor(absSecs / 3600);
  const minutes = Math.floor((absSecs % 3600) / 60);
  const seconds = absSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${isOvertime ? "+" : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Urgent if less than 3 minutes (180 seconds) remaining and not yet overtime
  const isUrgent = remainingSeconds <= 180 && remainingSeconds > 0;

  const progress = totalSeconds > 0
    ? Math.min(100, Math.max(0, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)))
    : 0;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    isUrgent,
    isOvertime,
    progressPercent: progress,
  };
}
