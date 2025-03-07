import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
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
    total: int

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

def generate_historical_data(count):
    instrument = ["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"]
    param = ["flux_bias", "temperature", "power_level", "current_bias", "voltage"]
    timey = int(time.time()) - (count * 3600)

    for i in range(count):
        memory_db["fridges"].append({
            "fridge_id": random.randint(1, 3),
            "instrument_name": random.choice(instrument),
            "parameter_name": random.choice(param),
            "applied_value": round(random.uniform(-2.0, 2.0), 2),
            "timestamp": timey + (i * 3600)
        })

generate_historical_data(100)


@app.get("/fridges", response_model=Fridges)

# get fridges now is versatile for pagination or websocket
def get_fridges(page: int = Query(1,ge=1, description="page number"), 
                limit: int = Query(10, ge=1,le=100,description="items per page"),
                fridge_id: Optional[int] = None,
                instrument_name: Optional[str] = None,
                parameter_name: Optional[str] = None):

    filtered_fridges = memory_db["fridges"]
    
    #filter out fridges
    if fridge_id is not None: filtered_fridges = [f for f in filtered_fridges if f["fridge_id"] == fridge_id]
    if instrument_name: filtered_fridges = [f for f in filtered_fridges if instrument_name.lower() in f["instrument_name"].lower()]
    if parameter_name: filtered_fridges = [f for f in filtered_fridges if parameter_name.lower() in f["parameter_name"].lower()]

    #print("filtered: "filtered_fridges)

    #sort by timestamp
    filtered_fridges = sorted(filtered_fridges, key=lambda x: x["timestamp"], reverse=True)

    total = len(filtered_fridges)
    start = (page - 1) * limit
    end = start + limit
    paginated_data = filtered_fridges[start:end]
    
    return Fridges(fridges=paginated_data, total=total)


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
            #gen new random data every 2 seconds
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

            await asyncio.sleep(1) #async sleep instead of time.sleep
    except WebSocketDisconnect:
        print("web socket disconnected!")
        clients.remove(websocket)



#Runs application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)