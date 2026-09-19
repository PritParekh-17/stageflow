"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Event, LiveStageState } from "@/types";
import {
  Radio, Clock, Calendar, Users, ListOrdered,
  AlertTriangle, Sparkles, ArrowRight, Play, CheckCircle2, ChevronRight, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [liveState, setLiveState] = useState<LiveStageState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const evs = await api.getEvents();
        setEvents(evs);
        if (evs.length > 0) {
          const preferred = evs.find((e) => e.is_live) || evs[0];
          api.setActiveEvent(preferred.id);
          const live = await api.getLiveStageState(preferred.id);
          setLiveState(live);
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeEvent = events.find((e) => e.is_live) || events[0];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e293b] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              OPERATIONS COMMAND CENTER
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
              HQ
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stage telemetries, schedules, and active broadcast controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/events/new">
            <Button variant="secondary" size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>New Event</span>
            </Button>
          </Link>

          {activeEvent && (
            <Link href={`/events/${activeEvent.id}/live`}>
              <Button variant="live" size="sm" className="text-xs">
                <Radio className="h-3.5 w-3.5 mr-1 animate-pulse" />
                <span>Open Live Stage Control</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Live Event Banner Card */}
      {activeEvent && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 dark:from-emerald-950/30 dark:via-[#0c1222] dark:to-[#090d16] p-6 shadow-xl text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <Badge variant="live" pulse size="sm">
                  LIVE STAGE ACTIVE
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {activeEvent.venue} • {activeEvent.event_date}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeEvent.name}
              </h2>

              <p className="text-xs text-slate-300 line-clamp-2">
                {activeEvent.description}
              </p>
            </div>

            {/* Quick Metrics & Action */}
            <div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-700/80 lg:pl-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                  Current Segment
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {liveState?.current_session?.title || "Opening Ceremony"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                  Cumulative Delay
                </span>
                <span className="text-sm font-mono font-bold text-rose-400">
                  +{liveState?.total_delay_minutes || 0} min
                </span>
              </div>

              <Link href={`/events/${activeEvent.id}/live`}>
                <Button size="md" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg">
                  <span>Enter Control Room</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Operational 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Today's Timeline & Upcoming */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Schedule Overview */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-blue-500" />
                <span>Today's Stage Timeline</span>
              </h3>
              {activeEvent && (
                <Link
                  href={`/events/${activeEvent.id}/agenda`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Manage Agenda</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="space-y-2">
              {liveState?.agenda?.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#131d33] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.status === "LIVE"
                          ? "live"
                          : item.status === "UP NEXT"
                          ? "upnext"
                          : item.status === "COMPLETED"
                          ? "completed"
                          : "upcoming"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      {item.speaker && (
                        <p className="text-[11px] text-slate-500">
                          {item.speaker.name} ({item.speaker.organization})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-500">
                    <span>{item.start_time} - {item.end_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Station */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={activeEvent ? `/events/${activeEvent.id}/live` : "/events"}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] hover:border-emerald-500/50 shadow-sm transition-all group"
            >
              <Radio className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Stage Controls</h4>
              <p className="text-xs text-slate-500 mt-1">Direct session timers and trigger delay shifts</p>
            </Link>

            <Link
              href={activeEvent ? `/events/${activeEvent.id}/scripts` : "/events"}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] hover:border-indigo-500/50 shadow-sm transition-all group"
            >
              <Sparkles className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Stage Prompts</h4>
              <p className="text-xs text-slate-500 mt-1">Generate intros, bridges, and stage notices</p>
            </Link>

            <Link
              href={activeEvent ? `/events/${activeEvent.id}/speakers` : "/events"}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] hover:border-blue-500/50 shadow-sm transition-all group"
            >
              <Users className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Speaker Roster</h4>
              <p className="text-xs text-slate-500 mt-1">Manage VIP bios, credentials, and stage cues</p>
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Live Audit Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Recent Operations</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">LIVE</span>
            </div>

            <div className="space-y-3">
              {liveState?.recent_activities?.slice(0, 5).map((act) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#131d33] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{act.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
