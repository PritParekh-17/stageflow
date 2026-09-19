import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return "--:--";
  return timeStr;
}

export function getStatusBadgeClass(status: string) {
  switch (status?.toUpperCase()) {
    case "LIVE":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
    case "UP NEXT":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
    case "COMPLETED":
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    case "SKIPPED":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    case "UPCOMING":
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
  }
}
