from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ws_manager
import logging
import json

logger = logging.getLogger("stageflow.websocket")
router = APIRouter(tags=["websocket"])

@router.websocket("/ws/events/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: int):
    await ws_manager.connect(websocket, event_id)
    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "event_id": event_id,
            "message": "Connected to StageFlow Realtime Engine"
        }))

        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # Respond to ping
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, event_id)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket, event_id)
