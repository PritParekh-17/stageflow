"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Event } from "@/types";
import { Plus, Radio, Calendar, MapPin, ChevronRight, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filtered = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "LIVE") return e.is_live;
    return e.status === filter;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e293b] pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            EVENTS DIRECTORY
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage stage schedules, rosters, and live broadcast states
          </p>
        </div>

        <Link href="/events/new">
          <Button variant="primary" size="md" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create New Event</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["ALL", "LIVE", "UPCOMING", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={event.is_live ? "live" : "neutral"} pulse={event.is_live} size="sm">
                  {event.is_live ? "LIVE NOW" : event.status}
                </Badge>
                <span className="text-[11px] font-mono text-slate-400">
                  {event.timezone}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {event.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span>{event.event_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between gap-2">
              <Link
                href={`/events/${event.id}`}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
              >
                Overview & Agenda
              </Link>

              <Link href={`/events/${event.id}/live`}>
                <Button variant={event.is_live ? "live" : "secondary"} size="sm" className="text-xs">
                  <Radio className="h-3.5 w-3.5 mr-1" />
                  <span>{event.is_live ? "Live Stage" : "Open Stage"}</span>
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
