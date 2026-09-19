"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Event, AgendaItem, Speaker } from "@/types";
import { EventNav } from "@/components/layout/EventNav";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Edit2,
  Trash2,
  User,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";

export default function AgendaManagementPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10) || 1;
  const { success, error: toastError, info } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [duration, setDuration] = useState(30);
  const [itemType, setItemType] = useState("SESSION");
  const [speakerId, setSpeakerId] = useState<number | undefined>(undefined);

  const loadData = async () => {
    try {
      const ev = await api.getEvent(eventId);
      setEvent(ev);
      const ag = await api.getAgenda(eventId);
      setAgenda(ag);
      const sps = await api.getSpeakers(eventId);
      setSpeakers(sps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setStartTime("10:30");
    setEndTime("11:00");
    setDuration(30);
    setItemType("SESSION");
    setSpeakerId(speakers[0]?.id);
    setModalOpen(true);
  };

  const openEditModal = (item: AgendaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setDuration(item.duration_minutes);
    setItemType(item.item_type);
    setSpeakerId(item.speaker_id || undefined);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateAgendaItem(editingItem.id, {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: duration,
          item_type: itemType as any,
          speaker_id: speakerId || null,
        });
        success("Session Updated", title);
      } else {
        await api.createAgendaItem(eventId, {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: duration,
          item_type: itemType as any,
          speaker_id: speakerId || null,
          status: "UPCOMING",
          order_index: agenda.length,
        });
        success("Session Added", title);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toastError("Save Failed", err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number, itemTitle: string) => {
    if (!confirm(`Delete "${itemTitle}"?`)) return;
    try {
      await api.deleteAgendaItem(itemId);
      info("Session Removed", itemTitle);
      await loadData();
    } catch (err: any) {
      toastError("Delete Failed", err.message || String(err));
    }
  };

  const setStatus = async (itemId: number, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(
        `${apiUrl}/agenda/${itemId}/status?status_str=${newStatus}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (res.ok) {
        info("Status Updated", newStatus);
        await loadData();
      } else {
        toastError("Status Update Failed", `HTTP ${res.status}`);
      }
    } catch (err) {
      toastError("Network Error", "Could not reach backend");
    }
  };

  if (loading || !event) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          </div>
          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">Loading agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <EventNav eventId={event.id} eventName={event.name} isLive={event.is_live} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e293b] pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              STAGE TIMELINE & AGENDA FLOW
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence of live sessions, durations, and keynote assignments
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Add Session</span>
          </Button>
        </div>

        {/* Agenda Table/Cards */}
        {agenda.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-500">No sessions yet</p>
            <p className="text-xs text-slate-400">Add your first agenda session to build the stage timeline.</p>
            <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-2">
              <Plus className="h-4 w-4 mr-1" /> Add First Session
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {agenda.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-500 mt-0.5 shrink-0">
                      {idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.start_time} – {item.end_time}
                        </span>
                        {item.original_start_time &&
                          item.original_start_time !== item.start_time && (
                            <span className="text-[10px] text-rose-500 font-mono line-through">
                              Orig: {item.original_start_time}
                            </span>
                          )}
                        <span className="text-[10px] font-mono text-slate-400">
                          ({item.duration_minutes}m)
                        </span>
                        <Badge
                          variant={
                            item.status === "LIVE"
                              ? "live"
                              : item.status === "UP NEXT"
                              ? "upnext"
                              : item.status === "COMPLETED"
                              ? "completed"
                              : item.status === "SKIPPED"
                              ? "skipped"
                              : "upcoming"
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-500 max-w-2xl">{item.description}</p>
                      )}

                      {item.speaker && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 pt-1">
                          <User className="h-3.5 w-3.5" />
                          <span>
                            {item.speaker.name} • {item.speaker.organization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                      {item.status !== "LIVE" && (
                        <button
                          onClick={() => setStatus(item.id, "LIVE")}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          title="Set Live"
                        >
                          Set Live
                        </button>
                      )}
                      {item.status !== "COMPLETED" && (
                        <button
                          onClick={() => setStatus(item.id, "COMPLETED")}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                          title="Mark Completed"
                        >
                          Complete
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Session"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Session Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Stage Session" : "Create Agenda Session"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Session Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mentor Round 2: Pitch Deck Review"
          />

          <Textarea
            label="Brief Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Stage cues or guidelines for participants..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time (HH:MM)"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End Time (HH:MM)"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Session Type
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CEREMONY">Ceremony</option>
                <option value="BRIEFING">Briefing</option>
                <option value="KEYNOTE">Keynote</option>
                <option value="WORKSHOP">Workshop / Sprint</option>
                <option value="BREAK">Break / Meals</option>
                <option value="MENTORING">Mentoring</option>
                <option value="PITCH">Pitching</option>
                <option value="CLOSING">Closing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Assign Speaker
              </label>
              <select
                value={speakerId || ""}
                onChange={(e) =>
                  setSpeakerId(e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Speaker (Emcee/Open)</option>
                {speakers.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.organization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
