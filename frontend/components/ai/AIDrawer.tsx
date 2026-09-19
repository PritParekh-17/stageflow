"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Event, AgendaItem, Speaker, AIGeneratedResponse } from "@/types";
import { Sparkles, Copy, Check, RefreshCw, BookmarkCheck, ArrowRight, Wand2, Volume2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  currentSession?: AgendaItem | null;
  nextSession?: AgendaItem | null;
  initialTab?: string;
  onScriptSaved?: () => void;
}

export function AIDrawer({
  isOpen,
  onClose,
  event,
  currentSession,
  nextSession,
  initialTab = "TRANSITION",
  onScriptSaved
}: AIDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number>(event.speakers?.[0]?.id || 1);
  const [announcementType, setAnnouncementType] = useState<string>("DELAY");
  const [tone, setTone] = useState<string>("Professional");
  const [announcementDetails, setAnnouncementDetails] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AIGeneratedResponse | null>(null);
  const [scriptContent, setScriptContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { error: toastError } = useToast();

  React.useEffect(() => {
    setActiveTab(initialTab);
    setGeneratedResult(null);
    setScriptContent("");
  }, [initialTab, isOpen]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSaved(false);
    try {
      let result: AIGeneratedResponse;

      if (activeTab === "TRANSITION") {
        const currId = currentSession?.id || event.agenda_items?.[1]?.id || 1;
        const nxtId = nextSession?.id || event.agenda_items?.[2]?.id || 2;
        result = await api.generateTransition(event.id, currId, nxtId, tone);
      } else if (activeTab === "INTRO") {
        const spId = selectedSpeakerId || event.speakers?.[0]?.id || 1;
        const agId = currentSession?.id || event.agenda_items?.[1]?.id;
        result = await api.generateIntroduction(event.id, spId, agId, tone);
      } else if (activeTab === "OPENING") {
        result = await api.generateOpening(event.id, tone, customNotes);
      } else if (activeTab === "CLOSING") {
        result = await api.generateClosing(event.id, "Google Cloud, GTU & BitSpace", "Submit final GitHub repos", tone);
      } else {
        // ANNOUNCEMENT
        result = await api.generateAnnouncement(event.id, announcementType, announcementDetails, 10, tone);
      }

      setGeneratedResult(result);
      setScriptContent(result.content);
    } catch (e: any) {
      toastError("AI Generation failed", e.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!scriptContent) return;
    setIsLoading(true);
    try {
      const refined = await api.refineScript(scriptContent, instruction);
      setScriptContent(refined.content);
    } catch (e: any) {
      toastError("Refinement failed", e.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!scriptContent || !generatedResult) return;
    try {
      await api.saveScript(event.id, {
        title: generatedResult.title,
        content: scriptContent,
        script_type: generatedResult.script_type as any,
        tone: generatedResult.tone,
        agenda_item_id: currentSession?.id
      });
      setSaved(true);
      if (onScriptSaved) onScriptSaved();
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      toastError("Failed to save script", e.message || String(e));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI STAGE SCRIPT ASSISTANT"
      description="Context-aware verbal scripts, transitions, and announcements for stage emcees"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#1e293b] pb-2 overflow-x-auto">
          {[
            { id: "TRANSITION", label: "Stage Transition" },
            { id: "INTRO", label: "Speaker Intro" },
            { id: "ANNOUNCEMENT", label: "Live Notice" },
            { id: "OPENING", label: "Opening Ceremony" },
            { id: "CLOSING", label: "Event Closing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setGeneratedResult(null);
                setScriptContent("");
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Context Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200 dark:border-[#1e293b] text-xs">
          {activeTab === "TRANSITION" && (
            <>
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">From Current:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentSession?.title || "Opening Ceremony"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">Into Next:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {nextSession?.title || "Problem Statement Briefing"}
                </p>
              </div>
            </>
          )}

          {activeTab === "INTRO" && (
            <>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">Select Speaker:</span>
                <select
                  value={selectedSpeakerId}
                  onChange={(e) => setSelectedSpeakerId(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                >
                  {event.speakers?.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} — {sp.designation} ({sp.organization})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === "ANNOUNCEMENT" && (
            <>
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">Notice Category:</span>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="DELAY">Schedule Delay (+10 min)</option>
                  <option value="TECHNICAL">Technical / AV Calibration</option>
                  <option value="BREAK">Break & Refreshments</option>
                  <option value="EMERGENCY">Emergency / Priority Evac</option>
                </select>
              </div>
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">Specific Context:</span>
                <input
                  type="text"
                  placeholder="e.g. Wi-Fi SSID, Speaker arriving..."
                  value={announcementDetails}
                  onChange={(e) => setAnnouncementDetails(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2 flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Tone:</span>
              {["Professional", "Inspiring", "High Energy", "Formal"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                    tone === t
                      ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              isLoading={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs"
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              <span>Generate Script</span>
            </Button>
          </div>
        </div>

        {/* Script Output & Refinements */}
        {scriptContent ? (
          <div className="space-y-3">
            {/* Script card */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-[#131d33] p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    {generatedResult?.title || "Verbatim Stage Prompt"}
                  </span>
                </div>
                {generatedResult?.estimated_reading_time_seconds && (
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{generatedResult.estimated_reading_time_seconds}s spoken
                  </span>
                )}
              </div>

              {/* Editable Textarea for Emcee */}
              <textarea
                rows={6}
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                className="w-full text-sm font-sans bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none leading-relaxed resize-none"
              />

              {/* Talking Points Snippet */}
              {generatedResult?.talking_points && generatedResult.talking_points.length > 0 && (
                <div className="border-t border-indigo-500/20 pt-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
                    Key Emcee Anchor Bullets:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                    {generatedResult.talking_points.map((tp, idx) => (
                      <li key={idx}>{tp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Modifiers / Refine Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-mono">REWRITE:</span>
                <button
                  onClick={() => handleRefine("shorten")}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Shorten
                </button>
                <button
                  onClick={() => handleRefine("formal")}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Make Formal
                </button>
                <button
                  onClick={() => handleRefine("energetic")}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  High Energy
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  title="Regenerate"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                </button>
              </div>

              {/* Action Buttons: Copy & Save */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>Copy Script</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5 mr-1" />
                      <span>Saved to Library</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5 mr-1" />
                      <span>Save to Stage Library</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-2 opacity-70" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure parameters above and click <strong>Generate Script</strong> to produce real-time stage copy with stage directions.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
