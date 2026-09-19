from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Speaker, Event, EventActivity
from app.schemas.schemas import SpeakerCreate, SpeakerUpdate, SpeakerResponse
from app.routers.auth import get_current_user
from app.websocket.manager import ws_manager

router = APIRouter(tags=["speakers"])

@router.get("/events/{event_id}/speakers", response_model=List[SpeakerResponse])
def get_event_speakers(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db.query(Speaker).filter(Speaker.event_id == event_id).order_by(Speaker.name).all()

@router.post("/events/{event_id}/speakers", response_model=SpeakerResponse)
async def create_speaker(
    event_id: int,
    speaker_in: SpeakerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    speaker = Speaker(
        event_id=event_id,
        name=speaker_in.name,
        designation=speaker_in.designation,
        organization=speaker_in.organization,
        bio=speaker_in.bio,
        photo_url=speaker_in.photo_url
    )
    db.add(speaker)
    db.commit()
    db.refresh(speaker)

    activity = EventActivity(
        event_id=event_id,
        action="SPEAKER_ADDED",
        title="Speaker Added",
        description=f"Added '{speaker.name}' ({speaker.designation} at {speaker.organization}) to speaker roster."
    )
    db.add(activity)
    db.commit()

    return speaker

@router.get("/speakers/{speaker_id}", response_model=SpeakerResponse)
def get_speaker(speaker_id: int, db: Session = Depends(get_db)):
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    return speaker

@router.put("/speakers/{speaker_id}", response_model=SpeakerResponse)
def update_speaker(
    speaker_id: int,
    speaker_in: SpeakerUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    update_data = speaker_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(speaker, field, val)

    db.commit()
    db.refresh(speaker)
    return speaker

@router.delete("/speakers/{speaker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_speaker(
    speaker_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    speaker = db.query(Speaker).filter(Speaker.id == speaker_id).first()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    db.delete(speaker)
    db.commit()
    return None
