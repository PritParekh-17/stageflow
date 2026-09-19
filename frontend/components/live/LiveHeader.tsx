"use client";

import React, { useState, useEffect } from "react";
import { WsConnectionStatus } from "@/hooks/useWebSocket";
import { Radio, Wifi, WifiOff, Clock, Maximize2, Minimize2, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveHeaderProps {
  eventName: string;
  isLive: boolean;
  connectionStatus: WsConnectionStatus;
  totalDelayMinutes?: number;
  onEmergencyClick?: () => void;
}

export function LiveHeader({
  eventName,
  isLive,
  connectionStatus,
  totalDelayMinutes = 0,
  onEmergencyClick
}: LiveHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="border-b border-slate-200 dark:border-[#1e293b] bg-slate-900 text-white px-4 sm:px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Event & Live Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE STAGE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>{eventName}</span>
              <span className="text-[11px] text-slate-400 font-normal">| Production Control</span>
            </h1>
          </div>
        </div>

        {/* Center: Delay ticker if delayed */}
        {totalDelayMinutes > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-medium animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Cumulative Schedule Delta: +{totalDelayMinutes} min</span>
          </div>
        )}

        {/* Right: Broadcast Status, Clock, Emergency & Fullscreen */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* WebSocket Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80">
            {connectionStatus === "CONNECTED" ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold uppercase">Realtime Synced</span>
              </>
            ) : connectionStatus === "RECONNECTING" || connectionStatus === "CONNECTING" ? (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-spin"></div>
                <span className="text-amber-300 uppercase">Reconnecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-rose-400 uppercase">Offline</span>
              </>
            )}
          </div>

          {/* Master Operational Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-bold tracking-wider">{currentTime || "--:--:--"}</span>
          </div>

          {/* Emergency Alert Button */}
          {onEmergencyClick && (
            <button
              onClick={onEmergencyClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
              title="Broadcast Emergency Stage Announcement"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-sans font-semibold">Alert</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Control Room Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
