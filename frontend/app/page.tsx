"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function restoreSessionCookie(token: string) {
  if (typeof document === "undefined") return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `stageflow_token=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
}

export default function LandingPage() {
  useEffect(() => {
    const token = localStorage.getItem("stageflow_token");

    if (token) {
      restoreSessionCookie(token);
      window.location.replace("/dashboard");
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-slate-200 dark:border-[#1e293b] bg-gradient-to-b from-slate-50 via-white to-slate-100/50 dark:from-[#090d16] dark:via-[#0c1222] dark:to-[#090d16]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Bit N Build ’26 • Gujarat Round • PS-5</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Run the stage. <br className="hidden sm:inline" />
            <span className="text-blue-600 dark:text-blue-400">
              Not the chaos.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            StageFlow gives anchors and organizers a real-time command center
            for schedules, speakers, transitions, delays, and AI-assisted
            stage communication.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 px-6"
              >
                <span>Open StageFlow</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/events">
              <Button
                variant="outline"
                size="lg"
                className="px-6 border-slate-300 dark:border-slate-700"
              >
                <Radio className="h-4 w-4 mr-2 text-emerald-500 animate-pulse" />
                <span>Launch Live Stage</span>
              </Button>
            </Link>
          </div>

          {/* REALISTIC LIVE DASHBOARD HERO MOCKUP */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-300/80 dark:border-[#1e293b] bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-xl p-3 sm:p-5 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 text-left">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b] mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>

                  <span className="ml-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    STAGEFLOW COMMAND ROOM — Bit N Build ’26
                  </span>
                </div>

                <Badge variant="live" pulse size="sm">
                  LIVE BROADCAST
                </Badge>
              </div>

              {/* Realistic Control Room Layout Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Current session mockup */}
                <div className="md:col-span-8 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ● Active Live Session
                    </span>

                    <span className="text-xs font-mono text-slate-500">
                      09:30 — 10:00 (30m)
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Opening Ceremony & Dignitary Welcome
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Keynote Speaker: Dr. Rajesh Mehta • Dean of Engineering,
                    GTU
                  </p>

                  <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-slate-900 text-white">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                      Master Countdown
                    </span>

                    <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                      00:17:42
                    </span>
                  </div>
                </div>

                {/* Next up mockup */}
                <div className="md:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50/70 dark:bg-[#131d33] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-500">
                      Next Up (In 17m)
                    </span>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      Problem Statement Briefing
                    </h4>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Vikram Patel • Innovation Hub
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Transition Generated</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
            The Reality of Live Stages
          </h2>

          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Live events break. Paper agendas fail.
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            When a keynote runs 10 minutes over, coordinators scramble on
            WhatsApp, anchors improvise blindly, and timelines desync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Cascading Schedule Drift
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              One delayed speaker pushes the entire morning back. Organizers
              manually recalculate lunch breaks, sponsor slots, and jury
              briefings on the fly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Anchor Disconnection
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anchors hold printed schedules that are obsolete within two
              hours. They don’t know who arrived backstage or how much time is
              truly left.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
              <RefreshCw className="h-5 w-5" />
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Desynced Backstage Teams
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              AV engineers, timekeepers, emcees, and student volunteers
              operate on disconnected assumptions without a single source of
              truth.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW STAGEFLOW WORKS */}
      <section className="py-20 border-y border-slate-200 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0c1222]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
              The StageFlow Solution
            </h2>

            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              From preparation to live execution in one flow.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            {[
              {
                step: "01",
                title: "Build Agenda",
                desc: "Define sessions, set durations, and link keynote speakers.",
              },
              {
                step: "02",
                title: "Launch Control Room",
                desc: "Open the real-time stage deck on tablet, laptop, or confidence monitor.",
              },
              {
                step: "03",
                title: "Autonomous Delay Shift",
                desc: "Hit +10 min: future sessions recalculate automatically with zero refresh.",
              },
              {
                step: "04",
                title: "AI Stage Scripts",
                desc: "Generate transitions, speaker intros, and emergency announcements instantly.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] shadow-sm space-y-2"
              >
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  STEP {s.step}
                </span>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC DELAY HANDLING DEMO SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <span>Hero Feature</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              One-click delay engine. <br />
              <span className="text-rose-500">
                Autonomous schedule shift.
              </span>
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When an unexpected delay happens, don’t redo your spreadsheet.
              Click <strong>+10 min</strong>. StageFlow instantly recalculates
              all downstream sessions, updates connected tablets via WebSockets,
              and writes an AI announcement for the emcee.
            </p>

            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  Non-destructive shifting (preserves original times for
                  comparison)
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  Instant WebSocket broadcast across backstage and stage
                  podiums
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  Contextual anchor announcement ready in one click
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/events">
                <Button variant="danger" size="md">
                  <span>Try +10 Min Delay Demo</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-[#0f172a] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <span className="text-xs font-mono font-bold text-rose-500 uppercase">
                  SCHEDULE DELAY ENGINE
                </span>

                <span className="text-xs font-mono text-emerald-500 font-semibold">
                  +10 Minutes Applied
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Hackathon Begins
                  </span>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through">
                      10:30
                    </span>

                    <ArrowRight className="h-3 w-3 text-slate-400" />

                    <span className="text-emerald-500 font-bold">
                      10:40
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Lunch Break
                  </span>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through">
                      13:00
                    </span>

                    <ArrowRight className="h-3 w-3 text-slate-400" />

                    <span className="text-emerald-500 font-bold">
                      13:10
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Mentor Round 1
                  </span>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through">
                      14:00
                    </span>

                    <ArrowRight className="h-3 w-3 text-slate-400" />

                    <span className="text-emerald-500 font-bold">
                      14:10
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-indigo-500 block mb-1">
                  AI Announcement Output:
                </span>

                <p className="text-slate-700 dark:text-slate-300 italic">
                  "Ladies and gentlemen, to ensure all teams receive optimal
                  technical briefings, our schedule has shifted by 10
                  minutes..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-20 border-t border-slate-200 dark:border-[#1e293b] bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to operate the stage with absolute confidence?
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience the full Bit N Build ’26 demo workflow with seeded
            data, live countdowns, and real-time synchronization.
          </p>

          <div className="pt-2">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 shadow-xl"
              >
                <span>Enter Operations Dashboard</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-300">STAGEFLOW</span>
            <span>• Bit N Build ’26 (Gujarat Round)</span>
          </div>

          <p>
            Problem Statement PS-5: Smart Anchor & Stage Flow Management
            System
          </p>
        </div>
      </footer>
    </div>
  );
}
