from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.database import Base, engine
from app.routers import auth, stations, bookings, admin
from seed import seed_database

# Create tables and seed initial stations/demo users
seed_database()

app = FastAPI(
    title="Apex Gaming Cafe - Booking API",
    description="Backend API for customer slot booking, interactive floor layout, and admin management.",
    version="1.0.0"
)

# Enable CORS for React frontend (localhost / local network)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register sub-routers
app.include_router(auth.router, prefix="/api")
app.include_router(stations.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Apex Gaming Cafe Slot Booking API",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
