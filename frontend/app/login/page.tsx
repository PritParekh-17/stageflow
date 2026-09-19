"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radio, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      await api.login(email, password);
      window.location.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@stageflow.io");
    setPassword("password123");
    setError("");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md mb-2">
            <Radio className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            StageFlow Control Login
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticate to access event stage control and operations
          </p>
        </div>

        {/* Demo Fast-Fill */}
        <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex items-center justify-between">
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-blue-600 dark:text-blue-400 block">
              Judge / Evaluator Demo Account:
            </span>

            <span className="text-slate-500 dark:text-slate-400">
              demo@stageflow.io / password123
            </span>
          </div>

          <button
            type="button"
            onClick={fillDemo}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            Prefill
          </button>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Operator Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@stageflow.io"
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
              isLoading={isLoading}
            >
              <span>Authenticate & Enter</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          New organizer?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register an account
          </Link>
        </p>
      </div>
    </div>
  );
}
