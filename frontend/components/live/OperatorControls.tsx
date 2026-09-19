"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, SkipForward, Clock, AlertTriangle, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OperatorControlsProps {
  onStartSession: () => void;
  onEndSession: () => void;
  onSkipSession: () => void;
  onApplyDelay: (minutes: number, reason: string) => void;
  onOpenAI: (tab: string) => void;
  isSessionActive: boolean;
  isLoading?: boolean;
}

export function OperatorControls({
  onStartSession,
  onEndSession,
  onSkipSession,
  onApplyDelay,
  onOpenAI,
  isSessionActive,
  isLoading
}: OperatorControlsProps) {
  const [customDelay, setCustomDelay] = useState<string>("10");
  const [delayReason, setDelayReason] = useState<string>("Speaker running late");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleQuickDelay = (mins: number) => {
    onApplyDelay(mins, mins === 5 ? "Brief Stage Recalibration" : mins === 10 ? "Speaker Running Late" : "Extended Q&A Session");
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>OPERATOR STAGE DECK</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Direct live stage commands and schedule overrides</p>
        </div>

        {/* AI Quick Launch Pills */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => onOpenAI("TRANSITION")}
            className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Transition</span>
          </button>
          <button
            onClick={() => onOpenAI("INTRO")}
            className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Introduce</span>
          </button>
          <button
            onClick={() => onOpenAI("ANNOUNCEMENT")}
            className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Announcement</span>
          </button>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Session Progression Controls */}
        <div className="md:col-span-6 flex flex-wrap items-center gap-2.5">
          {!isSessionActive ? (
            <Button
              variant="live"
              size="md"
              onClick={onStartSession}
              isLoading={isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1.5 fill-current" />
              <span>Start Session</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onEndSession}
              isLoading={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>End & Advance</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={onSkipSession}
            disabled={isLoading}
            className="px-3"
            title="Skip Current Session"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            <span>Skip</span>
          </Button>
        </div>

        {/* Hero Delay Trigger Buttons */}
        <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-[#1e293b]">
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Clock className="h-3.5 w-3.5" />
            <span>DELAY OVERRIDES:</span>
          </span>

          <button
            onClick={() => handleQuickDelay(5)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-mono font-bold text-xs transition-all"
          >
            +5 min
          </button>

          <button
            onClick={() => handleQuickDelay(10)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-mono font-bold text-xs shadow-sm transition-all flex items-center gap-1"
          >
            <span>+10 min</span>
          </button>

          <button
            onClick={() => handleQuickDelay(15)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-mono font-bold text-xs transition-all"
          >
            +15 min
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            disabled={isLoading}
            className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-300 dark:border-slate-700 transition-colors"
            title="Custom Delay Input"
          >
            Custom...
          </button>
        </div>
      </div>

      {/* Custom Delay Inline Modal if triggered */}
      {showCustomModal && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Delay:</span>
            <input
              type="number"
              min="1"
              max="120"
              value={customDelay}
              onChange={(e) => setCustomDelay(e.target.value)}
              className="w-20 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <span className="text-xs text-slate-500">mins</span>
          </div>
          <input
            type="text"
            placeholder="Reason (e.g. VIP speaker flight delay)"
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            className="flex-1 w-full px-3 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onApplyDelay(parseInt(customDelay, 10) || 10, delayReason);
                setShowCustomModal(false);
              }}
            >
              Apply Delay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
