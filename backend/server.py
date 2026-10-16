import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

# Server Configuration (Inlined to prevent import errors)
HOST = "127.0.0.1"
PORT = 8000
TICK_RATE = 30

# Simple Mock GameState for testing if yours is separate
class GameState:
    def __init__(self):
        self.players = {}

    def add_player(self, client_id):
        self.players[client_id] = {"x": 0, "y": 0, "z": 0}

    def remove_player(self, client_id):
        if client_id in self.players:
            del self.players[client_id]

    def update_player_input(self, client_id, inputs):
        pass

    def tick(self, interval):
        pass

app = FastAPI()
game_state = GameState()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    game_state.add_player(client_id)
    print(f"Client connected: {client_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "input":
                inputs = message.get("data", {})
                game_state.update_player_input(client_id, inputs)

    except WebSocketDisconnect:
        game_state.remove_player(client_id)
        print(f"Client disconnected: {client_id}")
    except Exception as e:
        print(f"Error handling websocket for {client_id}: {e}")
        game_state.remove_player(client_id)

async def game_loop():
    tick_interval = 1.0 / TICK_RATE
    while True:
        game_state.tick(tick_interval)
        await asyncio.sleep(tick_interval)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())

if __name__ == "__main__":
    uvicorn.run("server:app", host=HOST, port=PORT, reload=True)