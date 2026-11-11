from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import string

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import WebBookingModel, DesktopGamingSetup, WebUser, GamingPlan
from app.schemas.schemas import BookingCreate, BookingOut, StationOut
from app.routers.stations import map_setup_to_station

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_booking_code():
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=6))
    return f"APEX-{suffix}"

def time_to_minutes(time_str: str) -> int:
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes: int) -> str:
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def map_booking_to_out(b: WebBookingModel) -> BookingOut:
    station_out = map_setup_to_station(b.setup) if b.setup else None
    return BookingOut(
        id=b.Id,
        booking_code=b.BookingCode,
        customer_name=b.CustomerName,
        customer_email=b.CustomerEmail,
        customer_phone=b.CustomerPhone,
        station_id=b.GamingSetupId,
        date=b.BookingDate,
        start_time=b.StartTime,
        end_time=b.EndTime,
        duration_hours=float(b.DurationHours),
        total_amount=float(b.TotalAmount),
        status=b.Status,
        notes=b.Remarks,
        created_at=b.CreatedDate,
        station=station_out
    )

@router.get("/availability")
def get_availability(date: str, station_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WebBookingModel).filter(
        WebBookingModel.BookingDate == date,
        WebBookingModel.Status.in_(["CONFIRMED", "CHECKED_IN"])
    )
    if station_id:
        query = query.filter(WebBookingModel.GamingSetupId == station_id)
    
    bookings = query.all()
    return [
        {
            "id": b.Id,
            "station_id": b.GamingSetupId,
            "date": b.BookingDate,
            "start_time": b.StartTime,
            "end_time": b.EndTime,
            "status": b.Status
        }
        for b in bookings
    ]

@router.post("/", response_model=BookingOut)
def create_booking(booking_in: BookingCreate, db: Session = Depends(get_db), current_user: WebUser = Depends(get_current_user)):
    # 1. Fetch Station directly from Desktop's GamingSetups
    setup = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == booking_in.station_id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Station not found")
    if not setup.IsAvailable or not setup.IsActive:
        raise HTTPException(status_code=400, detail="Station is currently unavailable or under maintenance")

    # 2. End Time calculation
    start_mins = time_to_minutes(booking_in.start_time)
    duration_mins = int(booking_in.duration_hours * 60)
    end_mins = start_mins + duration_mins
    end_time = minutes_to_time(end_mins)

    # 3. Collision avoidance
    conflicts = db.query(WebBookingModel).filter(
        WebBookingModel.GamingSetupId == booking_in.station_id,
        WebBookingModel.BookingDate == booking_in.date,
        WebBookingModel.Status.in_(["CONFIRMED", "CHECKED_IN"])
    ).all()

    for c in conflicts:
        c_start = time_to_minutes(c.StartTime)
        c_end = time_to_minutes(c.EndTime)
        if start_mins < c_end and end_mins > c_start:
            raise HTTPException(
                status_code=400,
                detail=f"Time slot overlaps with an existing booking ({c.StartTime} - {c.EndTime}) on this station."
            )

    # 4. Total Amount (With official Admin GamingPlan Discount)
    standard_total = round(booking_in.duration_hours * float(setup.HourlyRate), 2)
    total_amount = standard_total
    try:
        applicable_plans = db.query(GamingPlan).filter(
            GamingPlan.IsActive == True,
            GamingPlan.DurationHours == booking_in.duration_hours,
            GamingPlan.Type == 0
        ).all()
        best_plan = None
        for p in applicable_plans:
            target = (p.TargetSetupType or "").upper().strip()
            stype = (setup.SetupType or "").upper().strip()
            if target == stype or target in stype or stype in target:
                if abs(float(p.OriginalPrice) - standard_total) < 1.0:
                    best_plan = p
                    break
                elif best_plan is None:
                    best_plan = p
        if best_plan:
            total_amount = round(float(best_plan.Price), 2)
    except Exception:
        pass

    # 5. Insert into shared WebBookings table!
    booking = WebBookingModel(
        BookingCode=generate_booking_code(),
        CustomerName=current_user.FullName,
        CustomerEmail=current_user.Email,
        CustomerPhone=current_user.Phone or "",
        GamingSetupId=booking_in.station_id,
        BookingDate=booking_in.date,
        StartTime=booking_in.start_time,
        EndTime=end_time,
        DurationHours=booking_in.duration_hours,
        TotalAmount=total_amount,
        Status="CONFIRMED",
        Remarks=booking_in.notes or ""
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return map_booking_to_out(booking)

@router.get("/desktop-feed")
def get_desktop_feed(db: Session = Depends(get_db)):
    """
    Public feed endpoint for Desktop Windows POS / Management software
    to pull all incoming online slot reservations and synchronize locally.
    """
    bookings = db.query(WebBookingModel).order_by(WebBookingModel.BookingDate.desc(), WebBookingModel.StartTime.asc()).all()
    feed = []
    for b in bookings:
        station_name = b.setup.SetupName if b.setup else f"Station #{b.GamingSetupId}"
        station_type = b.setup.SetupType if b.setup else "PC"
        feed.append({
            "id": b.Id,
            "booking_code": b.BookingCode,
            "customer_name": b.CustomerName,
            "customer_email": b.CustomerEmail or "",
            "customer_phone": b.CustomerPhone or "",
            "station_id": b.GamingSetupId,
            "station_name": station_name,
            "station_type": station_type,
            "date": b.BookingDate,
            "start_time": b.StartTime,
            "end_time": b.EndTime,
            "duration_hours": float(b.DurationHours),
            "total_amount": float(b.TotalAmount),
            "status": b.Status,
            "notes": b.Remarks or "",
            "created_at": b.CreatedDate.isoformat() if b.CreatedDate else ""
        })
    return feed

@router.post("/{booking_code}/desktop-status")
def update_desktop_status(booking_code: str, status_update: dict, db: Session = Depends(get_db)):
    """
    Endpoint for desktop app to update status when customer checks in or cancels.
    """
    new_status = status_update.get("status", "CHECKED_IN")
    booking = db.query(WebBookingModel).filter(WebBookingModel.BookingCode == booking_code.strip().upper()).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.Status = new_status
    db.commit()
    return {"status": "success", "booking_code": booking.BookingCode, "new_status": booking.Status}

@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(db: Session = Depends(get_db), current_user: WebUser = Depends(get_current_user)):
    bookings = db.query(WebBookingModel).filter(
        WebBookingModel.CustomerEmail == current_user.Email
    ).order_by(WebBookingModel.CreatedDate.desc()).all()
    return [map_booking_to_out(b) for b in bookings]

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user: WebUser = Depends(get_current_user)):
    booking = db.query(WebBookingModel).filter(WebBookingModel.Id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if not current_user.IsAdmin and booking.CustomerEmail != current_user.Email:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    booking.Status = "CANCELLED"
    db.commit()
    return {"message": "Booking successfully cancelled", "status": booking.Status}
