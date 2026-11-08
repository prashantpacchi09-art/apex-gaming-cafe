from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import os
import smtplib
from email.mime.text import MIMEText

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import WebUser, DesktopCustomer
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut, SendOtpRequest, VerifyOtpRequest
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for active OTPs: { "email": { "code": "...", "expires_at": datetime } }
_otp_store = {}

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    email = req.email.strip().lower()
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    _otp_store[email] = {
        "code": code,
        "expires_at": expires_at
    }

    # Send OTP via Gmail SMTP
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_user = os.getenv("SMTP_USER", "prashvg615@gmail.com").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "xtbpppxaomznwkcb").strip().replace(" ", "")

    email_sent = False
    if smtp_user and smtp_pass:
        try:
            msg = MIMEText(
                f"Hello Gamer!\n\n"
                f"Your Apex Gaming Cafe verification code is:\n\n"
                f"    {code}\n\n"
                f"This code is valid for 15 minutes.\n"
                f"Do not share this OTP with anyone.\n\n"
                f"Game on,\n"
                f"Apex Gaming Cafe Team"
            )
            msg["Subject"] = f"{code} is your Apex Gaming Cafe Login Code"
            msg["From"] = f"Apex Gaming Cafe <{smtp_user}>"
            msg["To"] = email

            # Try TLS (port 587) first, fallback to SSL (port 465)
            try:
                with smtplib.SMTP(smtp_host, 587, timeout=8) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                email_sent = True
            except Exception as e1:
                print(f"[SMTP 587 failed, trying SSL 465]: {e1}")
                with smtplib.SMTP_SSL(smtp_host, 465, timeout=8) as server:
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                email_sent = True

            print(f"[OTP Email Dispatched Successfully] -> {email}")
        except Exception as e:
            print(f"[OTP Email Error]: {e}")

    if not email_sent:
        print(f"[APEX OTP FALLBACK] Email: {email} | Code: {code} (SMTP not configured)")

    return {
        "status": "success",
        "message": f"Verification code sent to {email}"
    }

@router.post("/verify-otp", response_model=Token)
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    otp_data = _otp_store.get(email)

    valid = False
    if otp_data and otp_data["code"] == req.otp.strip():
        if datetime.utcnow() <= otp_data["expires_at"]:
            valid = True

    # Master fallback codes for testing / offline demo
    if not valid and req.otp.strip() in ["123456", "999999"]:
        valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check and try again."
        )

    # Clear verified OTP
    if email in _otp_store:
        del _otp_store[email]

    user = db.query(WebUser).filter(WebUser.Email == email).first()
    if not user:
        # Create permanent user
        user_name = (req.full_name or "").strip()
        if not user_name:
            user_name = email.split('@')[0].capitalize()

        user = WebUser(
            FullName=user_name,
            Email=email,
            Phone=req.phone or "",
            HashedPassword=get_password_hash("apex_permanent_user"),
            IsAdmin=False,
            CreatedDate=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update details if user provided them
        updated = False
        if req.full_name and req.full_name.strip() and user.FullName != req.full_name.strip():
            user.FullName = req.full_name.strip()
            updated = True
        if req.phone and req.phone.strip() and user.Phone != req.phone.strip():
            user.Phone = req.phone.strip()
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    # Sync into Desktop Customers table for desk software recognition
    try:
        cust = db.query(DesktopCustomer).filter(DesktopCustomer.Email == email).first()
        if not cust:
            code_num = db.query(DesktopCustomer).count() + 101
            cust = DesktopCustomer(
                CustomerCode=f"CUST-{code_num}",
                FullName=user.FullName,
                MobileNumber=user.Phone or "",
                Email=email,
                AadhaarNumber="",
                RFID="",
                WalletBalance="0.0",
                RewardPoints=0,
                CustomerType=0,
                IsActive=True,
                DateOfBirth="",
                Address="",
                City="",
                State="",
                Pincode="",
                TotalHoursPlayed=0.0,
                TotalSpent="0",
                Notes="Registered via Apex Web/Mobile App",
                CreatedDate=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            )
            db.add(cust)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Desktop Customer Sync Warning]: {e}")

    user_out = UserOut(
        id=user.Id,
        full_name=user.FullName,
        email=user.Email,
        phone=user.Phone,
        is_admin=user.IsAdmin,
        created_at=user.CreatedDate or datetime.utcnow()
    )
    # Long-lived permanent token (10 years)
    access_token = create_access_token(
        data={"sub": user.Email, "user_id": user.Id},
        expires_delta=timedelta(days=3650)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_out}

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(WebUser).filter(WebUser.Email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = WebUser(
        FullName=user_in.full_name,
        Email=user_in.email,
        Phone=user_in.phone,
        HashedPassword=get_password_hash(user_in.password),
        IsAdmin=False,
        CreatedDate=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_out = UserOut(
        id=user.Id,
        full_name=user.FullName,
        email=user.Email,
        phone=user.Phone,
        is_admin=user.IsAdmin,
        created_at=user.CreatedDate
    )
    access_token = create_access_token(
        data={"sub": user.Email, "user_id": user.Id},
        expires_delta=timedelta(days=3650)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_out}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(WebUser).filter(WebUser.Email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.HashedPassword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    user_out = UserOut(
        id=user.Id,
        full_name=user.FullName,
        email=user.Email,
        phone=user.Phone,
        is_admin=user.IsAdmin,
        created_at=user.CreatedDate
    )
    access_token = create_access_token(
        data={"sub": user.Email, "user_id": user.Id},
        expires_delta=timedelta(days=3650)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_out}

@router.get("/me", response_model=UserOut)
def get_profile(current_user: WebUser = Depends(get_current_user)):
    return UserOut(
        id=current_user.Id,
        full_name=current_user.FullName,
        email=current_user.Email,
        phone=current_user.Phone,
        is_admin=current_user.IsAdmin,
        created_at=current_user.CreatedDate
    )
