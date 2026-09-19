"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Event } from "@/types";
import { EventNav } from "@/components/layout/EventNav";
import { Radio, Calendar, MapPin, Clock, Users, ListOrdered, Sparkles, ArrowRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function EventOverviewPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await api.getEvent(eventId);
        setEvent(data);
        api.setActiveEvent(data.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 font-mono text-sm">
        Loading event telemetries...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <EventNav eventId={event.id} eventName={event.name} isLive={event.is_live} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Event Banner */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={event.is_live ? "live" : "neutral"} pulse={event.is_live} size="md">
                  {event.is_live ? "STAGE LIVE" : event.status}
                </Badge>
                <span className="text-xs font-mono text-slate-500">{event.timezone}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {event.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                {event.description}
              </p>
            </div>

            <div>
              <Link href={`/events/${event.id}/live`}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg">
                  <Radio className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Launch Live Control Room</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{event.event_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-indigo-500" />
              <span>{event.agenda_items?.length || 0} Sessions Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              <span>{event.speakers?.length || 0} Dignitaries & Speakers</span>
            </div>
          </div>
        </div>

        {/* 2-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Agenda preview */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Stage Agenda Timeline
              </h3>
              <Link
                href={`/events/${event.id}/agenda`}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit Timeline
              </Link>
            </div>

            <div className="space-y-2">
              {event.agenda_items?.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#131d33] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 w-24">
                      {item.start_time} - {item.end_time}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                  </div>
                  <Badge variant={item.status === "LIVE" ? "live" : "neutral"} size="sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Speakers preview */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Keynote Speakers
              </h3>
              <Link
                href={`/events/${event.id}/speakers`}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {event.speakers?.map((sp) => (
                <div key={sp.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-[#131d33]">
                  {sp.photo_url ? (
                    <img src={sp.photo_url} alt={sp.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                      {sp.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{sp.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{sp.designation} • {sp.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
