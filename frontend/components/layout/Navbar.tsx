"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Sun, Moon, Sparkles, LayoutDashboard, Calendar, Settings, ShieldAlert } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  useEffect(() => {
    setActiveEventId(api.getActiveEventId());
  }, [pathname]);

  const liveHref = activeEventId ? `/events/${activeEventId}/live` : "/events";
  const scriptsHref = activeEventId ? `/events/${activeEventId}/scripts` : "/events";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Live Stage", href: liveHref, icon: Radio, highlight: true },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#1e293b] bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-slate-900 dark:text-white">STAGEFLOW</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Bit N Build ’26 • PS-5</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 dark:bg-[#131d33] text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    item.highlight && "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <Icon className={cn("h-4 w-4", item.highlight && "animate-pulse")} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick AI Trigger button indicator */}
          <Link
            href={scriptsHref}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Prompts</span>
          </Link>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Operator Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-[#1e293b]">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
              AR
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Alex Rivera</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stage Director</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
