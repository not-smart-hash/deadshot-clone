import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .game_state import GameState

app = FastAPI(title="3D FPS Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

game_state = GameState()

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):

    await websocket.accept()
    game_state.add_player(player_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data_text)
            game_state.update_player_state(player_id, message)

            # Send the updated game state to the client
            await websocket.send_text(json.dumps(game_state.get_game_state()))
    except WebSocketDisconnect:
        game_state.remove_player(player_id)

        async def broadcast_loop():
            while True:
                if len(game_state.players) > 0:
                    pass
                await asyncio.sleep(0.033)
                
        @app.on_event("startup")
        async def startup_event():
            asyncio.create_task(broadcast_loop())
