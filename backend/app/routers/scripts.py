from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Script, Event, EventActivity
from app.schemas.schemas import ScriptCreate, ScriptResponse
from app.routers.auth import get_current_user

router = APIRouter(tags=["scripts"])

@router.get("/events/{event_id}/scripts", response_model=List[ScriptResponse])
def get_event_scripts(
    event_id: int,
    script_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Script).filter(Script.event_id == event_id)
    if script_type:
        query = query.filter(Script.script_type == script_type.upper())
    return query.order_by(Script.created_at.desc()).all()

@router.post("/events/{event_id}/scripts", response_model=ScriptResponse)
def save_script(
    event_id: int,
    script_in: ScriptCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    script = Script(
        event_id=event_id,
        agenda_item_id=script_in.agenda_item_id,
        script_type=script_in.script_type.upper(),
        title=script_in.title,
        content=script_in.content,
        tone=script_in.tone or "Professional",
        generated_by_ai=True
    )
    db.add(script)
    db.commit()
    db.refresh(script)

    activity = EventActivity(
        event_id=event_id,
        action="SCRIPT_SAVED",
        title=f"Stage Script Saved ({script.script_type})",
        description=f"Saved '{script.title}' to stage prompt library."
    )
    db.add(activity)
    db.commit()

    return script

@router.put("/scripts/{script_id}", response_model=ScriptResponse)
def update_script(
    script_id: int,
    script_in: ScriptCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    script.title = script_in.title
    script.content = script_in.content
    script.script_type = script_in.script_type.upper()
    script.tone = script_in.tone
    script.agenda_item_id = script_in.agenda_item_id

    db.commit()
    db.refresh(script)
    return script

@router.delete("/scripts/{script_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_script(
    script_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    db.delete(script)
    db.commit()
    return None
