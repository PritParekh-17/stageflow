from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Event, Speaker, AgendaItem, Script, EventActivity
from app.schemas.schemas import (
    GenerateOpeningRequest, GenerateIntroductionRequest, GenerateTransitionRequest,
    GenerateClosingRequest, GenerateAnnouncementRequest, RefineScriptRequest,
    AIGeneratedResponse
)
from app.services.ai_service import AIService
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/opening", response_model=AIGeneratedResponse)
async def generate_opening(req: GenerateOpeningRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    result = await AIService.generate_opening(
        event_name=event.name,
        venue=event.venue,
        description=event.description or "Premier technology and builder hackathon",
        tone=req.tone or "Professional",
        custom_notes=req.custom_notes
    )

    activity = EventActivity(
        event_id=event.id,
        action="AI_OPENING_GENERATED",
        title="AI Opening Script Generated",
        description=f"Generated opening script for '{event.name}' ({req.tone} tone)."
    )
    db.add(activity)
    db.commit()

    return result

@router.post("/introduction", response_model=AIGeneratedResponse)
async def generate_introduction(req: GenerateIntroductionRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == req.event_id).first()
    speaker = db.query(Speaker).filter(Speaker.id == req.speaker_id).first()
    if not event or not speaker:
        raise HTTPException(status_code=404, detail="Event or Speaker not found")

    session_title = "Special Keynote"
    if req.agenda_item_id:
        item = db.query(AgendaItem).filter(AgendaItem.id == req.agenda_item_id).first()
        if item:
            session_title = item.title

    result = await AIService.generate_introduction(
        speaker_name=speaker.name,
        designation=speaker.designation,
        organization=speaker.organization,
        bio=speaker.bio or "",
        session_title=session_title,
        tone=req.tone or "Inspiring"
    )

    activity = EventActivity(
        event_id=event.id,
        action="AI_INTRO_GENERATED",
        title="Speaker Introduction Generated",
        description=f"Generated stage intro for {speaker.name} ({speaker.organization})."
    )
    db.add(activity)
    db.commit()

    return result

@router.post("/transition", response_model=AIGeneratedResponse)
async def generate_transition(req: GenerateTransitionRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == req.event_id).first()
    current_item = db.query(AgendaItem).filter(AgendaItem.id == req.current_agenda_item_id).first()
    next_item = db.query(AgendaItem).filter(AgendaItem.id == req.next_agenda_item_id).first()

    if not event or not current_item or not next_item:
        raise HTTPException(status_code=404, detail="Event or Agenda items not found")

    completed_speaker = current_item.speaker.name if current_item.speaker else None
    next_speaker = next_item.speaker.name if next_item.speaker else None

    result = await AIService.generate_transition(
        completed_title=current_item.title,
        completed_speaker=completed_speaker,
        next_title=next_item.title,
        next_speaker=next_speaker,
        tone=req.tone or "Smooth & Professional"
    )

    activity = EventActivity(
        event_id=event.id,
        action="AI_TRANSITION_GENERATED",
        title="Stage Transition Generated",
        description=f"Generated verbal bridge from '{current_item.title}' to '{next_item.title}'."
    )
    db.add(activity)
    db.commit()

    return result

@router.post("/closing", response_model=AIGeneratedResponse)
async def generate_closing(req: GenerateClosingRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    result = await AIService.generate_closing(
        event_name=event.name,
        venue=event.venue,
        sponsor_mentions=req.sponsor_mentions,
        next_steps=req.next_steps,
        tone=req.tone or "Grand & Memorable"
    )

    activity = EventActivity(
        event_id=event.id,
        action="AI_CLOSING_GENERATED",
        title="Closing Address Generated",
        description=f"Generated grand closing address for '{event.name}'."
    )
    db.add(activity)
    db.commit()

    return result

@router.post("/announcement", response_model=AIGeneratedResponse)
async def generate_announcement(req: GenerateAnnouncementRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    result = await AIService.generate_announcement(
        event_name=event.name,
        announcement_type=req.announcement_type,
        details=req.details,
        delay_minutes=req.delay_minutes,
        tone=req.tone or "Calm & Authoritative"
    )

    activity = EventActivity(
        event_id=event.id,
        action="AI_ANNOUNCEMENT_GENERATED",
        title=f"Announcement Generated ({req.announcement_type})",
        description=f"Generated stage announcement for {event.name}."
    )
    db.add(activity)
    db.commit()

    return result

@router.post("/refine", response_model=AIGeneratedResponse)
def refine_script(req: RefineScriptRequest):
    return AIService.refine_script(req.content, req.instruction)
