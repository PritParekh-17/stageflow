from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.db.session import get_db
from app.models.models import Event, AgendaItem, EventActivity, ScheduleChange
from app.schemas.schemas import LiveStageState, AgendaItemResponse, ActivityResponse
from app.websocket.manager import ws_manager
from app.routers.auth import get_current_user

router = APIRouter(tags=["live"])

@router.get("/events/{event_id}/live", response_model=LiveStageState)
def get_live_stage_state(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    agenda_items = db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).all()

    current_session = None
    next_session = None

    # Determine current live session
    if event.current_agenda_item_id:
        current_session = next((item for item in agenda_items if item.id == event.current_agenda_item_id), None)

    if not current_session:
        current_session = next((item for item in agenda_items if item.status == "LIVE"), None)

    # Determine next session
    if current_session:
        found_current = False
        for item in agenda_items:
            if found_current:
                if item.status in ["UP NEXT", "UPCOMING"]:
                    next_session = item
                    break
            elif item.id == current_session.id:
                found_current = True
    else:
        # If no current session is live, first upcoming is next
        next_session = next((item for item in agenda_items if item.status in ["UP NEXT", "UPCOMING"]), None)

    # Total delays
    total_delay = sum(sc.delay_minutes for sc in event.schedule_changes)

    activities = db.query(EventActivity).filter(
        EventActivity.event_id == event_id
    ).order_by(EventActivity.created_at.desc()).limit(15).all()

    return LiveStageState(
        event_id=event.id,
        event_name=event.name,
        event_status=event.status,
        is_live=event.is_live,
        current_session=current_session,
        next_session=next_session,
        agenda=agenda_items,
        recent_activities=activities,
        total_delay_minutes=total_delay
    )

@router.post("/events/{event_id}/live/start")
async def start_session(
    event_id: int,
    session_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    agenda_items = db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).all()

    target_session = None
    if session_id:
        target_session = next((item for item in agenda_items if item.id == session_id), None)
    else:
        # Pick current if not started, or first UPCOMING/UP NEXT
        target_session = next((item for item in agenda_items if item.status in ["UP NEXT", "UPCOMING"]), None)

    if not target_session:
        raise HTTPException(status_code=400, detail="No upcoming session available to start")

    # Mark existing LIVE session as COMPLETED
    for item in agenda_items:
        if item.status == "LIVE" and item.id != target_session.id:
            item.status = "COMPLETED"
            item.actual_end_time = datetime.utcnow()

    target_session.status = "LIVE"
    target_session.actual_start_time = datetime.utcnow()

    event.status = "LIVE"
    event.is_live = True
    event.current_agenda_item_id = target_session.id

    # Mark immediate next session as UP NEXT
    found = False
    for item in agenda_items:
        if found and item.status == "UPCOMING":
            item.status = "UP NEXT"
            break
        if item.id == target_session.id:
            found = True

    activity = EventActivity(
        event_id=event_id,
        action="SESSION_STARTED",
        title=f"Live Session Started: {target_session.title}",
        description=f"Stage is now LIVE with '{target_session.title}'."
    )
    db.add(activity)
    db.commit()

    await ws_manager.broadcast(event_id, {
        "type": "SESSION_STARTED",
        "event_id": event_id,
        "session_id": target_session.id,
        "session_title": target_session.title
    })

    return {"status": "success", "active_session_id": target_session.id, "session_title": target_session.title}

@router.post("/events/{event_id}/live/end")
async def end_session(
    event_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    agenda_items = db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).all()

    current_item = next((item for item in agenda_items if item.status == "LIVE"), None)
    if not current_item and event.current_agenda_item_id:
        current_item = next((item for item in agenda_items if item.id == event.current_agenda_item_id), None)

    if not current_item:
        raise HTTPException(status_code=400, detail="No active session currently running")

    current_item.status = "COMPLETED"
    current_item.actual_end_time = datetime.utcnow()

    # Promote next session to LIVE
    next_session = None
    found_curr = False
    for item in agenda_items:
        if found_curr and item.status in ["UP NEXT", "UPCOMING"]:
            next_session = item
            break
        if item.id == current_item.id:
            found_curr = True

    if next_session:
        next_session.status = "LIVE"
        next_session.actual_start_time = datetime.utcnow()
        event.current_agenda_item_id = next_session.id

        # Update the subsequent session to UP NEXT
        found_next = False
        for item in agenda_items:
            if found_next and item.status == "UPCOMING":
                item.status = "UP NEXT"
                break
            if item.id == next_session.id:
                found_next = True
    else:
        event.current_agenda_item_id = None
        event.status = "COMPLETED"

    activity = EventActivity(
        event_id=event_id,
        action="SESSION_ENDED",
        title=f"Session Ended: {current_item.title}",
        description=f"Concluded '{current_item.title}'." + (f" Handed stage to '{next_session.title}'." if next_session else " All sessions completed.")
    )
    db.add(activity)
    db.commit()

    await ws_manager.broadcast(event_id, {
        "type": "SESSION_ENDED",
        "event_id": event_id,
        "completed_session_id": current_item.id,
        "new_live_session_id": next_session.id if next_session else None
    })

    return {
        "status": "success",
        "completed_session_id": current_item.id,
        "new_live_session_id": next_session.id if next_session else None,
        "new_live_title": next_session.title if next_session else None
    }

@router.post("/events/{event_id}/live/skip")
async def skip_session(
    event_id: int,
    session_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    agenda_items = db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).all()

    target = None
    if session_id:
        target = next((item for item in agenda_items if item.id == session_id), None)
    else:
        target = next((item for item in agenda_items if item.status == "LIVE"), None)
        if not target:
            target = next((item for item in agenda_items if item.status in ["UP NEXT", "UPCOMING"]), None)

    if not target:
        raise HTTPException(status_code=400, detail="No session found to skip")

    target.status = "SKIPPED"

    # Find next session
    next_session = None
    found_curr = False
    for item in agenda_items:
        if found_curr and item.status in ["UP NEXT", "UPCOMING"]:
            next_session = item
            break
        if item.id == target.id:
            found_curr = True

    if next_session:
        next_session.status = "LIVE"
        next_session.actual_start_time = datetime.utcnow()
        event.current_agenda_item_id = next_session.id
    else:
        event.current_agenda_item_id = None

    activity = EventActivity(
        event_id=event_id,
        action="SESSION_SKIPPED",
        title=f"Session Skipped: {target.title}",
        description=f"Skipped session '{target.title}'."
    )
    db.add(activity)
    db.commit()

    await ws_manager.broadcast(event_id, {
        "type": "SESSION_SKIPPED",
        "event_id": event_id,
        "skipped_session_id": target.id,
        "new_live_session_id": next_session.id if next_session else None
    })

    return {"status": "success", "skipped_session_id": target.id}
