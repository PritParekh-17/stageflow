"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radio,
  ArrowRight,
  ShieldCheck,
  Key,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

function restoreSessionCookie(token: string) {
  if (typeof document === "undefined") return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `stageflow_token=${encodeURIComponent(
      token
    )}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Restore the middleware cookie if the JWT is already
   * present in localStorage.
   *
   * This allows protected routes to remain accessible
   * after reopening the website.
   */
  useEffect(() => {
    const token = localStorage.getItem("stageflow_token");

    if (token) {
      restoreSessionCookie(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      await api.login(email, password);

      /*
       * Force a complete navigation so Next.js middleware
       * sees the newly-created stageflow_token cookie.
       */
      window.location.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#090d16]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Radio className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to your StageFlow operations workspace.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-xl p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                <Input
                  id="email"
                  type="email"
                  placeholder="operator@stageflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Authenticating…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Security */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Secure operator authentication
          </div>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131d33] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-blue-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Demo Access
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use the seeded operator credentials configured for the StageFlow
              demo environment.
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back to StageFlow
          </Link>
        </div>
      </div>
    </div>
  );
}
