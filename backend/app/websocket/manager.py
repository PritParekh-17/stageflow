import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("stageflow.websocket")

class ConnectionManager:
    def __init__(self):
        # Maps event_id -> list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, event_id: int):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)
        logger.info(f"WebSocket client connected to event {event_id}. Active: {len(self.active_connections[event_id])}")

    def disconnect(self, websocket: WebSocket, event_id: int):
        if event_id in self.active_connections:
            if websocket in self.active_connections[event_id]:
                self.active_connections[event_id].remove(websocket)
            if not self.active_connections[event_id]:
                del self.active_connections[event_id]
        logger.info(f"WebSocket client disconnected from event {event_id}")

    async def broadcast(self, event_id: int, message: dict):
        if event_id not in self.active_connections:
            return
        
        payload = json.dumps(message, default=str)
        dead_connections = []
        for connection in self.active_connections[event_id]:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to websocket: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead, event_id)

ws_manager = ConnectionManager()
