from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="organizer")
    created_at = Column(DateTime, default=utc_now)

    events = relationship("Event", back_populates="creator")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    venue = Column(String(255), nullable=False, default="Main Auditorium")
    event_date = Column(String(50), nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata")
    status = Column(String(50), default="UPCOMING")  # DRAFT, UPCOMING, LIVE, COMPLETED
    is_live = Column(Boolean, default=False)
    current_agenda_item_id = Column(Integer, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    creator = relationship("User", back_populates="events")
    speakers = relationship("Speaker", back_populates="event", cascade="all, delete-orphan")
    agenda_items = relationship("AgendaItem", back_populates="event", cascade="all, delete-orphan", order_by="AgendaItem.order_index")
    scripts = relationship("Script", back_populates="event", cascade="all, delete-orphan", order_by="desc(Script.created_at)")
    schedule_changes = relationship("ScheduleChange", back_populates="event", cascade="all, delete-orphan", order_by="desc(ScheduleChange.created_at)")
    activities = relationship("EventActivity", back_populates="event", cascade="all, delete-orphan", order_by="desc(EventActivity.created_at)")

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    event = relationship("Event", back_populates="speakers")
    agenda_items = relationship("AgendaItem", back_populates="speaker")

class AgendaItem(Base):
    __tablename__ = "agenda_items"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    speaker_id = Column(Integer, ForeignKey("speakers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(String(50), nullable=False)  # e.g. "09:30" or ISO
    end_time = Column(String(50), nullable=False)    # e.g. "10:00"
    original_start_time = Column(String(50), nullable=True)
    original_end_time = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    item_type = Column(String(50), default="SESSION")  # CEREMONY, BRIEFING, KEYNOTE, WORKSHOP, BREAK, MENTORING, PITCH, CLOSING
    status = Column(String(50), default="UPCOMING")    # COMPLETED, LIVE, UP NEXT, UPCOMING, SKIPPED
    order_index = Column(Integer, default=0)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    event = relationship("Event", back_populates="agenda_items")
    speaker = relationship("Speaker", back_populates="agenda_items")
    scripts = relationship("Script", back_populates="agenda_item", cascade="all, delete-orphan")

class Script(Base):
    __tablename__ = "scripts"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    agenda_item_id = Column(Integer, ForeignKey("agenda_items.id"), nullable=True)
    script_type = Column(String(50), nullable=False)  # OPENING, INTRODUCTION, TRANSITION, CLOSING, ANNOUNCEMENT
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tone = Column(String(50), default="Professional")
    generated_by_ai = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    event = relationship("Event", back_populates="scripts")
    agenda_item = relationship("AgendaItem", back_populates="scripts")

class ScheduleChange(Base):
    __tablename__ = "schedule_changes"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    agenda_item_id = Column(Integer, ForeignKey("agenda_items.id"), nullable=True)
    reason = Column(String(255), nullable=False)
    delay_minutes = Column(Integer, nullable=False)
    affected_sessions_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    event = relationship("Event", back_populates="schedule_changes")

class EventActivity(Base):
    __tablename__ = "event_activities"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    action = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    event = relationship("Event", back_populates="activities")
