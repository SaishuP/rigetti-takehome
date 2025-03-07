import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import json
import asyncio
import time

#Fridge struct
class Fridge(BaseModel):
    fridge_id: int
    instrument_name: str
    parameter_name: str
    applied_value: float
    timestamp: int

#Collection of fridges struct
class Fridges(BaseModel):
    fridges: List[Fridge]
    total: int

app = FastAPI()
origins = ["http://localhost:3000"]


# CORS probhibits unauthorized websites, endpoints, or servers from accessing the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, #only allow origins
    allow_credentials=True, # allow cookies
    allow_methods=["*"], # allow all methods and headers
    allow_headers=["*"],
)

#In memory database to store fridge records
memory_db = {"fridges": [
                { "fridge_id": 1,"instrument_name": "instrument_one","parameter_name": "flux_bias","applied_value": 0.37,"timestamp": 1739596596},
                {"fridge_id": 2,"instrument_name": "instrument_two","parameter_name": "temperature","applied_value": -0.12, "timestamp": 1739597890},
                {"fridge_id": 3,"instrument_name": "instrument_three","parameter_name": "power_level","applied_value": 1.25,"timestamp": 1739601234},
                {"fridge_id": 1,"instrument_name": "instrument_four","parameter_name": "current_bias","applied_value": 0.89,"timestamp": 1739612345},
                {"fridge_id": 2,"instrument_name": "instrument_five","parameter_name": "voltage","applied_value": 0.02,"timestamp": 1739623456}
            ]
}

# Generates the historical data used for infinite scrolling
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

# Get the fridge data, optimized for the pagination as well as the live feed
@app.get("/settings", response_model=Fridges)
def get_fridges(page: int = Query(1,ge=1, description="page number"), 
                limit: int = Query(10, ge=1,le=100,description="items per page"),
                fridge_id: Optional[int] = None,
                instrument_name: Optional[str] = None,
                parameter_name: Optional[str] = None):

    filtered_fridges = memory_db["fridges"]
    
    # Apply the filtering
    if fridge_id is not None: filtered_fridges = [f for f in filtered_fridges if f["fridge_id"] == fridge_id]
    if instrument_name: filtered_fridges = [f for f in filtered_fridges if instrument_name.lower() in f["instrument_name"].lower()]
    if parameter_name: filtered_fridges = [f for f in filtered_fridges if parameter_name.lower() in f["parameter_name"].lower()]

    # Sort Results by time
    filtered_fridges = sorted(filtered_fridges, key=lambda x: x["timestamp"], reverse=True)

    total = len(filtered_fridges)
    start = (page - 1) * limit
    end = start + limit
    paginated_data = filtered_fridges[start:end]
    
    return Fridges(fridges=paginated_data, total=total)

#CLients for the web socket
clients = []

#Websocket endpoint to get real time data
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("attemtped to connect")
    await websocket.accept()
    print('accepted')
    if websocket not in clients:
        clients.append(websocket)

    try:
        while True:
            # Generate random new data every second
            new_data = {
                "fridge_id": random.randint(1, 3),
                "instrument_name": random.choice(["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"]),
                "parameter_name": random.choice(["flux_bias", "temperature", "power_level", "current_bias", "voltage"]),
                "applied_value": round(random.uniform(-2.0, 2.0), 2),
                "timestamp": int(time.time() * 1000)
            }

            # Add data to in memory databse and send the new data to all the clietns conencted on the web scoket
            memory_db["fridges"].append(new_data)
            for client in clients:
                await client.send_text(json.dumps(new_data))
            print("sent data")

            await asyncio.sleep(1) # Sleep for 1 second, asyncio is better than timesleep because you can still do asynch functions
    except WebSocketDisconnect:
        print("web socket disconnected!")
        clients.remove(websocket)

# endpoint to get fridge analytics
@app.get("/analytics")
def get_analytics():

    fridges = memory_db["fridges"]

    #structure for analytics
    analytics = {
        "overall": {
            "totalRecords": len(fridges),
            "avgValue": 0,
            "minValue": float('inf'),
            "maxValue": float('-inf')
        },
        "byFridge": {},
        "byInstrument": {},
        "byParameter": {}
    }
    
    # Overall statsicis calculations
    total_value = sum(fridge["applied_value"] for fridge in fridges)
    analytics["overall"]["avgValue"] = round(total_value / len(fridges), 2) if fridges else 0
    analytics["overall"]["minValue"] = min(fridge["applied_value"] for fridge in fridges) if fridges else 0
    analytics["overall"]["maxValue"] = max(fridge["applied_value"] for fridge in fridges) if fridges else 0
    
    # fridge id Stastics
    fridge_groups = {}
    for fridge in fridges:
        fridge_id = f"Fridge {fridge['fridge_id']}"
        if fridge_id not in fridge_groups:
            fridge_groups[fridge_id] = []
        fridge_groups[fridge_id].append(fridge["applied_value"])
    
    for fridge_id, values in fridge_groups.items():
        analytics["byFridge"][fridge_id] = {
            "count": len(values),
            "avgValue": round(sum(values) / len(values), 2),
            "minValue": min(values),
            "maxValue": max(values)
        }
    
    # Instrument name Stastics
    instrument_groups = {}
    for fridge in fridges:
        instrument = fridge["instrument_name"]
        if instrument not in instrument_groups:
            instrument_groups[instrument] = []
        instrument_groups[instrument].append(fridge["applied_value"])
    
    for instrument, values in instrument_groups.items():
        analytics["byInstrument"][instrument] = {
            "count": len(values),
            "avgValue": round(sum(values) / len(values), 2),
            "minValue": min(values),
            "maxValue": max(values)
        }
    
    # Parameter Name Stastics
    parameter_groups = {}
    for fridge in fridges:
        parameter = fridge["parameter_name"]
        if parameter not in parameter_groups:
            parameter_groups[parameter] = []
        parameter_groups[parameter].append(fridge["applied_value"])
    
    for parameter, values in parameter_groups.items():
        analytics["byParameter"][parameter] = {
            "count": len(values),
            "avgValue": round(sum(values) / len(values), 2),
            "minValue": min(values),
            "maxValue": max(values)
        }
    
    return analytics

#Runs application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)