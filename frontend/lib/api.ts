import {
  User,
  Event,
  Speaker,
  AgendaItem,
  Script,
  LiveStageState,
  DelayResponse,
  AIGeneratedResponse,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function setSessionCookie(token: string) {
  if (typeof document === "undefined") return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `stageflow_token=${encodeURIComponent(
      token
    )}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;

  document.cookie =
    "stageflow_token=; Path=/; Max-Age=0; SameSite=Lax";

  document.cookie =
    "token=; Path=/; Max-Age=0; SameSite=Lax";
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stageflow_token");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "API Request failed";

    try {
      const err = await res.json();
      errorDetail =
        err.detail ||
        err.message ||
        JSON.stringify(err);
    } catch (_) {
      errorDetail = `${res.status} ${res.statusText}`;
    }

    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // =========================================================
  // AUTH
  // =========================================================

  async login(
    email: string,
    password: string
  ): Promise<{
    access_token: string;
    user: User;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await handleResponse<{
      access_token: string;
      user: User;
    }>(res);

    if (
      typeof window !== "undefined" &&
      data.access_token
    ) {
      localStorage.setItem(
        "stageflow_token",
        data.access_token
      );

      localStorage.setItem(
        "stageflow_user",
        JSON.stringify(data.user)
      );

      setSessionCookie(data.access_token);
    }

    return data;
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{
    access_token: string;
    user: User;
  }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "organizer",
      }),
    });

    const data = await handleResponse<{
      access_token: string;
      user: User;
    }>(res);

    if (
      typeof window !== "undefined" &&
      data.access_token
    ) {
      localStorage.setItem(
        "stageflow_token",
        data.access_token
      );

      localStorage.setItem(
        "stageflow_user",
        JSON.stringify(data.user)
      );

      setSessionCookie(data.access_token);
    }

    return data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stageflow_token");
      localStorage.removeItem("stageflow_user");
      localStorage.removeItem(
        "stageflow_active_event_id"
      );

      clearSessionCookie();

      window.location.replace("/login");
    }
  },

  // =========================================================
  // ACTIVE EVENT
  // =========================================================

  setActiveEvent(eventId: number | string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "stageflow_active_event_id",
        String(eventId)
      );
    }
  },

  getActiveEventId(): number | null {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem(
        "stageflow_active_event_id"
      );

      const id = value ? Number(value) : NaN;

      return Number.isFinite(id) ? id : null;
    }

    return null;
  },

  getStoredUser(): User | null {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem(
        "stageflow_user"
      );

      if (u) {
        try {
          return JSON.parse(u);
        } catch (_) {
          return null;
        }
      }
    }

    return null;
  },

  // =========================================================
  // EVENTS
  // =========================================================

  async getEvents(): Promise<Event[]> {
    const res = await fetch(`${API_BASE}/events`, {
      headers: getAuthHeaders(),
    });

    return handleResponse<Event[]>(res);
  },

  async getEvent(
    id: number | string
  ): Promise<Event> {
    const res = await fetch(
      `${API_BASE}/events/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<Event>(res);
  },

  async createEvent(
    data: Partial<Event>
  ): Promise<Event> {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<Event>(res);
  },

  async updateEvent(
    id: number,
    data: Partial<Event>
  ): Promise<Event> {
    const res = await fetch(
      `${API_BASE}/events/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    return handleResponse<Event>(res);
  },

  async launchEvent(
    id: number
  ): Promise<Event> {
    const res = await fetch(
      `${API_BASE}/events/${id}/launch`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<Event>(res);
  },

  async applyDelay(
    id: number,
    delay_minutes: number,
    reason: string,
    affect_current_session = true
  ): Promise<DelayResponse> {
    const res = await fetch(
      `${API_BASE}/events/${id}/delay`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          delay_minutes,
          reason,
          affect_current_session,
        }),
      }
    );

    return handleResponse<DelayResponse>(res);
  },

  // =========================================================
  // LIVE STAGE
  // =========================================================

  async getLiveStageState(
    id: number | string
  ): Promise<LiveStageState> {
    const res = await fetch(
      `${API_BASE}/events/${id}/live`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<LiveStageState>(res);
  },

  async startLiveSession(
    eventId: number,
    sessionId?: number
  ) {
    const url = sessionId
      ? `${API_BASE}/events/${eventId}/live/start?session_id=${sessionId}`
      : `${API_BASE}/events/${eventId}/live/start`;

    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    return handleResponse(res);
  },

  async endLiveSession(
    eventId: number
  ) {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/live/end`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse(res);
  },

  async skipLiveSession(
    eventId: number,
    sessionId?: number
  ) {
    const url = sessionId
      ? `${API_BASE}/events/${eventId}/live/skip?session_id=${sessionId}`
      : `${API_BASE}/events/${eventId}/live/skip`;

    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    return handleResponse(res);
  },

  // =========================================================
  // AGENDA
  // =========================================================

  async getAgenda(
    eventId: number | string
  ): Promise<AgendaItem[]> {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/agenda`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<AgendaItem[]>(res);
  },

  async createAgendaItem(
    eventId: number,
    item: Partial<AgendaItem>
  ): Promise<AgendaItem> {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/agenda`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      }
    );

    return handleResponse<AgendaItem>(res);
  },

  async updateAgendaItem(
    itemId: number,
    item: Partial<AgendaItem>
  ): Promise<AgendaItem> {
    const res = await fetch(
      `${API_BASE}/agenda/${itemId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      }
    );

    return handleResponse<AgendaItem>(res);
  },

  async deleteAgendaItem(
    itemId: number
  ): Promise<void> {
    const res = await fetch(
      `${API_BASE}/agenda/${itemId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<void>(res);
  },

  // =========================================================
  // SPEAKERS
  // =========================================================

  async getSpeakers(
    eventId: number | string
  ): Promise<Speaker[]> {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/speakers`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<Speaker[]>(res);
  },

  async createSpeaker(
    eventId: number,
    speaker: Partial<Speaker>
  ): Promise<Speaker> {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/speakers`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(speaker),
      }
    );

    return handleResponse<Speaker>(res);
  },

  async deleteSpeaker(
    speakerId: number
  ): Promise<void> {
    const res = await fetch(
      `${API_BASE}/speakers/${speakerId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<void>(res);
  },

  // =========================================================
  // SCRIPTS
  // =========================================================

  async getScripts(
    eventId: number | string,
    scriptType?: string
  ): Promise<Script[]> {
    const url = scriptType
      ? `${API_BASE}/events/${eventId}/scripts?script_type=${scriptType}`
      : `${API_BASE}/events/${eventId}/scripts`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse<Script[]>(res);
  },

  async saveScript(
    eventId: number,
    script: Partial<Script>
  ): Promise<Script> {
    const res = await fetch(
      `${API_BASE}/events/${eventId}/scripts`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(script),
      }
    );

    return handleResponse<Script>(res);
  },

  // =========================================================
  // AI ASSISTANT
  // =========================================================

  async generateOpening(
    eventId: number,
    tone = "Professional",
    notes?: string
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/opening`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          tone,
          custom_notes: notes,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },

  async generateIntroduction(
    eventId: number,
    speakerId: number,
    agendaItemId?: number,
    tone = "Inspiring"
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/introduction`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          speaker_id: speakerId,
          agenda_item_id: agendaItemId,
          tone,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },

  async generateTransition(
    eventId: number,
    currentId: number,
    nextId: number,
    tone = "Smooth & Professional"
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/transition`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          current_agenda_item_id: currentId,
          next_agenda_item_id: nextId,
          tone,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },

  async generateClosing(
    eventId: number,
    sponsorMentions?: string,
    nextSteps?: string,
    tone = "Grand & Memorable"
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/closing`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          sponsor_mentions: sponsorMentions,
          next_steps: nextSteps,
          tone,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },

  async generateAnnouncement(
    eventId: number,
    type: string,
    details?: string,
    delayMinutes?: number,
    tone = "Calm & Authoritative"
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/announcement`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          announcement_type: type,
          details,
          delay_minutes: delayMinutes,
          tone,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },

  async refineScript(
    content: string,
    instruction: string
  ): Promise<AIGeneratedResponse> {
    const res = await fetch(
      `${API_BASE}/ai/refine`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content,
          instruction,
        }),
      }
    );

    return handleResponse<AIGeneratedResponse>(res);
  },
};
