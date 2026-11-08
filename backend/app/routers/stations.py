from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import DesktopGamingSetup, GamingPlan
from app.schemas.schemas import StationOut

router = APIRouter(prefix="/stations", tags=["Stations"])

def map_setup_to_station(s: DesktopGamingSetup) -> StationOut:
    category = (s.SetupType or "PC").upper()
    zone = "Main Hall"
    if "PC" in category:
        zone = "PC Arena"
    elif "PS" in category or "CONSOLE" in category or "XBOX" in category:
        zone = "Console Lounge"
    elif "VR" in category or "SIM" in category or "VIP" in category:
        zone = "VIP Suite"

    status = "AVAILABLE" if (s.IsAvailable and s.IsActive) else "MAINTENANCE"

    return StationOut(
        id=s.Id,
        name=s.SetupName,
        category=category,
        specs=s.Specifications or f"{s.SetupType} Gaming Station",
        hourly_rate=float(s.HourlyRate),
        status=status,
        zone=zone
    )

@router.get("/plans")
def list_gaming_plans(db: Session = Depends(get_db)):
    """Pulls discounted rates and hourly pricing plans directly from the admin database!"""
    try:
        plans = db.query(GamingPlan).filter(GamingPlan.IsActive == True).all()
        return [
            {
                "id": p.Id,
                "title": p.Title,
                "duration_hours": float(p.DurationHours),
                "price": float(p.Price),
                "original_price": float(p.OriginalPrice),
                "discount_amount": max(0.0, float(p.OriginalPrice) - float(p.Price)),
                "target_setup_type": p.TargetSetupType,
                "badge_text": p.BadgeText,
                "is_popular": bool(p.IsPopular),
                "type": p.Type
            }
            for p in plans
        ]
    except Exception as e:
        return []

@router.get("/", response_model=List[StationOut])
def list_stations(db: Session = Depends(get_db)):
    # Pulls directly from the desktop software's GamingSetups table!
    setups = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.IsActive == True).order_by(DesktopGamingSetup.Id).all()
    return [map_setup_to_station(s) for s in setups]

@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    setup = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == station_id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Station not found")
    return map_setup_to_station(setup)
