# StageFlow — Smart Anchor & Stage Flow Management System

> **Bit N Build '26 — Gujarat Round · Problem Statement PS-5**

StageFlow is a real-time event operations and stage-control platform built for anchors, event organizers, coordinators, and backstage teams. It replaces fragmented WhatsApp groups and spreadsheets with a unified command-center interface — featuring live stage tracking, autonomous delay propagation, and AI-generated anchor scripts.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Live Stage Control** | Real-time stage view with session timer, "Up Next" preview, and LIVE indicator |
| **Autonomous Delay Engine** | Apply a +N minute delay once — all future sessions shift automatically, preserving original times |
| **AI Script Generator** | Generate opening remarks, speaker introductions, transitions, announcements, and closing scripts via Gemini API |
| **WebSocket Broadcast** | All operators see stage changes in real-time via WebSocket |
| **Agenda Management** | Drag, reorder, assign speakers to sessions; track LIVE / UP NEXT / COMPLETED / SKIPPED status |
| **Speaker Roster** | Profile management with organization, designation, bio, and AI intro generation |
| **Script Library** | Save and retrieve AI-generated scripts by type |
| **Event Wizard** | 4-step event creation: details → agenda → speakers → review & launch |

---

## 🛠 Tech Stack

**Backend**
- FastAPI (Python 3.12)
- SQLAlchemy + SQLite (PostgreSQL-ready)
- WebSockets (native FastAPI)
- python-jose (JWT auth)
- passlib + bcrypt (password hashing)
- Google Gemini API / OpenAI (AI scripts, fallback generator included)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- lucide-react icons
- Inter font (next/font)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to set GEMINI_API_KEY if you have one (optional, fallback generator works without it)

# Seed the database with demo data
python seed.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Open in Browser

```
http://localhost:3000
```

---

## 🔐 Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@stageflow.io` |
| Password | `password123` |

---

## 📁 Project Structure

```
BITNBUILD/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Security (JWT/bcrypt)
│   │   ├── db/             # SQLAlchemy session
│   │   ├── models/         # ORM models
│   │   ├── routers/        # FastAPI routers (auth, events, agenda, live, ai, ws)
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Delay engine, AI service
│   │   └── websocket/      # Connection manager
│   ├── main.py             # FastAPI app entry
│   ├── seed.py             # Demo data seeder
│   ├── test_backend.py     # pytest suite
│   └── requirements.txt
│
└── frontend/
    ├── app/                # Next.js App Router pages
    │   ├── (auth)/         # login, register
    │   ├── dashboard/
    │   ├── events/
    │   │   ├── [id]/
    │   │   │   ├── live/   # ← CENTERPIECE page
    │   │   │   ├── agenda/
    │   │   │   ├── speakers/
    │   │   │   └── scripts/
    │   │   └── new/        # Event creation wizard
    │   └── settings/
    ├── components/
    │   ├── ai/             # AIDrawer
    │   ├── layout/         # Navbar, EventNav
    │   ├── live/           # LiveHeader, SessionCards, OperatorControls, Timeline, etc.
    │   └── ui/             # Button, Badge, Card, Modal, Input, Toast
    ├── hooks/              # useWebSocket, useTheme, useCountdown
    ├── lib/                # api.ts, utils.ts
    └── types/              # TypeScript types
```

---

## 🎯 The Demo Flow (for judges)

1. **Login** with `demo@stageflow.io` / `password123`
2. **Dashboard** — see the Bit N Build '26 event card, click "Open Live Stage"
3. **Live Stage** — observe the current session, countdown timer, WebSocket status
4. **Apply Delay** — click "+ Delay" → enter 10 minutes → see all future sessions shift autonomously
5. **AI Script** — click "AI Scripts" → generate a "Delay Announcement" for the audience
6. **Copy & Use** — the anchor reads the generated script live
7. **Session Control** — click "End Session" → next session loads automatically
8. **Agenda** — navigate to Agenda tab → see original vs shifted times highlighted

---

## 🧪 Running Tests

```bash
cd backend

# Reseed database before tests
python seed.py

# Run pytest suite
venv\Scripts\pytest.exe -v test_backend.py
```

All 6 tests should pass:
- `test_health` — API health check
- `test_login_demo` — Auth flow
- `test_get_events` — Events CRUD
- `test_live_stage_state` — Live stage state
- `test_apply_delay` — Delay engine
- `test_ai_announcement` — AI script generation

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login → JWT token |
| `GET` | `/api/events/` | List events |
| `POST` | `/api/events/` | Create event |
| `POST` | `/api/events/{id}/launch` | Launch event |
| `POST` | `/api/events/{id}/delay` | Apply delay (cascade) |
| `GET` | `/api/events/{id}/live` | Full live stage state |
| `POST` | `/api/events/{id}/live/start` | Start current session |
| `POST` | `/api/events/{id}/live/end` | End current session |
| `POST` | `/api/events/{id}/live/skip` | Skip current session |
| `GET` | `/api/events/{event_id}/agenda` | Get agenda |
| `POST` | `/api/events/{event_id}/agenda` | Create agenda item |
| `GET` | `/api/events/{event_id}/speakers` | Get speakers |
| `POST` | `/api/ai/announcement` | Generate announcement script |
| `WS` | `/ws/events/{id}` | Real-time WebSocket |

Full API docs at `http://127.0.0.1:8000/docs` when server is running.

---

## 🏆 Team

Built for **Bit N Build '26 — Gujarat Round** · Problem Statement **PS-5**

*StageFlow — Because every second on stage matters.*
