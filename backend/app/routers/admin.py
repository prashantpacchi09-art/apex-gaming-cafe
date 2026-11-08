from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.models.models import (
    WebBookingModel,
    DesktopGamingSetup,
    WebUser,
    GamingPlan,
    DesktopCustomer,
    DesktopSession,
    WalletTransactionModel,
    CustomerPassModel,
)
from app.schemas.schemas import BookingOut
from app.routers.bookings import map_booking_to_out

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


# ==========================================
# 1. KPI DASHBOARD & STATS
# ==========================================
@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    today_str = datetime.now().strftime("%Y-%m-%d")

    total_stations = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.IsActive == True).count()
    total_customers = db.query(DesktopCustomer).count()

    # Active live sessions right now
    active_sessions = db.query(DesktopSession).filter(DesktopSession.IsCompleted == False).count()

    # Today's web bookings
    today_bookings = db.query(WebBookingModel).filter(WebBookingModel.BookingDate == today_str).all()
    today_bookings_count = len(today_bookings)
    web_revenue = sum(float(b.TotalAmount or 0) for b in today_bookings if b.Status != "CANCELLED")

    # Completed desktop sessions today
    today_desktop_sessions = db.query(DesktopSession).filter(
        DesktopSession.IsCompleted == True,
        DesktopSession.StartTime.like(f"{today_str}%")
    ).all()
    desktop_revenue = sum(float(s.TotalAmount or 0) for s in today_desktop_sessions)

    total_revenue = round(web_revenue + desktop_revenue, 2)

    return {
        "today_date": today_str,
        "total_stations": total_stations,
        "total_customers": total_customers,
        "active_sessions_count": active_sessions,
        "today_bookings_count": today_bookings_count,
        "today_revenue": total_revenue,
    }


