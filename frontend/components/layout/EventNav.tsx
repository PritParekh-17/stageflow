"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, ListOrdered, Users, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventNavProps {
  eventId: number | string;
  eventName: string;
  isLive?: boolean;
}

export function EventNav({ eventId, eventName, isLive }: EventNavProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/events/${eventId}`, icon: LayoutDashboard, exact: true },
    { label: "Live Stage", href: `/events/${eventId}/live`, icon: Radio, isLivePill: true },
    { label: "Agenda", href: `/events/${eventId}/agenda`, icon: ListOrdered },
    { label: "Speakers", href: `/events/${eventId}/speakers`, icon: Users },
    { label: "Scripts & AI", href: `/events/${eventId}/scripts`, icon: FileText },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0c1222]/60 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Event context header */}
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="All Events"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                {eventName}
              </h1>
              {isLive && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE NOW
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Event Operations Command Center</p>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-white dark:bg-[#131d33] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-[#1e293b]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", tab.isLivePill && isActive && "text-emerald-500 animate-pulse")} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
