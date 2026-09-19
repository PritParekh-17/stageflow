"use client";

import React from "react";
import { AgendaItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Clock, User, Sparkles } from "lucide-react";

interface NextUpCardProps {
  nextSession?: AgendaItem | null;
  onOpenTransitionAI?: () => void;
}

export function NextUpCard({ nextSession, onOpenTransitionAI }: NextUpCardProps) {
  if (!nextSession) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] p-5 bg-white dark:bg-[#0f172a] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Next Up</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            Final session of the event reached.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Next Up Label & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="upnext" size="sm">
              NEXT UP
            </Badge>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {nextSession.start_time} — {nextSession.end_time} ({nextSession.duration_minutes}m)
            </span>
            {nextSession.original_start_time && nextSession.original_start_time !== nextSession.start_time && (
              <span className="text-[10px] text-rose-500 font-mono line-through">
                Orig: {nextSession.original_start_time}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{nextSession.title}</span>
          </h3>

          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            {nextSession.speaker ? (
              <span>
                Presenter: <strong className="text-slate-800 dark:text-slate-200">{nextSession.speaker.name}</strong> ({nextSession.speaker.organization})
              </span>
            ) : (
              <span>Open Stage Session</span>
            )}
          </div>
        </div>

        {/* Right: Quick Action to Bridge with AI */}
        {onOpenTransitionAI && (
          <button
            onClick={onOpenTransitionAI}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Transition Script</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
