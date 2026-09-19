from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import AgendaItem, Event, EventActivity, Speaker
from app.schemas.schemas import AgendaItemCreate, AgendaItemUpdate, AgendaItemResponse
from app.routers.auth import get_current_user
from app.websocket.manager import ws_manager
from datetime import datetime

router = APIRouter(tags=["agenda"])

@router.get("/events/{event_id}/agenda", response_model=List[AgendaItemResponse])
def get_event_agenda(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db.query(AgendaItem).filter(
        AgendaItem.event_id == event_id
    ).order_by(AgendaItem.order_index).all()

@router.post("/events/{event_id}/agenda", response_model=AgendaItemResponse)
async def create_agenda_item(
    event_id: int,
    item_in: AgendaItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # If order_index not set or default 0, place at end
    current_count = db.query(AgendaItem).filter(AgendaItem.event_id == event_id).count()
    order_idx = item_in.order_index if item_in.order_index > 0 else current_count

    agenda_item = AgendaItem(
        event_id=event_id,
        speaker_id=item_in.speaker_id,
        title=item_in.title,
        description=item_in.description,
        start_time=item_in.start_time,
        end_time=item_in.end_time,
        original_start_time=item_in.start_time,
        original_end_time=item_in.end_time,
        duration_minutes=item_in.duration_minutes,
        item_type=item_in.item_type,
        status=item_in.status or "UPCOMING",
        order_index=order_idx
    )
    db.add(agenda_item)
    db.commit()
    db.refresh(agenda_item)

    activity = EventActivity(
        event_id=event_id,
        action="SESSION_ADDED",
        title="Session Added",
        description=f"Added '{agenda_item.title}' ({agenda_item.start_time} - {agenda_item.end_time}) to timeline."
    )
    db.add(activity)
    db.commit()

    await ws_manager.broadcast(event_id, {
        "type": "AGENDA_UPDATED",
        "event_id": event_id,
        "action": "ADD",
        "session_id": agenda_item.id
    })

    return agenda_item

@router.put("/agenda/{item_id}", response_model=AgendaItemResponse)
async def update_agenda_item(
    item_id: int,
    item_in: AgendaItemUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = db.query(AgendaItem).filter(AgendaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Agenda item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)

    await ws_manager.broadcast(item.event_id, {
        "type": "AGENDA_UPDATED",
        "event_id": item.event_id,
        "action": "UPDATE",
        "session_id": item.id
    })

    return item

@router.delete("/agenda/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agenda_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = db.query(AgendaItem).filter(AgendaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Agenda item not found")

    event_id = item.event_id
    db.delete(item)
    db.commit()

    await ws_manager.broadcast(event_id, {
        "type": "AGENDA_UPDATED",
        "event_id": event_id,
        "action": "DELETE",
        "session_id": item_id
    })
    return None

@router.post("/agenda/{item_id}/status", response_model=AgendaItemResponse)
async def set_agenda_item_status(
    item_id: int,
    status_str: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = db.query(AgendaItem).filter(AgendaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Agenda item not found")

    item.status = status_str
    event = db.query(Event).filter(Event.id == item.event_id).first()

    if status_str == "LIVE":
        item.actual_start_time = datetime.utcnow()
        if event:
            event.current_agenda_item_id = item.id
            event.is_live = True
            event.status = "LIVE"
    elif status_str == "COMPLETED":
        item.actual_end_time = datetime.utcnow()

    db.commit()
    db.refresh(item)

    await ws_manager.broadcast(item.event_id, {
        "type": "SESSION_STATUS_CHANGED",
        "event_id": item.event_id,
        "session_id": item.id,
        "status": status_str
    })

    return item
