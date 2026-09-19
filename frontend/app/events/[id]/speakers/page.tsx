"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Event, Speaker } from "@/types";
import { EventNav } from "@/components/layout/EventNav";
import { useToast } from "@/components/ui/Toast";
import { Plus, Users, Sparkles, Trash2, Edit2, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { AIDrawer } from "@/components/ai/AIDrawer";

export default function SpeakersPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string, 10) || 1;
  const { success, error: toastError, info } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // AI Intro modal
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [selectedSpeakerForAi, setSelectedSpeakerForAi] = useState<Speaker | null>(null);

  const loadData = async () => {
    try {
      const ev = await api.getEvent(eventId);
      setEvent(ev);
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
    setEditingSpeaker(null);
    setName("");
    setDesignation("");
    setOrganization("");
    setBio("");
    setPhotoUrl("");
    setModalOpen(true);
  };

  const openEditModal = (sp: Speaker) => {
    setEditingSpeaker(sp);
    setName(sp.name);
    setDesignation(sp.designation);
    setOrganization(sp.organization);
    setBio(sp.bio || "");
    setPhotoUrl(sp.photo_url || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSpeaker) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
        await fetch(`${apiUrl}/speakers/${editingSpeaker.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, designation, organization, bio, photo_url: photoUrl }),
        });
        success("Speaker Updated", name);
      } else {
        await api.createSpeaker(eventId, {
          name,
          designation,
          organization,
          bio,
          photo_url: photoUrl,
        });
        success("Speaker Added", name);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toastError("Save Failed", err.message || String(err));
    }
  };

  const handleDelete = async (id: number, speakerName: string) => {
    if (!confirm(`Remove "${speakerName}" from speaker roster?`)) return;
    try {
      await api.deleteSpeaker(id);
      info("Speaker Removed", speakerName);
      await loadData();
    } catch (err: any) {
      toastError("Delete Failed", err.message || String(err));
    }
  };

  const triggerIntroAi = (sp: Speaker) => {
    setSelectedSpeakerForAi(sp);
    setAiDrawerOpen(true);
  };

  if (loading || !event) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          </div>
          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">Loading speakers...</p>
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
              KEYNOTE SPEAKERS & GUEST ROSTER
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Speaker profiles, designations, biographies, and AI stage introductions
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-xs">
            <Plus className="h-4 w-4 mr-1" />
            <span>Add Speaker</span>
          </Button>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((sp) => (
            <div
              key={sp.id}
              className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {sp.photo_url ? (
                    <img
                      src={sp.photo_url}
                      alt={sp.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-blue-500/40 shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-lg">
                      {sp.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {sp.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      {sp.designation}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {sp.organization}
                    </p>
                  </div>
                </div>

                {sp.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {sp.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between gap-2">
                <button
                  onClick={() => triggerIntroAi(sp)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Intro Script</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sp)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                    title="Edit Speaker"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sp.id, sp.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                    title="Delete Speaker"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSpeaker ? "Edit Speaker Profile" : "Add Keynote Speaker"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Rajesh Mehta"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Designation"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Dean of Engineering"
            />
            <Input
              label="Organization"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. GTU"
            />
          </div>

          <Input
            label="Photo URL (Optional)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
          />

          <Textarea
            label="Professional Biography"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Key achievements, expertise, credentials..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Intro Drawer */}
      <AIDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        event={event}
        initialTab="INTRO"
      />
    </div>
  );
}
