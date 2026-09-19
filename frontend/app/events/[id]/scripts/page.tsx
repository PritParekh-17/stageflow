"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Event, Script } from "@/types";
import { EventNav } from "@/components/layout/EventNav";
import { Sparkles, Copy, Check, Trash2, Edit2, Plus, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AIDrawer } from "@/components/ai/AIDrawer";

export default function ScriptsPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10) || 1;

  const [event, setEvent] = useState<Event | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const ev = await api.getEvent(eventId);
      setEvent(ev);
      const scs = await api.getScripts(eventId);
      setScripts(scs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredScripts = scripts.filter((s) => {
    if (filter === "ALL") return true;
    return s.script_type === filter;
  });

  if (loading || !event) {
    return <div className="p-12 text-center font-mono text-sm text-slate-400">Loading stage prompts...</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <EventNav eventId={event.id} eventName={event.name} isLive={event.is_live} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e293b] pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              STAGE SCRIPTS & PROMPTS LIBRARY
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved introductions, bridges, verbal cues, and AI broadcast scripts
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setAiDrawerOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            <span>Generate New Stage Script</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "OPENING", "INTRODUCTION", "TRANSITION", "ANNOUNCEMENT", "CLOSING"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === t
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scripts Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScripts.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
              <Sparkles className="h-8 w-8 text-slate-400 mx-auto opacity-60" />
              <p className="text-xs text-slate-500">No stage scripts saved in this category yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiDrawerOpen(true)}
                className="text-xs mt-2"
              >
                Generate First Script
              </Button>
            </div>
          ) : (
            filteredScripts.map((sc) => (
              <div
                key={sc.id}
                className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      {sc.script_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Tone: {sc.tone}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {sc.title}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                    {sc.content}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(sc.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(sc.id, sc.content)}
                      className="text-xs"
                    >
                      {copiedId === sc.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Generator Drawer */}
      <AIDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        event={event}
        onScriptSaved={() => loadData()}
      />
    </div>
  );
}