# ==========================================
# 2. GAMING SETUPS (RIGS & STATIONS CONTROLLER)
# ==========================================
@router.get("/setups")
def get_all_setups(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    setups = db.query(DesktopGamingSetup).order_by(DesktopGamingSetup.Id).all()
    
    # Check for active running session on each rig
    active_sessions = db.query(DesktopSession).filter(DesktopSession.IsCompleted == False).all()
    active_session_map = {s.GamingSetupId: s for s in active_sessions}

    results = []
    for s in setups:
        active_sess = active_session_map.get(s.Id)
        sess_info = None
        if active_sess:
            customer = db.query(DesktopCustomer).filter(DesktopCustomer.Id == active_sess.CustomerId).first() if active_sess.CustomerId else None
            sess_info = {
                "session_id": active_sess.Id,
                "customer_name": customer.FullName if customer else "Walk-in Gamer",
                "start_time": active_sess.StartTime,
                "hourly_rate": float(active_sess.HourlyRate or s.HourlyRate or 0),
            }

        status = "IN_USE" if active_sess else ("AVAILABLE" if (s.IsAvailable and s.IsActive) else "MAINTENANCE")

        results.append({
            "id": s.Id,
            "name": s.SetupName,
            "setup_type": s.SetupType,
            "location": s.Location or "",
            "hourly_rate": float(s.HourlyRate or 0),
            "is_available": bool(s.IsAvailable),
            "is_active": bool(s.IsActive),
            "specifications": s.Specifications or f"{s.SetupType} Gaming Rig",
            "ip_address": s.IpAddress or "",
            "status": status,
            "active_session": sess_info,
        })
    return results


@router.post("/setups")
def create_setup(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    setup = DesktopGamingSetup(
        SetupName=payload.get("name", "New Station"),
        SetupType=payload.get("setup_type", "PC"),
        Location=payload.get("location", "Floor"),
        HourlyRate=float(payload.get("hourly_rate", 100)),
        IsAvailable=True,
        IsActive=True,
        Specifications=payload.get("specifications", ""),
        CreatedDate=datetime.now(),
    )
    db.add(setup)
    db.commit()
    db.refresh(setup)
    return {"message": "Station created successfully", "id": setup.Id}


@router.put("/setups/{setup_id}")
def update_setup(
    setup_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    setup = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == setup_id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Station not found")

    if "name" in payload: setup.SetupName = payload["name"]
    if "setup_type" in payload: setup.SetupType = payload["setup_type"]
    if "hourly_rate" in payload: setup.HourlyRate = float(payload["hourly_rate"])
    if "specifications" in payload: setup.Specifications = payload["specifications"]
    if "is_available" in payload: setup.IsAvailable = bool(payload["is_available"])
    if "is_active" in payload: setup.IsActive = bool(payload["is_active"])

    db.commit()
    return {"message": "Station updated successfully"}


@router.post("/setups/{setup_id}/toggle-status")
def toggle_setup_status(
    setup_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    setup = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == setup_id).first()
    if not setup:
        raise HTTPException(status_code=404, detail="Station not found")
    setup.IsAvailable = not setup.IsAvailable
    db.commit()
    return {"message": f"Station is now {'Available' if setup.IsAvailable else 'Under Maintenance'}"}


# ==========================================
# 3. LIVE GAMING SESSIONS (START, TIMER, BILL & END)
# ==========================================
@router.get("/sessions")
def get_sessions(
    active_only: bool = True,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    query = db.query(DesktopSession)
    if active_only:
        query = query.filter(DesktopSession.IsCompleted == False)
    sessions = query.order_by(DesktopSession.Id.desc()).limit(50).all()

    results = []
    now = datetime.now()

    for s in sessions:
        station = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == s.GamingSetupId).first()
        customer = db.query(DesktopCustomer).filter(DesktopCustomer.Id == s.CustomerId).first() if s.CustomerId else None

        # Calculate elapsed minutes
        elapsed_mins = 0
        try:
            start_dt = datetime.fromisoformat(s.StartTime.replace("Z", ""))
            elapsed_mins = max(0, int((now - start_dt).total_seconds() / 60))
        except Exception:
            pass

        hourly_rate = float(s.HourlyRate or (station.HourlyRate if station else 100))
        calculated_amount = round((elapsed_mins / 60.0) * hourly_rate, 2)
        total_amount = float(s.TotalAmount) if s.TotalAmount else calculated_amount

        results.append({
            "id": s.Id,
            "station_id": s.GamingSetupId,
            "station_name": station.SetupName if station else f"Station #{s.GamingSetupId}",
            "station_type": station.SetupType if station else "PC",
            "customer_id": s.CustomerId,
            "customer_name": customer.FullName if customer else "Walk-in Gamer",
            "customer_phone": customer.MobileNumber if customer else "",
            "start_time": s.StartTime,
            "end_time": s.EndTime or "",
            "hourly_rate": hourly_rate,
            "elapsed_minutes": elapsed_mins,
            "total_amount": total_amount,
            "is_completed": bool(s.IsCompleted),
            "remarks": s.Remarks or "",
        })
    return results


@router.post("/sessions/start")
def start_session(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    station_id = payload.get("station_id")
    customer_id = payload.get("customer_id")
    customer_name = payload.get("customer_name")
    remarks = payload.get("remarks", "")

    station = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    # Check if station already has active session
    existing_active = db.query(DesktopSession).filter(
        DesktopSession.GamingSetupId == station_id,
        DesktopSession.IsCompleted == False
    ).first()
    if existing_active:
        raise HTTPException(status_code=400, detail="This station already has an active session running!")

    # If customer name given but no customer id, find or create
    if not customer_id and customer_name:
        cust = db.query(DesktopCustomer).filter(DesktopCustomer.FullName == customer_name).first()
        if cust:
            customer_id = cust.Id
        else:
            cust = DesktopCustomer(
                FullName=customer_name,
                MobileNumber=payload.get("customer_phone", ""),
                WalletBalance="0",
                IsActive=True,
                CreatedDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
            db.add(cust)
            db.commit()
            db.refresh(cust)
            customer_id = cust.Id

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hourly_rate = float(payload.get("hourly_rate", station.HourlyRate or 100))

    session = DesktopSession(
        CustomerId=customer_id,
        GamingSetupId=station_id,
        StartTime=now_str,
        HourlyRate=str(hourly_rate),
        TotalAmount="0",
        IsCompleted=False,
        Remarks=remarks,
        CreatedDate=now_str
    )
    db.add(session)
    station.IsAvailable = False
    db.commit()
    db.refresh(session)

    return {"message": "Session started successfully", "session_id": session.Id}


@router.post("/sessions/{session_id}/end")
def end_session(
    session_id: int,
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    session = db.query(DesktopSession).filter(DesktopSession.Id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.IsCompleted:
        return {"message": "Session is already completed", "total_amount": session.TotalAmount}

    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    session.EndTime = now_str
    session.IsCompleted = True

    # Calculate final bill based on duration or override
    hourly_rate = float(session.HourlyRate or 100)
    try:
        start_dt = datetime.fromisoformat(session.StartTime.replace("Z", ""))
        mins = max(1, int((now - start_dt).total_seconds() / 60))
        calculated = round((mins / 60.0) * hourly_rate, 2)
    except Exception:
        calculated = hourly_rate

    final_amount = float(payload.get("final_amount", calculated))
    session.TotalAmount = str(final_amount)

    # Free the station
    station = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == session.GamingSetupId).first()
    if station:
        station.IsAvailable = True

    # Update customer total spent
    if session.CustomerId:
        cust = db.query(DesktopCustomer).filter(DesktopCustomer.Id == session.CustomerId).first()
        if cust:
            prev_spent = float(cust.TotalSpent or 0)
            cust.TotalSpent = str(round(prev_spent + final_amount, 2))

    db.commit()
    return {"message": "Session completed and billed", "total_amount": final_amount}


# ==========================================
# 4. CUSTOMERS & WALLET CONTROLLER
# ==========================================
@router.get("/customers")
def get_customers(
    search: str = "",
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    query = db.query(DesktopCustomer).filter(DesktopCustomer.IsActive == True)
    if search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (DesktopCustomer.FullName.like(term)) |
            (DesktopCustomer.MobileNumber.like(term)) |
            (DesktopCustomer.CustomerCode.like(term))
        )
    customers = query.order_by(DesktopCustomer.FullName.asc()).limit(100).all()

    return [
        {
            "id": c.Id,
            "code": c.CustomerCode or f"CUST-{c.Id}",
            "name": c.FullName,
            "mobile": c.MobileNumber or "",
            "email": c.Email or "",
            "wallet_balance": float(c.WalletBalance or 0),
            "reward_points": c.RewardPoints or 0,
            "total_hours": float(c.TotalHoursPlayed or 0),
            "total_spent": float(c.TotalSpent or 0),
            "notes": c.Notes or "",
            "active_plan_title": c.ActivePlanTitle,
            "active_plan_id": c.ActivePlanId,
            "pass_expiry_date": c.PassExpiryDate,
            "pass_duration_hours": float(c.PassDurationHours or 0),
            "pass_hours_used": float(c.PassTotalHoursUsed or 0),
            "pass_station_type": c.PassStationType or "",
            "pass_hours_remaining": max(0.0, float(c.PassDurationHours or 0) - float(c.PassTotalHoursUsed or 0)) if c.PassDurationHours else 0.0,
        }
        for c in customers
    ]


@router.post("/customers")
def create_customer(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    name = payload.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Customer name is required")

    cust = DesktopCustomer(
        CustomerCode=f"APX{datetime.now().strftime('%y%m%d%H%M')}",
        FullName=name,
        MobileNumber=payload.get("mobile", "").strip(),
        Email=payload.get("email", "").strip(),
        WalletBalance=str(float(payload.get("wallet_balance", 0))),
        IsActive=True,
        Notes=payload.get("notes", ""),
        CreatedDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)

    return {"message": "Customer registered successfully", "id": cust.Id}


@router.post("/customers/{customer_id}/wallet/topup")
def topup_wallet(
    customer_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    amount = float(payload.get("amount", 0))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    cust = db.query(DesktopCustomer).filter(DesktopCustomer.Id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    prev_bal = float(cust.WalletBalance or 0)
    new_bal = round(prev_bal + amount, 2)
    cust.WalletBalance = str(new_bal)

    # Record wallet transaction
    tx = WalletTransactionModel(
        CustomerId=customer_id,
        Amount=str(amount),
        TransactionType="Credit",
        Description=payload.get("description", "Mobile Admin Wallet Top-up"),
        TransactionDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(tx)
    db.commit()

    return {"message": "Wallet topped up successfully", "new_balance": new_bal}


@router.post("/customers/{customer_id}/recharge-plan")
def recharge_customer_plan(
    customer_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    plan_id = payload.get("plan_id")
    payment_method = payload.get("payment_method", "Cash") # Cash, UPI, Wallet, Card

    customer = db.query(DesktopCustomer).filter(DesktopCustomer.Id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    plan = db.query(GamingPlan).filter(GamingPlan.Id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Gaming plan not found")

    price_paid = float(payload.get("price", plan.Price))

    # Check wallet if paid via wallet
    current_wallet = float(customer.WalletBalance or 0)
    if "WALLET" in payment_method.upper():
        if current_wallet < price_paid:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient wallet balance. Available: ₹{current_wallet}, Required: ₹{price_paid}"
            )
        customer.WalletBalance = str(round(current_wallet - price_paid, 2))
        tx = WalletTransactionModel(
            CustomerId=customer_id,
            Amount=str(price_paid),
            TransactionType="Debit",
            Description=f"Plan Recharge: {plan.Title}",
            TransactionDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(tx)

    # Calculate validity & start/end dates
    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    validity_days = plan.ValidityDays if (plan.ValidityDays and plan.ValidityDays > 0) else 30
    expiry = now + timedelta(days=validity_days)
    expiry_str = expiry.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Create persistent CustomerPass record in CustomerPasses table (matches Desktop Db)
    new_pass = CustomerPassModel(
        CustomerId=customer_id,
        PlanId=plan.Id,
        PlanTitle=plan.Title,
        StationType=plan.TargetSetupType or "All",
        PricePaid=price_paid,
        PaymentMethod=payment_method,
        IsFullDayPass=False,
        StartDate=now_str,
        ExpiryDate=expiry_str,
        ValidityDays=validity_days,
        DailyHoursLimit=0.0,
        TotalDurationHours=float(plan.DurationHours or 0),
        HoursUsedToday=0.0,
        LastUsedDate=None,
        Status="Active",
        CreatedDate=now_str,
        TotalHoursUsed=0.0
    )
    db.add(new_pass)

    # 2. Update Customer snapshot fields (matches C# MembershipPassService)
    customer.ActivePlanTitle = plan.Title
    customer.ActivePlanId = plan.Id
    customer.PassActivatedDate = now_str
    customer.PassExpiryDate = expiry_str
    customer.PassDurationHours = float(plan.DurationHours or 0)
    customer.PassStationType = plan.TargetSetupType or "All"
    customer.PassPricePaid = str(price_paid)
    customer.PassPaymentMethod = payment_method
    customer.PassTotalHoursUsed = 0.0

    # Increment total spent
    prev_spent = float(customer.TotalSpent or 0)
    customer.TotalSpent = str(round(prev_spent + price_paid, 2))

    db.commit()

    return {
        "message": f"Successfully recharged {customer.FullName} with {plan.Title}!",
        "plan_title": plan.Title,
        "duration_hours": plan.DurationHours,
        "expiry_date": expiry_str,
        "remaining_wallet": customer.WalletBalance
    }


@router.get("/customers/{customer_id}/passes")
def get_customer_passes(
    customer_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    passes = db.query(CustomerPassModel).filter(
        CustomerPassModel.CustomerId == customer_id
    ).order_by(CustomerPassModel.Id.desc()).all()

    return [
        {
            "id": p.Id,
            "plan_title": p.PlanTitle,
            "station_type": p.StationType,
            "price_paid": p.PricePaid,
            "payment_method": p.PaymentMethod,
            "start_date": p.StartDate,
            "expiry_date": p.ExpiryDate,
            "validity_days": p.ValidityDays,
            "total_duration_hours": p.TotalDurationHours,
            "hours_used": p.TotalHoursUsed,
            "status": p.Status,
        }
        for p in passes
    ]


# ==========================================
# 5. GAMING PLANS & OFFERS (PRICING DISCOUNTS)
# ==========================================
@router.get("/plans")
def get_plans(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    plans = db.query(GamingPlan).order_by(GamingPlan.Id).all()
    return [
        {
            "id": p.Id,
            "title": p.Title,
            "description": p.Description or "",
            "type": p.Type,
            "price": float(p.Price),
            "original_price": float(p.OriginalPrice),
            "discount_amount": max(0.0, float(p.OriginalPrice) - float(p.Price)),
            "duration_hours": float(p.DurationHours),
            "target_setup_type": p.TargetSetupType or "All",
            "is_popular": bool(p.IsPopular),
            "is_active": bool(p.IsActive),
            "badge_text": p.BadgeText or "",
        }
        for p in plans
    ]


@router.post("/plans")
def create_plan(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    plan = GamingPlan(
        Title=payload.get("title", "Gaming Pass"),
        Description=payload.get("description", ""),
        Type=int(payload.get("type", 0)),
        Price=float(payload.get("price", 100)),
        OriginalPrice=float(payload.get("original_price", 100)),
        DurationHours=float(payload.get("duration_hours", 1)),
        TargetSetupType=payload.get("target_setup_type", "PC"),
        IsPopular=bool(payload.get("is_popular", False)),
        IsActive=True,
        BadgeText=payload.get("badge_text", ""),
        CreatedAt=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"message": "Plan added successfully", "id": plan.Id}


@router.put("/plans/{plan_id}")
def update_plan(
    plan_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    plan = db.query(GamingPlan).filter(GamingPlan.Id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if "title" in payload: plan.Title = payload["title"]
    if "price" in payload: plan.Price = float(payload["price"])
    if "original_price" in payload: plan.OriginalPrice = float(payload["original_price"])
    if "duration_hours" in payload: plan.DurationHours = float(payload["duration_hours"])
    if "target_setup_type" in payload: plan.TargetSetupType = payload["target_setup_type"]
    if "is_popular" in payload: plan.IsPopular = bool(payload["is_popular"])
    if "is_active" in payload: plan.IsActive = bool(payload["is_active"])
    if "badge_text" in payload: plan.BadgeText = payload["badge_text"]

    db.commit()
    return {"message": "Plan updated successfully"}


# ==========================================
# 6. ONLINE BOOKINGS & CHECK-IN DESK
# ==========================================
@router.get("/bookings", response_model=List[BookingOut])
def get_all_bookings(
    date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    query = db.query(WebBookingModel)
    if date:
        query = query.filter(WebBookingModel.BookingDate == date)
    if status:
        query = query.filter(WebBookingModel.Status == status)
    bookings = query.order_by(WebBookingModel.BookingDate.desc(), WebBookingModel.StartTime.asc()).all()
    return [map_booking_to_out(b) for b in bookings]


@router.post("/bookings/{booking_id}/checkin")
def checkin_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    booking = db.query(WebBookingModel).filter(WebBookingModel.Id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.Status = "CHECKED_IN"

    # Automatically start an active session on the assigned setup!
    station = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == booking.GamingSetupId).first()
    if station:
        station.IsAvailable = False

    # Find customer or create
    cust = db.query(DesktopCustomer).filter(
        (DesktopCustomer.FullName == booking.CustomerName) |
        (DesktopCustomer.MobileNumber == booking.CustomerPhone)
    ).first()
    cust_id = cust.Id if cust else None

    new_session = DesktopSession(
        CustomerId=cust_id,
        GamingSetupId=booking.GamingSetupId,
        StartTime=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        HourlyRate=str(station.HourlyRate if station else 100),
        TotalAmount=str(booking.TotalAmount),
        IsCompleted=False,
        Remarks=f"Online Reservation {booking.BookingCode}",
        CreatedDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_session)
    db.commit()

    return {"message": f"Customer checked in and session started on station {station.SetupName if station else ''}!"}


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user)
):
    booking = db.query(WebBookingModel).filter(WebBookingModel.Id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.Status = status.upper()
    db.commit()
    return {"message": f"Booking status updated to {booking.Status}"}


# ==========================================
# 7. FINANCIAL & OPERATIONAL REPORTS
# ==========================================
@router.get("/reports/summary")
def get_reports_summary(db: Session = Depends(get_db), admin=Depends(get_current_admin_user)):
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    month_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")

    # Completed sessions
    all_sessions = db.query(DesktopSession).filter(DesktopSession.IsCompleted == True).all()

    today_rev = sum(float(s.TotalAmount or 0) for s in all_sessions if (s.StartTime or "").startswith(today_str))
    week_rev = sum(float(s.TotalAmount or 0) for s in all_sessions if (s.StartTime or "") >= week_ago)
    month_rev = sum(float(s.TotalAmount or 0) for s in all_sessions if (s.StartTime or "") >= month_ago)

    # Station utilization
    setups = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.IsActive == True).all()
    active_sessions = db.query(DesktopSession).filter(DesktopSession.IsCompleted == False).count()

    return {
        "today_revenue": round(today_rev, 2),
        "week_revenue": round(week_rev, 2),
        "month_revenue": round(month_rev, 2),
        "total_completed_sessions": len(all_sessions),
        "active_rigs": active_sessions,
        "total_rigs": len(setups),
        "occupancy_percent": round((active_sessions / len(setups) * 100) if setups else 0, 1),
    }
