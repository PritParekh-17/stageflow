"use client";

import React, { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Check, Radio, Bell, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [operatorName, setOperatorName] = useState("Alex Rivera");
  const [operatorEmail, setOperatorEmail] = useState("demo@stageflow.io");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          OPERATOR SETTINGS & PREFERENCES
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure stage control room visual theme, timezone telemetries, and operator profile
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Control Room Theme
          </h2>
          <p className="text-xs text-slate-500">
            Select the visual presentation mode for live confidence monitors and control decks.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === "dark"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Ops Mode</div>
                  <div className="text-[11px] text-slate-500">Backstage production environment</div>
                </div>
              </div>
              {theme === "dark" && <Check className="h-4 w-4 text-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === "light"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Crisp Light Mode</div>
                  <div className="text-[11px] text-slate-500">Daytime operational layout</div>
                </div>
              </div>
              {theme === "light" && <Check className="h-4 w-4 text-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Lead Stage Operator Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Operator Name"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
            <Input
              label="Contact Email"
              value={operatorEmail}
              onChange={(e) => setOperatorEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Timezone Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Regional Telemetry & Timezone
          </h2>

          <div className="max-w-md">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Event Standard Time
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST • UTC+05:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York (EST)">America/New_York (EST • UTC-05:00)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT • UTC+00:00)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Preferences Saved Successfully</span>
            </span>
          )}
          <div className="ml-auto">
            <Button variant="primary" size="md" type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
