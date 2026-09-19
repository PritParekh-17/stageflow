import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "live" | "upnext" | "upcoming" | "completed" | "skipped" | "delay" | "neutral";
  size?: "sm" | "md";
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full tracking-wide select-none";

  const variants = {
    live: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    upnext: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    upcoming: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25",
    completed: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20",
    skipped: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    delay: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-semibold",
    neutral: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
}
