from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Event, AgendaItem, ScheduleChange, EventActivity
import json
import logging

logger = logging.getLogger("stageflow.delay_service")

def add_minutes_to_time_str(time_str: str, minutes: int) -> str:
    """
    Shifts a time string like "09:30" or "9:30 AM" or ISO string by `minutes`.
    Preserves original format wherever possible.
    """
    if not time_str:
        return time_str
    
    clean_str = time_str.strip()
    
    # Try 24-hour "HH:MM"
    try:
        parts = clean_str.split(":")
        if len(parts) == 2:
            hour = int(parts[0])
            minute = int(parts[1][:2])
            total_minutes = hour * 60 + minute + minutes
            new_hour = (total_minutes // 60) % 24
            new_minute = total_minutes % 60
            return f"{new_hour:02d}:{new_minute:02d}"
    except Exception:
        pass

    # Try 12-hour "HH:MM AM/PM"
    for fmt in ("%I:%M %p", "%I:%M%p", "%H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            dt = datetime.strptime(clean_str, fmt)
            new_dt = dt + timedelta(minutes=minutes)
            return new_dt.strftime(fmt)
        except ValueError:
            continue

    return time_str

class DelayService:
    @staticmethod
    def apply_delay(
        db: Session,
        event_id: int,
        delay_minutes: int,
        reason: str = "Schedule Adjustment",
        affect_current_session: bool = True
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Applies a schedule delay to an event.
        - Shifts current session's end time (if affect_current_session is True).
        - Shifts all UPCOMING and UP NEXT sessions' start_time and end_time by delay_minutes.
        - Preserves original_start_time and original_end_time for comparison.
        - Records a ScheduleChange entry and an EventActivity entry.
        """
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event {event_id} not found")

        agenda_items = db.query(AgendaItem).filter(
            AgendaItem.event_id == event_id
        ).order_by(AgendaItem.order_index).all()

        affected_summaries = []
        now = datetime.utcnow()

        # Find current live session or active session
        current_item = None
        if event.current_agenda_item_id:
            current_item = db.query(AgendaItem).filter(AgendaItem.id == event.current_agenda_item_id).first()
        if not current_item:
            current_item = next((item for item in agenda_items if item.status == "LIVE"), None)

        # 1. If there's a live session and affect_current_session is True, extend its duration and end_time
        if current_item and affect_current_session and current_item.status == "LIVE":
            if not current_item.original_end_time:
                current_item.original_end_time = current_item.end_time
            
            orig_end = current_item.end_time
            current_item.end_time = add_minutes_to_time_str(current_item.end_time, delay_minutes)
            current_item.duration_minutes += delay_minutes
            
            affected_summaries.append({
                "id": current_item.id,
                "title": current_item.title,
                "original_start": current_item.start_time,
                "updated_start": current_item.start_time,
                "original_end": orig_end,
                "updated_end": current_item.end_time,
                "status": current_item.status
            })

        # 2. Shift all UPCOMING or UP NEXT agenda items
        for item in agenda_items:
            # Skip completed or skipped items, and skip current if already handled
            if item.status in ["COMPLETED", "SKIPPED"]:
                continue
            if current_item and item.id == current_item.id:
                continue

            # Preserve originals on first delay
            if not item.original_start_time:
                item.original_start_time = item.start_time
            if not item.original_end_time:
                item.original_end_time = item.end_time

            orig_start = item.start_time
            orig_end = item.end_time

            item.start_time = add_minutes_to_time_str(item.start_time, delay_minutes)
            item.end_time = add_minutes_to_time_str(item.end_time, delay_minutes)

            affected_summaries.append({
                "id": item.id,
                "title": item.title,
                "original_start": orig_start,
                "updated_start": item.start_time,
                "original_end": orig_end,
                "updated_end": item.end_time,
                "status": item.status
            })

        # 3. Record ScheduleChange
        schedule_change = ScheduleChange(
            event_id=event_id,
            agenda_item_id=current_item.id if current_item else None,
            reason=reason,
            delay_minutes=delay_minutes,
            affected_sessions_count=len(affected_summaries)
        )
        db.add(schedule_change)

        # 4. Record Activity Log
        activity = EventActivity(
            event_id=event_id,
            action="DELAY_APPLIED",
            title=f"+{delay_minutes} Min Delay Applied",
            description=f"Schedule shifted by {delay_minutes} minutes ({reason}). {len(affected_summaries)} sessions updated.",
            metadata_json=json.dumps({
                "delay_minutes": delay_minutes,
                "reason": reason,
                "affected_count": len(affected_summaries),
                "affected_sessions": affected_summaries[:3]  # snippet
            })
        )
        db.add(activity)

        db.commit()

        # 5. Suggested announcement text for anchor
        suggested_announcement = (
            f"Ladies and gentlemen, thank you for your patience. To ensure all participants receive "
            f"maximum time and our speakers provide comprehensive insights, our upcoming schedule "
            f"has been slightly adjusted by {delay_minutes} minutes ({reason}). "
            f"Please stay tuned as we resume seamlessly."
        )

        return affected_summaries, suggested_announcement
