"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Event, AgendaItem, LiveStageState, DelayResponse } from "@/types";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/components/ui/Toast";
import { LiveHeader } from "@/components/live/LiveHeader";
import { CurrentSessionCard } from "@/components/live/CurrentSessionCard";
import { NextUpCard } from "@/components/live/NextUpCard";
import { OperatorControls } from "@/components/live/OperatorControls";
import { StageTimeline } from "@/components/live/StageTimeline";
import { ActivityFeed } from "@/components/live/ActivityFeed";
import { DelayModal } from "@/components/live/DelayModal";
import { AIDrawer } from "@/components/ai/AIDrawer";
import { EventNav } from "@/components/layout/EventNav";

export default function LiveStageControlPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10) || 1;
  const { success, error, info } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [liveState, setLiveState] = useState<LiveStageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal & Drawer states
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayResponseData, setDelayResponseData] = useState<DelayResponse | null>(null);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInitialTab, setAiInitialTab] = useState("TRANSITION");

  // Fetch initial state
  const loadStageData = useCallback(async () => {
    try {
      const ev = await api.getEvent(eventId);
      setEvent(ev);
      const state = await api.getLiveStageState(eventId);
      setLiveState(state);
    } catch (e) {
      console.error("Failed to load stage state:", e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadStageData();
  }, [loadStageData]);

  // Real-time WebSocket connection
  const handleWsMessage = useCallback(
    (msg: any) => {
      console.log("WebSocket Broadcast Received:", msg);
      if (!msg) return;

      if (
        msg.type === "DELAY_APPLIED" ||
        msg.type === "SESSION_STARTED" ||
        msg.type === "SESSION_ENDED" ||
        msg.type === "SESSION_SKIPPED" ||
        msg.type === "AGENDA_UPDATED" ||
        msg.type === "EVENT_LAUNCHED"
      ) {
        loadStageData();
      }

      // Show live toast notifications for real-time broadcast events
      if (msg.type === "SESSION_STARTED") info("Session Started", msg.data?.session_title);
      if (msg.type === "SESSION_ENDED") success("Session Completed", msg.data?.session_title);
      if (msg.type === "SESSION_SKIPPED") info("Session Skipped", msg.data?.session_title);
      if (msg.type === "DELAY_APPLIED")
        info(`+${msg.data?.delay_minutes}min Delay Applied`, msg.data?.reason);
    },
    [loadStageData, info, success]
  );

  const { status: wsStatus } = useWebSocket({
    eventId,
    onMessage: handleWsMessage,
  });

  // --- OPERATOR ACTIONS ---
  const handleStartSession = async () => {
    setActionLoading(true);
    try {
      await api.startLiveSession(eventId);
      await loadStageData();
      success("Session Started", "Stage is now live");
    } catch (err: any) {
      error("Start Failed", err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndSession = async () => {
    setActionLoading(true);
    try {
      await api.endLiveSession(eventId);
      await loadStageData();
      success("Session Completed", "Stage moved to next session");
    } catch (err: any) {
      error("End Failed", err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipSession = async () => {
    setActionLoading(true);
    try {
      await api.skipLiveSession(eventId);
      await loadStageData();
      info("Session Skipped", "Moved to next item in queue");
    } catch (err: any) {
      error("Skip Failed", err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Autonomous Delay Trigger
  const handleApplyDelay = async (minutes: number, reason: string) => {
    setActionLoading(true);
    try {
      const response = await api.applyDelay(eventId, minutes, reason, true);
      setDelayResponseData(response);
      setDelayModalOpen(true);
      await loadStageData();
    } catch (err: any) {
      error("Delay Engine Error", err.message || String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openAiWithTab = (tab: string) => {
    setAiInitialTab(tab);
    setAiDrawerOpen(true);
  };

  if (loading || !event) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          </div>
          <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
            Linking live stage telemetry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#090d16]">
      {/* Top Tab Navigation inside Event */}
      <EventNav eventId={event.id} eventName={event.name} isLive={true} />

      {/* Production Stage Header */}
      <LiveHeader
        eventName={event.name}
        isLive={true}
        connectionStatus={wsStatus}
        totalDelayMinutes={liveState?.total_delay_minutes || 0}
        onEmergencyClick={() => openAiWithTab("ANNOUNCEMENT")}
      />

      {/* Main Control Room Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Split: Current Focus & Next Up Preview */}
        <div className="space-y-4">
          <CurrentSessionCard
            session={liveState?.current_session}
            onOpenIntroAI={() => openAiWithTab("INTRO")}
          />

          <NextUpCard
            nextSession={liveState?.next_session}
            onOpenTransitionAI={() => openAiWithTab("TRANSITION")}
          />
        </div>

        {/* Operator Deck Controls */}
        <OperatorControls
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          onSkipSession={handleSkipSession}
          onApplyDelay={handleApplyDelay}
          onOpenAI={openAiWithTab}
          isSessionActive={!!liveState?.current_session}
          isLoading={actionLoading}
        />

        {/* Lower Grid: Stage Timeline & Realtime Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StageTimeline
              agenda={liveState?.agenda || []}
              currentSessionId={liveState?.current_session?.id}
            />
          </div>

          <div className="lg:col-span-4">
            <ActivityFeed activities={liveState?.recent_activities || []} />
          </div>
        </div>
      </div>

      {/* Delay Modal with Before/After Timeline Impact & AI Announcement */}
      <DelayModal
        isOpen={delayModalOpen}
        onClose={() => setDelayModalOpen(false)}
        delayData={delayResponseData}
        onRegenerateAnnouncement={async () => {
          if (!delayResponseData) return;
          const fresh = await api.generateAnnouncement(
            eventId,
            "DELAY",
            delayResponseData.reason,
            delayResponseData.delay_minutes
          );
          setDelayResponseData({
            ...delayResponseData,
            suggested_announcement: fresh.content,
          });
        }}
      />

      {/* Contextual AI Stage Script Drawer */}
      <AIDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        event={event}
        currentSession={liveState?.current_session}
        nextSession={liveState?.next_session}
        initialTab={aiInitialTab}
        onScriptSaved={() => loadStageData()}
      />
    </div>
  );
}
