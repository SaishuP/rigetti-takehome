import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random
import json
import asyncio
import time

class Fridge(BaseModel):
    fridge_id: int
    instrument_name: str
    parameter_name: str
    applied_value: float
    timestamp: int

class Fridges(BaseModel):
    fridges: List[Fridge]

app = FastAPI()
origins = ["http://localhost:3000"]


# CORS probhibits unauthorized websites, endpoints, or servers from accessing your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, #only allow origins
    allow_credentials=True, # allow cookies
    allow_methods=["*"], # allow all methods and headers
    allow_headers=["*"],
)

memory_db = {"fridges": [
                { "fridge_id": 1,"instrument_name": "instrument_one","parameter_name": "flux_bias","applied_value": 0.37,"timestamp": 1739596596},
                {"fridge_id": 2,"instrument_name": "instrument_two","parameter_name": "temperature","applied_value": -0.12, "timestamp": 1739597890},
                {"fridge_id": 3,"instrument_name": "instrument_three","parameter_name": "power_level","applied_value": 1.25,"timestamp": 1739601234},
                {"fridge_id": 1,"instrument_name": "instrument_four","parameter_name": "current_bias","applied_value": 0.89,"timestamp": 1739612345},
                {"fridge_id": 2,"instrument_name": "instrument_five","parameter_name": "voltage","applied_value": 0.02,"timestamp": 1739623456}
            ]
}

@app.get("/fridges", response_model=Fridges)
def get_fridges():
    return Fridges(fridges=memory_db["fridges"])

# @app.post("/fridges")
# def add_fridge(fridge: Fridge):
#     memory_db["fridges"].append(Fridge)
#     return fridge

# clients connected to websocket
clients = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("attemtped to connect")
    await websocket.accept()
    print('accepted')
    if websocket not in clients:
        clients.append(websocket)

    try:
        while True:
            new_data = {
                "fridge_id": random.randint(1, 3),
                "instrument_name": random.choice(["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"]),
                "parameter_name": random.choice(["flux_bias", "temperature", "power_level", "current_bias", "voltage"]),
                "applied_value": round(random.uniform(-2.0, 2.0), 2),
                "timestamp": int(time.time() * 1000)
            }

            memory_db["fridges"].append(new_data)
            for client in clients:
                await client.send_text(json.dumps(new_data))
            print("sent data")

            await asyncio.sleep(2) #async sleep instead of time.sleep
    except WebSocketDisconnect:
        print("errorororor")
        clients.remove(websocket)

#Runs application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)