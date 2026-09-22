import json
from typing import Dict, List, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps complaint_id -> list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Global listeners (e.g. admin or dashboard)
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, complaint_id: str = "global"):
        await websocket.accept()
        if complaint_id == "global":
            self.global_connections.append(websocket)
        else:
            if complaint_id not in self.active_connections:
                self.active_connections[complaint_id] = []
            self.active_connections[complaint_id].append(websocket)

    def disconnect(self, websocket: WebSocket, complaint_id: str = "global"):
        if complaint_id == "global":
            if websocket in self.global_connections:
                self.global_connections.remove(websocket)
        else:
            if complaint_id in self.active_connections:
                if websocket in self.active_connections[complaint_id]:
                    self.active_connections[complaint_id].remove(websocket)
                if not self.active_connections[complaint_id]:
                    del self.active_connections[complaint_id]

    async def broadcast_to_complaint(self, complaint_id: str, event: str, data: Any):
        payload = json.dumps({
            "event": event,
            "complaint_id": complaint_id,
            "data": data
        })
        # Send to complaint specific subscribers
        if complaint_id in self.active_connections:
            for connection in list(self.active_connections[complaint_id]):
                try:
                    await connection.send_text(payload)
                except Exception:
                    self.disconnect(connection, complaint_id)

        # Also send to global listeners
        for connection in list(self.global_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection, "global")

    async def broadcast_global(self, event: str, data: Any):
        payload = json.dumps({
            "event": event,
            "data": data
        })
        for connection in list(self.global_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection, "global")

ws_manager = ConnectionManager()
