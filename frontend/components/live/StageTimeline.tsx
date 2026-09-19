"use client";

import React from "react";
import { AgendaItem } from "@/types";
import { Check, Radio, Clock, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface StageTimelineProps {
  agenda: AgendaItem[];
  currentSessionId?: number | null;
  onSelectSession?: (session: AgendaItem) => void;
}

export function StageTimeline({ agenda, currentSessionId, onSelectSession }: StageTimelineProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>LIVE STAGE TIMELINE</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              ({agenda.length} total sessions)
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sequential event flow with live status indicators</p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {agenda.map((item) => {
          const isCurrent = item.status === "LIVE" || item.id === currentSessionId;
          const isCompleted = item.status === "COMPLETED";
          const isNext = item.status === "UP NEXT";
          const isSkipped = item.status === "SKIPPED";

          return (
            <div
              key={item.id}
              onClick={() => onSelectSession && onSelectSession(item)}
              className={cn(
                "relative group rounded-xl p-3.5 border transition-all duration-150 cursor-pointer",
                isCurrent
                  ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30 -ml-1"
                  : isNext
                  ? "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/30"
                  : isCompleted
                  ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75"
                  : "bg-white dark:bg-[#131d33] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Status bullet on vertical rule */}
              <div
                className={cn(
                  "absolute -left-[27px] top-4 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white dark:ring-[#0f172a]",
                  isCurrent
                    ? "bg-emerald-500 text-white animate-pulse"
                    : isCompleted
                    ? "bg-slate-400 dark:bg-slate-600 text-white"
                    : isNext
                    ? "bg-amber-500 text-white"
                    : isSkipped
                    ? "bg-rose-500 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : isCurrent ? (
                  <Radio className="h-2.5 w-2.5" />
                ) : (
                  item.order_index + 1
                )}
              </div>

              {/* Session Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {item.start_time} - {item.end_time}
                    </span>
                    {item.original_start_time && item.original_start_time !== item.start_time && (
                      <span className="text-[10px] text-rose-500 font-mono line-through">
                        Orig: {item.original_start_time}
                      </span>
                    )}
                    <Badge
                      variant={
                        isCurrent
                          ? "live"
                          : isNext
                          ? "upnext"
                          : isCompleted
                          ? "completed"
                          : isSkipped
                          ? "skipped"
                          : "upcoming"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <h4
                    className={cn(
                      "text-sm font-bold",
                      isCurrent
                        ? "text-emerald-600 dark:text-emerald-400 text-base"
                        : "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {item.title}
                  </h4>

                  {item.speaker && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{item.speaker.name} ({item.speaker.organization})</span>
                    </p>
                  )}
                </div>

                <div className="text-right self-start sm:self-center">
                  <span className="text-[11px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    {item.duration_minutes}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
