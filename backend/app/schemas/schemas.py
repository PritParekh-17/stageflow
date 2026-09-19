from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- AUTH & USER ---
class UserBase(BaseModel):
    name: str
    email: str
    role: Optional[str] = "organizer"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None


# --- SPEAKER ---
class SpeakerBase(BaseModel):
    name: str
    designation: str
    organization: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class SpeakerCreate(SpeakerBase):
    pass

class SpeakerUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class SpeakerResponse(SpeakerBase):
    id: int
    event_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- AGENDA ITEM ---
class AgendaItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    speaker_id: Optional[int] = None
    start_time: str
    end_time: str
    duration_minutes: int = 30
    item_type: str = "SESSION"
    status: str = "UPCOMING"
    order_index: int = 0

class AgendaItemCreate(AgendaItemBase):
    pass

class AgendaItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    speaker_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    item_type: Optional[str] = None
    status: Optional[str] = None
    order_index: Optional[int] = None

class AgendaItemResponse(AgendaItemBase):
    id: int
    event_id: int
    original_start_time: Optional[str] = None
    original_end_time: Optional[str] = None
    speaker: Optional[SpeakerResponse] = None
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- SCRIPT ---
class ScriptBase(BaseModel):
    title: str
    script_type: str
    content: str
    tone: Optional[str] = "Professional"
    agenda_item_id: Optional[int] = None

class ScriptCreate(ScriptBase):
    pass

class ScriptResponse(ScriptBase):
    id: int
    event_id: int
    generated_by_ai: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- SCHEDULE CHANGE & DELAY ---
class ScheduleChangeResponse(BaseModel):
    id: int
    event_id: int
    agenda_item_id: Optional[int] = None
    reason: str
    delay_minutes: int
    affected_sessions_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class DelayRequest(BaseModel):
    delay_minutes: int = Field(..., ge=1, le=120)
    reason: str = "Speaker running late"
    affect_current_session: bool = True

class ShiftedSessionSummary(BaseModel):
    id: int
    title: str
    original_start: str
    updated_start: str
    original_end: str
    updated_end: str

class DelayResponse(BaseModel):
    success: bool
    event_id: int
    delay_minutes: int
    reason: str
    affected_sessions: List[ShiftedSessionSummary]
    suggested_announcement: str


# --- EVENT ACTIVITY ---
class ActivityResponse(BaseModel):
    id: int
    event_id: int
    action: str
    title: str
    description: str
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- EVENT ---
class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    venue: str = "Main Stage"
    event_date: str
    timezone: str = "Asia/Kolkata"
    status: str = "UPCOMING"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[str] = None
    timezone: Optional[str] = None
    status: Optional[str] = None
    is_live: Optional[bool] = None

class EventResponse(EventBase):
    id: int
    is_live: bool
    current_agenda_item_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EventDetailResponse(EventResponse):
    speakers: List[SpeakerResponse] = []
    agenda_items: List[AgendaItemResponse] = []
    scripts: List[ScriptResponse] = []
    schedule_changes: List[ScheduleChangeResponse] = []
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True


# --- LIVE STAGE STATE ---
class LiveStageState(BaseModel):
    event_id: int
    event_name: str
    event_status: str
    is_live: bool
    current_session: Optional[AgendaItemResponse] = None
    next_session: Optional[AgendaItemResponse] = None
    agenda: List[AgendaItemResponse] = []
    recent_activities: List[ActivityResponse] = []
    total_delay_minutes: int = 0


# --- AI REQUESTS & RESPONSES ---
class GenerateOpeningRequest(BaseModel):
    event_id: int
    tone: Optional[str] = "Professional"  # Professional, Energetic, Formal, Festive
    custom_notes: Optional[str] = None

class GenerateIntroductionRequest(BaseModel):
    event_id: int
    speaker_id: int
    agenda_item_id: Optional[int] = None
    tone: Optional[str] = "Inspiring"

class GenerateTransitionRequest(BaseModel):
    event_id: int
    current_agenda_item_id: int
    next_agenda_item_id: int
    key_takeaways: Optional[str] = None
    tone: Optional[str] = "Smooth & Professional"

class GenerateClosingRequest(BaseModel):
    event_id: int
    sponsor_mentions: Optional[str] = None
    next_steps: Optional[str] = None
    tone: Optional[str] = "Grand & Memorable"

class GenerateAnnouncementRequest(BaseModel):
    event_id: int
    announcement_type: str = "DELAY"  # DELAY, TECHNICAL, BREAK, VENUE_CHANGE, GENERAL, EMERGENCY
    details: Optional[str] = None
    delay_minutes: Optional[int] = None
    tone: Optional[str] = "Calm & Authoritative"

class RefineScriptRequest(BaseModel):
    content: str
    instruction: str  # "shorten", "formal", "energetic", "bullet_points"

class AIGeneratedResponse(BaseModel):
    title: str
    script_type: str
    content: str
    tone: str
    talking_points: List[str] = []
    estimated_reading_time_seconds: int = 45
