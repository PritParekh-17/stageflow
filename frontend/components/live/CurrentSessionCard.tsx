"use client";

import React from "react";
import { AgendaItem } from "@/types";
import { useCountdown } from "@/hooks/useCountdown";
import { Badge } from "@/components/ui/Badge";
import { Clock, User, Timer, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrentSessionCardProps {
  session?: AgendaItem | null;
  onOpenIntroAI?: () => void;
}

export function CurrentSessionCard({ session, onOpenIntroAI }: CurrentSessionCardProps) {
  const countdown = useCountdown(session);

  if (!session) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#1e293b] p-8 text-center bg-slate-50/50 dark:bg-[#0c1222]/50">
        <Timer className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No Active Session on Stage</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          StageFlow is armed and ready. Select an upcoming session from the operator deck to go live.
        </p>
      </div>
    );
  }

  const isUrgentOrOvertime = countdown.isUrgent || countdown.isOvertime;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl",
        countdown.isOvertime
          ? "border-rose-500/70 bg-gradient-to-b from-rose-950/20 to-transparent ring-2 ring-rose-500/30"
          : countdown.isUrgent
          ? "border-amber-500/70 bg-gradient-to-b from-amber-950/20 to-transparent ring-2 ring-amber-500/30"
          : "border-emerald-500/40 bg-white dark:bg-[#0f172a] ring-1 ring-emerald-500/20"
      )}
    >
      {/* Top Banner */}
      <div className="px-6 py-3.5 border-b border-slate-100 dark:border-[#1e293b] flex items-center justify-between bg-slate-50/70 dark:bg-[#131d33]/80">
        <div className="flex items-center gap-2.5">
          <Badge variant="live" pulse={true} size="md">
            CURRENT STAGE SESSION
          </Badge>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {session.start_time} — {session.end_time} ({session.duration_minutes}m)
          </span>
          {session.original_start_time && session.original_start_time !== session.start_time && (
            <span className="text-[10px] text-rose-500 font-medium line-through">
              Orig: {session.original_start_time}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Phase: {session.item_type}
          </span>
        </div>
      </div>

      {/* Main Center Stage Body */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Title & Speaker details */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {session.title}
              </h2>
              {session.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                  {session.description}
                </p>
              )}
            </div>

            {/* Speaker Card */}
            {session.speaker ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {session.speaker.photo_url ? (
                    <img
                      src={session.speaker.photo_url}
                      alt={session.speaker.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500/50"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-base">
                      {session.speaker.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{session.speaker.name}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
                        Keynote
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {session.speaker.designation} • {session.speaker.organization}
                    </div>
                  </div>
                </div>

                {onOpenIntroAI && (
                  <button
                    onClick={onOpenIntroAI}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/30 transition-colors"
                  >
                    AI Intro Script
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1">
                <User className="h-4 w-4" />
                <span>Auditorium Stage Emcee / General Assembly</span>
              </div>
            )}
          </div>

          {/* Right Column: High-Impact Master Countdown Clock */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 dark:bg-[#090d16] border border-slate-800 text-center shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono tracking-widest uppercase">
              <Clock className={cn("h-4 w-4", countdown.isOvertime ? "text-rose-400 animate-bounce" : countdown.isUrgent ? "text-amber-400 animate-pulse" : "text-emerald-400")} />
              <span className={cn(countdown.isOvertime ? "text-rose-400 font-bold" : countdown.isUrgent ? "text-amber-400 font-bold" : "text-slate-400")}>
                {countdown.isOvertime ? "STAGE OVERTIME" : countdown.isUrgent ? "TIME CRITICAL" : "REMAINING TIME"}
              </span>
            </div>

            {/* Countdown digits */}
            <div
              className={cn(
                "digital-clock font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none py-1 select-none",
                countdown.isOvertime
                  ? "text-rose-500"
                  : countdown.isUrgent
                  ? "text-amber-400 animate-pulse"
                  : "text-emerald-400 dark:text-emerald-300"
              )}
            >
              {countdown.formatted}
            </div>

            {/* Progress indicator */}
            <div className="w-full mt-4 space-y-1.5">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    countdown.isOvertime
                      ? "bg-rose-500"
                      : countdown.isUrgent
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                  )}
                  style={{ width: `${countdown.progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Start {session.start_time}</span>
                <span>{countdown.progressPercent}% elapsed</span>
                <span>End {session.end_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
