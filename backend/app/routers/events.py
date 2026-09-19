from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Event, User, AgendaItem, EventActivity, ScheduleChange
from app.schemas.schemas import (
    EventCreate, EventUpdate, EventResponse, EventDetailResponse,
    DelayRequest, DelayResponse, ShiftedSessionSummary
)
from app.routers.auth import get_current_user
from app.services.delay_service import DelayService
from app.websocket.manager import ws_manager
import json

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.created_at.desc()).all()

@router.post("", response_model=EventResponse)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = Event(
        name=event_in.name,
        description=event_in.description,
        venue=event_in.venue,
        event_date=event_in.event_date,
        timezone=event_in.timezone,
        status=event_in.status,
        created_by=current_user.id if current_user else None
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Activity log
    activity = EventActivity(
        event_id=event.id,
        action="EVENT_CREATED",
        title="Event Initialized",
        description=f"Event '{event.name}' was created for {event.event_date} at {event.venue}."
    )
    db.add(activity)
    db.commit()

    return event

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)

    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None

@router.post("/{event_id}/launch", response_model=EventDetailResponse)
async def launch_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.status = "LIVE"
    event.is_live = True

    # Find first agenda item and set it live if none is active
    first_item = db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).first()

    if first_item:
        first_item.status = "LIVE"
        event.current_agenda_item_id = first_item.id

    activity = EventActivity(
        event_id=event.id,
        action="EVENT_LAUNCHED",
        title="Event Gone Live",
        description=f"Live stage control initiated for '{event.name}'."
    )
    db.add(activity)
    db.commit()
    db.refresh(event)

    await ws_manager.broadcast(event.id, {
        "type": "EVENT_LAUNCHED",
        "event_id": event.id,
        "is_live": True,
        "current_agenda_item_id": event.current_agenda_item_id
    })

    return event

@router.post("/{event_id}/delay", response_model=DelayResponse)
async def apply_delay(
    event_id: int,
    delay_req: DelayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Core Delay Engine endpoint: Shifts affected future sessions, records schedule change,
    broadcasts to all connected WebSocket clients, and returns before/after comparisons.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    affected_list, suggested_announcement = DelayService.apply_delay(
        db=db,
        event_id=event_id,
        delay_minutes=delay_req.delay_minutes,
        reason=delay_req.reason,
        affect_current_session=delay_req.affect_current_session
    )

    summaries = [
        ShiftedSessionSummary(
            id=item["id"],
            title=item["title"],
            original_start=item["original_start"],
            updated_start=item["updated_start"],
            original_end=item["original_end"],
            updated_end=item["updated_end"]
        )
        for item in affected_list
    ]

    # Broadcast through WebSockets to update all stage monitors and tablets
    await ws_manager.broadcast(event_id, {
        "type": "DELAY_APPLIED",
        "event_id": event_id,
        "delay_minutes": delay_req.delay_minutes,
        "reason": delay_req.reason,
        "affected_sessions_count": len(summaries),
        "affected_sessions": [s.model_dump() for s in summaries],
        "suggested_announcement": suggested_announcement
    })

    return DelayResponse(
        success=True,
        event_id=event_id,
        delay_minutes=delay_req.delay_minutes,
        reason=delay_req.reason,
        affected_sessions=summaries,
        suggested_announcement=suggested_announcement
    )
