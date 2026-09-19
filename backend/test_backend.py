import pytest
from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.models.models import Event

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_headers():
    response = client.post("/api/auth/login", json={
        "email": "demo@stageflow.io",
        "password": "password123"
    })
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_login_demo():
    response = client.post("/api/auth/login", json={
        "email": "demo@stageflow.io",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@stageflow.io"

def test_get_events(auth_headers):
    response = client.get("/api/events", headers=auth_headers)
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 1
    assert "Bit N Build" in events[0]["name"]

def test_live_stage_state(auth_headers):
    # Fetch first event
    events = client.get("/api/events", headers=auth_headers).json()
    event_id = events[0]["id"]

    response = client.get(f"/api/events/{event_id}/live", headers=auth_headers)
    assert response.status_code == 200
    live_data = response.json()
    assert live_data["event_id"] == event_id
    assert live_data["is_live"] is True
    assert live_data["current_session"] is not None
    assert live_data["next_session"] is not None
    assert len(live_data["agenda"]) >= 6

def test_apply_delay(auth_headers):
    events = client.get("/api/events", headers=auth_headers).json()
    event_id = events[0]["id"]

    delay_payload = {
        "delay_minutes": 10,
        "reason": "Keynote speaker technical check",
        "affect_current_session": True
    }
    response = client.post(f"/api/events/{event_id}/delay", json=delay_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["delay_minutes"] == 10
    assert len(data["affected_sessions"]) > 0
    assert "suggested_announcement" in data

def test_ai_announcement(auth_headers):
    events = client.get("/api/events", headers=auth_headers).json()
    event_id = events[0]["id"]

    response = client.post("/api/ai/announcement", json={
        "event_id": event_id,
        "announcement_type": "DELAY",
        "delay_minutes": 10,
        "details": "AV setup in progress",
        "tone": "Calm & Authoritative"
    }, headers=auth_headers)
    assert response.status_code == 200
    ai_data = response.json()
    assert "content" in ai_data
    assert "10" in ai_data["content"]
    assert len(ai_data["talking_points"]) > 0

if __name__ == "__main__":
    pytest.main(["-v", "test_backend.py"])
