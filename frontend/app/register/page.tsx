"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.register(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md mb-2">
            <Radio className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Organizer Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up an event control account for StageFlow
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-xl">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
            />

            <Input
              label="Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@stageflow.io"
            />

            <Input
              label="Master Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
              isLoading={isLoading}
            >
              <span>Create Account & Continue</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
