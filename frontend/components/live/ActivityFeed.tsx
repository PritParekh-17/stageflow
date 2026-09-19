"use client";

import React from "react";
import { EventActivity } from "@/types";
import { Activity, Clock, AlertTriangle, Sparkles, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: EventActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "DELAY_APPLIED":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
      case "AI_INTRO_GENERATED":
      case "AI_TRANSITION_GENERATED":
      case "AI_OPENING_GENERATED":
      case "AI_ANNOUNCEMENT_GENERATED":
      case "SCRIPT_SAVED":
        return <Sparkles className="h-3.5 w-3.5 text-indigo-500" />;
      case "SESSION_STARTED":
        return <Play className="h-3.5 w-3.5 text-emerald-500 fill-current" />;
      case "SESSION_ENDED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) {
      return "--:--";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span>REALTIME STAGE ACTIVITY</span>
        </h3>
        <span className="text-[10px] font-mono uppercase text-slate-400">Live Audit Stream</span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No stage activity logged yet</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#131d33] transition-colors"
            >
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 mt-0.5">
                {getActionIcon(act.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {formatTimestamp(act.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {act.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
