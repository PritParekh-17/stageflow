export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Speaker {
  id: number;
  event_id: number;
  name: string;
  designation: string;
  organization: string;
  bio?: string;
  photo_url?: string;
  created_at: string;
}

export interface AgendaItem {
  id: number;
  event_id: number;
  speaker_id?: number | null;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  original_start_time?: string;
  original_end_time?: string;
  duration_minutes: number;
  item_type: "SESSION" | "CEREMONY" | "BRIEFING" | "KEYNOTE" | "WORKSHOP" | "BREAK" | "MENTORING" | "PITCH" | "CLOSING";
  status: "UPCOMING" | "LIVE" | "UP NEXT" | "COMPLETED" | "SKIPPED";
  order_index: number;
  speaker?: Speaker;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: number;
  event_id: number;
  agenda_item_id?: number | null;
  script_type: "OPENING" | "INTRODUCTION" | "TRANSITION" | "CLOSING" | "ANNOUNCEMENT" | "REFINED";
  title: string;
  content: string;
  tone: string;
  generated_by_ai: boolean;
  created_at: string;
}

export interface ScheduleChange {
  id: number;
  event_id: number;
  agenda_item_id?: number;
  reason: string;
  delay_minutes: number;
  affected_sessions_count: number;
  created_at: string;
}

export interface EventActivity {
  id: number;
  event_id: number;
  action: string;
  title: string;
  description: string;
  metadata_json?: string;
  created_at: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  venue: string;
  event_date: string;
  timezone: string;
  status: "DRAFT" | "UPCOMING" | "LIVE" | "COMPLETED";
  is_live: boolean;
  current_agenda_item_id?: number | null;
  created_by?: number;
  created_at: string;
  updated_at: string;
  speakers?: Speaker[];
  agenda_items?: AgendaItem[];
  scripts?: Script[];
  schedule_changes?: ScheduleChange[];
  activities?: EventActivity[];
}

export interface LiveStageState {
  event_id: number;
  event_name: string;
  event_status: string;
  is_live: boolean;
  current_session?: AgendaItem | null;
  next_session?: AgendaItem | null;
  agenda: AgendaItem[];
  recent_activities: EventActivity[];
  total_delay_minutes: number;
}

export interface ShiftedSessionSummary {
  id: number;
  title: string;
  original_start: string;
  updated_start: string;
  original_end: string;
  updated_end: string;
}

export interface DelayResponse {
  success: boolean;
  event_id: number;
  delay_minutes: number;
  reason: string;
  affected_sessions: ShiftedSessionSummary[];
  suggested_announcement: string;
}

export interface AIGeneratedResponse {
  title: string;
  script_type: string;
  content: string;
  tone: string;
  talking_points: string[];
  estimated_reading_time_seconds: number;
}
