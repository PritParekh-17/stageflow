import sys
from datetime import datetime, timezone
from app.db.session import SessionLocal, engine, Base
from app.models.models import User, Event, Speaker, AgendaItem, Script, EventActivity, ScheduleChange
from app.core.security import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean demo
    db.query(EventActivity).delete()
    db.query(ScheduleChange).delete()
    db.query(Script).delete()
    db.query(AgendaItem).delete()
    db.query(Speaker).delete()
    db.query(Event).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding demo database for StageFlow...")

    # 1. Create Demo Organizer
    demo_user = User(
        name="Alex Rivera",
        email="demo@stageflow.io",
        password_hash=get_password_hash("password123"),
        role="organizer"
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Create Event: Bit N Build '26
    event = Event(
        name="Bit N Build ’26 — Gujarat Round",
        description="Premier State-Level Hackathon bringing together 500+ elite student engineers and innovators to build impactful real-world software solutions.",
        venue="Grand Convention Hall & Main Stage, GTU Campus",
        event_date="2026-09-19",
        timezone="Asia/Kolkata",
        status="LIVE",
        is_live=True,
        created_by=demo_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # 3. Create Speakers
    speakers_data = [
        {
            "name": "Dr. Rajesh Mehta",
            "designation": "Dean of Engineering & Innovation",
            "organization": "Gujarat Technological University",
            "bio": "Distinguished academician and state advisor on frontier technical curriculum, leading youth innovation initiatives across Gujarat.",
            "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
        },
        {
            "name": "Priya Sharma",
            "designation": "Principal Cloud & AI Architect",
            "organization": "Google Cloud India",
            "bio": "Expert in enterprise generative AI architectures, distributed cloud computing, and developer ecosystem leadership.",
            "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
        },
        {
            "name": "Vikram Patel",
            "designation": "Director of Startup Incubation",
            "organization": "Gujarat Innovation Hub",
            "bio": "Serial entrepreneur and angel investor focused on early-stage student deep-tech ventures and ecosystem funding.",
            "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
        },
        {
            "name": "Ananya Desai",
            "designation": "VP of Product Engineering",
            "organization": "BitSpace Systems",
            "bio": "Product strategist with over 14 years architecting resilient real-time streaming platforms and autonomous developer tooling.",
            "photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
        }
    ]

    speakers = []
    for sp_data in speakers_data:
        sp = Speaker(event_id=event.id, **sp_data)
        db.add(sp)
        speakers.append(sp)
    db.commit()
    for sp in speakers:
        db.refresh(sp)

    # 4. Create Agenda Sessions
    agenda_data = [
        {
            "title": "Registration & Kit Distribution",
            "description": "Attendee check-in, team badge issuance, and hacker swag distribution.",
            "speaker_id": None,
            "start_time": "09:00",
            "end_time": "09:30",
            "original_start_time": "09:00",
            "original_end_time": "09:30",
            "duration_minutes": 30,
            "item_type": "BREAK",
            "status": "COMPLETED",
            "order_index": 0
        },
        {
            "title": "Opening Ceremony & Dignitary Welcome",
            "description": "Traditional lamp lighting, opening address by university deans, and welcome keynote.",
            "speaker_id": speakers[0].id,  # Dr. Rajesh Mehta
            "start_time": "09:30",
            "end_time": "10:00",
            "original_start_time": "09:30",
            "original_end_time": "10:00",
            "duration_minutes": 30,
            "item_type": "CEREMONY",
            "status": "LIVE",
            "order_index": 1,
            "actual_start_time": datetime.now(timezone.utc)
        },
        {
            "title": "Problem Statement Briefing & Evaluation Rules",
            "description": "Comprehensive walkthrough of PS-1 through PS-6 tracks, rubrics, and submission guidelines.",
            "speaker_id": speakers[2].id,  # Vikram Patel
            "start_time": "10:00",
            "end_time": "10:30",
            "original_start_time": "10:00",
            "original_end_time": "10:30",
            "duration_minutes": 30,
            "item_type": "BRIEFING",
            "status": "UP NEXT",
            "order_index": 2
        },
        {
            "title": "Hackathon Begins (Sprint Phase 1)",
            "description": "Official hackathon countdown trigger and commencement of core project architecture.",
            "speaker_id": None,
            "start_time": "10:30",
            "end_time": "13:00",
            "original_start_time": "10:30",
            "original_end_time": "13:00",
            "duration_minutes": 150,
            "item_type": "WORKSHOP",
            "status": "UPCOMING",
            "order_index": 3
        },
        {
            "title": "Lunch Break & Networking",
            "description": "Catered lunch at North Quad with mentor drop-in booths.",
            "speaker_id": None,
            "start_time": "13:00",
            "end_time": "14:00",
            "original_start_time": "13:00",
            "original_end_time": "14:00",
            "duration_minutes": 60,
            "item_type": "BREAK",
            "status": "UPCOMING",
            "order_index": 4
        },
        {
            "title": "Mentor Round 1: Architecture Review",
            "description": "Hands-on table checkpoints where technical mentors evaluate database schemas and system designs.",
            "speaker_id": speakers[1].id,  # Priya Sharma
            "start_time": "14:00",
            "end_time": "17:00",
            "original_start_time": "14:00",
            "original_end_time": "17:00",
            "duration_minutes": 180,
            "item_type": "MENTORING",
            "status": "UPCOMING",
            "order_index": 5
        },
        {
            "title": "Evaluation Briefing & Code Freeze Check",
            "description": "Final check-in instructions before jury pitch decks are collected.",
            "speaker_id": speakers[3].id,  # Ananya Desai
            "start_time": "17:00",
            "end_time": "18:00",
            "original_start_time": "17:00",
            "original_end_time": "18:00",
            "duration_minutes": 60,
            "item_type": "BRIEFING",
            "status": "UPCOMING",
            "order_index": 6
        },
        {
            "title": "Closing Ceremony & Grand Award Presentation",
            "description": "Final podium announcements, trophies, and felicitations for top winning teams.",
            "speaker_id": None,
            "start_time": "18:00",
            "end_time": "19:00",
            "original_start_time": "18:00",
            "original_end_time": "19:00",
            "duration_minutes": 60,
            "item_type": "CLOSING",
            "status": "UPCOMING",
            "order_index": 7
        }
    ]

    agenda_items = []
    for ag_data in agenda_data:
        item = AgendaItem(event_id=event.id, **ag_data)
        db.add(item)
        agenda_items.append(item)
    db.commit()
    for item in agenda_items:
        db.refresh(item)

    # Set current agenda item ID
    event.current_agenda_item_id = agenda_items[1].id  # Opening Ceremony is LIVE
    db.commit()

    # 5. Create Initial Scripts
    initial_scripts = [
        {
            "event_id": event.id,
            "agenda_item_id": agenda_items[1].id,
            "script_type": "OPENING",
            "title": "Grand Inaugural Anchor Speech",
            "content": (
                "\"Distinguished delegates, honorable faculty, respected mentors, and the brilliant hackathon teams of Gujarat! [PAUSE, RADIATE WARMTH]\n\n"
                "Welcome to the prestigious Bit N Build ’26 — Gujarat Round! Today, we are not just witnessing a competition; we are witnessing "
                "the birth of breakthroughs that will redefine how we solve real-world industry challenges.\n\n"
                "[GESTURE TO SCREEN]\n"
                "Over the next 24 hours, this auditorium will pulse with the energy of relentless creativity and execution. "
                "Let us give our warmest standing ovation to Dr. Rajesh Mehta as he inaugurates the stage!\" [LEAD APPLAUSE]"
            ),
            "tone": "Energetic & Inspiring",
            "generated_by_ai": True
        },
        {
            "event_id": event.id,
            "agenda_item_id": agenda_items[1].id,
            "script_type": "INTRODUCTION",
            "title": "Introducing Dr. Rajesh Mehta",
            "content": (
                "\"It is an immense honor to invite to the podium Dr. Rajesh Mehta, Dean of Engineering & Innovation at GTU. "
                "A visionary educator who has mentored hundreds of national startup founders and championed innovation across Gujarat. "
                "Please welcome Dr. Mehta with a thunderous round of applause!\""
            ),
            "tone": "Formal & Dignified",
            "generated_by_ai": True
        },
        {
            "event_id": event.id,
            "agenda_item_id": agenda_items[2].id,
            "script_type": "TRANSITION",
            "title": "Ceremony to Briefing Bridge",
            "content": (
                "\"Thank you, Dr. Mehta, for those motivating words that have set the benchmark high for every team here! [CLAP]\n\n"
                "Now, builders, lean in closely. We move straight to the heart of the competition: 'Problem Statement Briefing & Evaluation Rules'. "
                "Let's welcome Vikram Patel to unveil the guidelines that could win you the trophy!\""
            ),
            "tone": "Smooth & Professional",
            "generated_by_ai": True
        }
    ]

    for sc in initial_scripts:
        db.add(Script(**sc))
    db.commit()

    # 6. Initial Activity Logs
    activities = [
        EventActivity(
            event_id=event.id,
            action="EVENT_LAUNCHED",
            title="Live Stage Operational",
            description="Control room initialized and broadcast engine linked."
        ),
        EventActivity(
            event_id=event.id,
            action="SESSION_STARTED",
            title="Opening Ceremony Started",
            description="Grand opening ceremony is now live on stage."
        ),
        EventActivity(
            event_id=event.id,
            action="SPEAKER_ASSIGNED",
            title="Dignitaries Checked-In",
            description="Dr. Rajesh Mehta and Vikram Patel stage cues confirmed."
        )
    ]
    for act in activities:
        db.add(act)
    db.commit()

    db.close()
    print("Database seeding completed successfully! Demo credentials: demo@stageflow.io / password123")

if __name__ == "__main__":
    seed()
