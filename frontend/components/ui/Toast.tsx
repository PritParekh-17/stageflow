"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 text-rose-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-[#0d1a12] dark:bg-[#0d1a12] text-emerald-100",
  error: "border-rose-500/30 bg-[#1a0d0d] dark:bg-[#1a0d0d] text-rose-100",
  warning: "border-amber-500/30 bg-[#1a160d] dark:bg-[#1a160d] text-amber-100",
  info: "border-blue-500/30 bg-[#0d1220] dark:bg-[#0d1220] text-blue-100",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = requestAnimationFrame(() => setVisible(true));

    // Auto dismiss
    const duration = toast.duration ?? 4000;
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm min-w-[280px] max-w-sm transition-all duration-300",
        STYLES[toast.type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] opacity-70 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast stack — bottom right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
