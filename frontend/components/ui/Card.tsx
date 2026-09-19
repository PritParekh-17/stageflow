import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "urgent" | "subtle";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const base = "rounded-xl border transition-all duration-150 overflow-hidden";

  const variants = {
    default: "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-[#1e293b] shadow-sm",
    active: "bg-white dark:bg-[#0f172a] border-emerald-500/50 dark:border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20",
    urgent: "bg-white dark:bg-[#0f172a] border-rose-500/50 dark:border-rose-500/40 shadow-md ring-1 ring-rose-500/20",
    subtle: "bg-slate-50/50 dark:bg-[#0b1120] border-slate-200/80 dark:border-[#1e293b]/80",
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-3.5 border-b border-slate-100 dark:border-[#1e293b] flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 uppercase", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
