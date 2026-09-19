"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Check, ArrowRight, ArrowLeft, Radio, Calendar, MapPin, User, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function NewEventWizard() {
  const router = useRouter();
  const { error: toastError, warning } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("Main Auditorium, GTU");
  const [eventDate, setEventDate] = useState("2026-09-20");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Step 2: Agenda items
  const [sessions, setSessions] = useState([
    { title: "Opening Ceremony", start_time: "09:30", end_time: "10:00", duration_minutes: 30, item_type: "CEREMONY" },
    { title: "Technical Briefing", start_time: "10:00", end_time: "10:30", duration_minutes: 30, item_type: "BRIEFING" },
    { title: "Coding Sprint 1", start_time: "10:30", end_time: "13:00", duration_minutes: 150, item_type: "WORKSHOP" },
  ]);

  // Step 3: Speakers
  const [speakers, setSpeakers] = useState([
    { name: "Dr. Rajesh Mehta", designation: "Dean of Engineering", organization: "GTU", bio: "Engineering leader and innovation mentor." },
  ]);

  const addSession = () => {
    setSessions([
      ...sessions,
      { title: "New Session", start_time: "13:00", end_time: "14:00", duration_minutes: 60, item_type: "SESSION" },
    ]);
  };

  const removeSession = (idx: number) => {
    setSessions(sessions.filter((_, i) => i !== idx));
  };

  const addSpeaker = () => {
    setSpeakers([
      ...speakers,
      { name: "New Speaker", designation: "Industry Lead", organization: "Tech Org", bio: "" },
    ]);
  };

  const removeSpeaker = (idx: number) => {
    setSpeakers(speakers.filter((_, i) => i !== idx));
  };

  const handleLaunch = async () => {
    if (!name) {
      warning("Event Name Required", "Please provide a name before continuing");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Event
      const newEvent = await api.createEvent({
        name,
        description,
        venue,
        event_date: eventDate,
        timezone,
        status: "UPCOMING",
      });

      // 2. Add Speakers
      for (const sp of speakers) {
        if (sp.name) {
          await api.createSpeaker(newEvent.id, sp);
        }
      }

      // 3. Add Sessions
      for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i];
        await api.createAgendaItem(newEvent.id, {
          ...s,
          order_index: i,
          status: i === 0 ? "LIVE" : i === 1 ? "UP NEXT" : "UPCOMING",
        } as any);
      }

      // 4. Launch Event
      await api.launchEvent(newEvent.id);

      router.push(`/events/${newEvent.id}/live`);
    } catch (e: any) {
      toastError("Event Creation Failed", e.message || String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
      {/* Wizard Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              EVENT CREATION WIZARD
            </h1>
            <p className="text-xs text-slate-500">Step {currentStep} of 4 • Prepare stage parameters and launch</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, label: "Event Details" },
            { step: 2, label: "Agenda Flow" },
            { step: 3, label: "Speakers" },
            { step: 4, label: "Review & Launch" },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                currentStep === s.step
                  ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : currentStep > s.step
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {currentStep > s.step ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <span className="font-mono text-[10px]">0{s.step}</span>
                )}
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 sm:p-8 shadow-xl">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Event Information
            </h2>

            <Input
              label="Event Name"
              required
              placeholder="e.g. Bit N Build ’26 — State Finals"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Textarea
              label="Description & Context"
              rows={3}
              placeholder="High-level vision, tracks, and audience profile..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Auditorium / Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
              <Input
                label="Date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Initial Stage Agenda
              </h2>
              <Button variant="secondary" size="sm" onClick={addSession} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Session</span>
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131d33] flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full space-y-1">
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) => {
                        const updated = [...sessions];
                        updated[idx].title = e.target.value;
                        setSessions(updated);
                      }}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.start_time}
                      onChange={(e) => {
                        const updated = [...sessions];
                        updated[idx].start_time = e.target.value;
                        setSessions(updated);
                      }}
                      className="w-20 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={s.end_time}
                      onChange={(e) => {
                        const updated = [...sessions];
                        updated[idx].end_time = e.target.value;
                        setSessions(updated);
                      }}
                      className="w-20 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center"
                    />
                  </div>

                  <button
                    onClick={() => removeSession(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Speaker Roster
              </h2>
              <Button variant="secondary" size="sm" onClick={addSpeaker} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span>Add Speaker</span>
              </Button>
            </div>

            <div className="space-y-3">
              {speakers.map((sp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131d33] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Speaker Name"
                      value={sp.name}
                      onChange={(e) => {
                        const updated = [...speakers];
                        updated[idx].name = e.target.value;
                        setSpeakers(updated);
                      }}
                      className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 flex-1 mr-2"
                    />
                    <button
                      onClick={() => removeSpeaker(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Designation"
                      value={sp.designation}
                      onChange={(e) => {
                        const updated = [...speakers];
                        updated[idx].designation = e.target.value;
                        setSpeakers(updated);
                      }}
                      className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      placeholder="Organization"
                      value={sp.organization}
                      onChange={(e) => {
                        const updated = [...speakers];
                        updated[idx].organization = e.target.value;
                        setSpeakers(updated);
                      }}
                      className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              4. Review & Launch Stage
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block">Event:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{name || "Untitled Event"}</span>
              </div>
              <div className="flex gap-6 pt-1">
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Date:</span>
                  <span>{eventDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Venue:</span>
                  <span>{venue}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block">Sessions:</span>
                  <span>{sessions.length} sessions queued</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Launch Confirmation:</span>
              <p className="text-slate-600 dark:text-slate-300">
                Clicking <strong>Launch Event & Open Live Stage</strong> will activate the real-time WebSocket connection, arm the stage countdown clock, and open the backstage control deck.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Previous</span>
            </Button>
          ) : <div></div>}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (currentStep === 1 && !name) {
                  warning("Event Name Required", "Please enter an event name to continue");
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="live"
              size="md"
              onClick={handleLaunch}
              isLoading={isSubmitting}
            >
              <Radio className="h-4 w-4 mr-1.5 animate-pulse" />
              <span>Launch Event & Open Live Stage</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
