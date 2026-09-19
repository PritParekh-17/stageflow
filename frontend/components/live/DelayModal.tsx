"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DelayResponse } from "@/types";
import { Clock, Check, Copy, Sparkles, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  delayData: DelayResponse | null;
  onSaveAnnouncement?: (text: string) => void;
  onRegenerateAnnouncement?: () => void;
}

export function DelayModal({
  isOpen,
  onClose,
  delayData,
  onSaveAnnouncement,
  onRegenerateAnnouncement
}: DelayModalProps) {
  const [copied, setCopied] = useState(false);
  const [announcementText, setAnnouncementText] = useState(delayData?.suggested_announcement || "");

  React.useEffect(() => {
    if (delayData?.suggested_announcement) {
      setAnnouncementText(delayData.suggested_announcement);
    }
  }, [delayData]);

  if (!delayData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(announcementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`SCHEDULE ADJUSTMENT APPLIED: +${delayData.delay_minutes} MIN`}
      description={`Reason: ${delayData.reason} • ${delayData.affected_sessions.length} upcoming sessions recalculated`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Schedule Impact Comparison Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-rose-500" />
              <span>Timeline Impact (Before vs After)</span>
            </h4>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Stage Synced via WebSocket
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] overflow-hidden bg-slate-50/50 dark:bg-[#0c1222]/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-[#131d33] border-b border-slate-200 dark:border-[#1e293b] text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Session Title</th>
                  <th className="py-2.5 px-3">Original Time</th>
                  <th className="py-2.5 px-3"></th>
                  <th className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">Updated Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-[#1e293b]/60">
                {delayData.affected_sessions.slice(0, 5).map((session) => (
                  <tr key={session.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                      {session.title}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400 line-through">
                      {session.original_start} - {session.original_end}
                    </td>
                    <td className="py-2 px-1 text-slate-400">
                      <ArrowRight className="h-3 w-3" />
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {session.updated_start} - {session.updated_end}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {delayData.affected_sessions.length > 5 && (
            <p className="text-[11px] text-slate-500 mt-1 text-right">
              + {delayData.affected_sessions.length - 5} more sessions automatically shifted
            </p>
          )}
        </div>

        {/* AI Generated Stage Announcement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>AI Anchor Announcement Script</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-500 font-semibold uppercase">
              Ready to Read
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm font-sans rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-[#131d33] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Announcement Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span>Copy for Anchor</span>
                  </>
                )}
              </Button>

              {onRegenerateAnnouncement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateAnnouncement}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Regenerate</span>
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Return to Stage
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
