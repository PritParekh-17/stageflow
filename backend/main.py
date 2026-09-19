from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
import app.models.models  # Ensure models are loaded
from app.routers import auth, events, agenda, speakers, scripts, ai, live, websocket_router

# Create tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Anchor & Stage Flow Management System — Bit N Build '26 PS-5",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(agenda.router, prefix=settings.API_V1_STR)
app.include_router(speakers.router, prefix=settings.API_V1_STR)
app.include_router(scripts.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(live.router, prefix=settings.API_V1_STR)
app.include_router(websocket_router.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "product": "StageFlow",
        "description": "Smart Anchor & Stage Flow Management System",
        "event": "Bit N Build '26 — Gujarat Round (PS-5)"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
