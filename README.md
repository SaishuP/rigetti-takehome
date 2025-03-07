# Rigetti-TakeHome Fridge Monitoring App

This is a full stack application to monitor and analyze different paramaters of different fridges. It includes a FASTAPI backed and a React frontend and has features like filtering, pagination, and real-time data updates using websockets.

## Features

- **View Fridge Data**: Displays a table of fridge instrument parameters.
- **Filtering**: Users can filter by fridge ID, instrument name, and parameter name.
- **Infinite Scroll**: Supports server-side pagination for historical data.
- **Live Mode**: Real-time data updates due to WebSockets.
- **Analytics**: Statistics based on different fridge parameters.

## Tech Stack

- **Backend**: FastAPI (Python), Uvicorn, WebSockets
- **Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **Database**: In-memory storage (for simplicity)
- **API Communication**: REST API & WebSockets

---

## Setup

### 1. Clone the repo
git clone https://github.com/SaishuP/rigetti-takehome
cd rigetti-takehome

### 2. Create a Virtual Environment
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows, use: venv\Scripts\activate

### 3. Install the dependencies
    pip install -r requirements.txt

### 4. Start the backend server
    python3 main.py

### 5. Start the frontend server
    Open a new terminal
    cd frontend
    npm install
    npm run dev

### 6. Open the app
    Visit http://localhost:3000 in your browser

---