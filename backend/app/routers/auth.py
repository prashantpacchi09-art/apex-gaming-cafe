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

@router.get("/smtp-test")
def smtp_test(test_email: str = "prashvg615@gmail.com"):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_user = os.getenv("SMTP_USER", "prashvg615@gmail.com").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "xtbpppxaomznwkcb").strip().replace(" ", "")

    results = {
        "smtp_host": smtp_host,
        "smtp_user": smtp_user,
        "password_configured": bool(smtp_pass),
        "port_587": None,
        "port_465": None
    }

    # Test Port 587
    try:
        with smtplib.SMTP(smtp_host, 587, timeout=12) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            results["port_587"] = "CONNECTED_AND_AUTHENTICATED"
    except Exception as e:
        results["port_587"] = f"ERROR: {e}"

    # Test Port 465
    try:
        with smtplib.SMTP_SSL(smtp_host, 465, timeout=12) as server:
            server.login(smtp_user, smtp_pass)
            results["port_465"] = "CONNECTED_AND_AUTHENTICATED"
    except Exception as e:
        results["port_465"] = f"ERROR: {e}"

    return results

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    email = req.email.strip().lower()
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    _otp_store[email] = {
        "code": code,
        "expires_at": expires_at
    }

    email_sent = False
    last_error = ""

    # 1. Try Resend HTTPS REST API (Port 443 - Works seamlessly on Cloud/Render)
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    if resend_api_key:
        try:
            import json
            import urllib.request
            resend_payload = json.dumps({
                "from": "Apex Gaming Cafe <onboarding@resend.dev>",
                "to": [email],
                "subject": f"🔐 {code} is your Apex Gaming Cafe Verification Code",
                "html": f"""
                <div style='font-family: Arial, sans-serif; background: #0d0e16; color: #fff; padding: 25px; border-radius: 12px; border: 1px solid #10b981; max-width: 480px;'>
                    <h2 style='color: #10b981; margin: 0 0 10px 0;'>⚡ APEX GAMING CAFE</h2>
                    <p style='color: #cbd5e1; font-size: 14px;'>Use the one-time code below to verify your account:</p>
                    <div style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10b981; background: #1a1b2e; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 15px 0;'>
                        {code}
                    </div>
                    <p style='color: #94a3b8; font-size: 12px;'>Valid for 15 minutes. Never share this code with anyone.</p>
                </div>
                """
            }).encode('utf-8')
            resend_req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=resend_payload,
                headers={"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(resend_req, timeout=8) as resp:
                if resp.status in (200, 201):
                    email_sent = True
                    print(f"[Resend HTTPS OTP Sent] -> {email}")
        except Exception as e:
            last_error = f"Resend error: {e}"
            print(f"[Resend Email Error]: {e}")

    # 2. Fallback to Gmail SMTP (if raw socket outbound is open)
    if not email_sent:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_user = os.getenv("SMTP_USER", "prashvg615@gmail.com").strip()
        smtp_pass = os.getenv("SMTP_PASSWORD", "xtbpppxaomznwkcb").strip().replace(" ", "")

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

                try:
                    with smtplib.SMTP(smtp_host, 587, timeout=3) as server:
                        server.starttls()
                        server.login(smtp_user, smtp_pass)
                        server.send_message(msg)
                    email_sent = True
                except Exception as e1:
                    last_error = str(e1)
                    try:
                        with smtplib.SMTP_SSL(smtp_host, 465, timeout=3) as server:
                            server.login(smtp_user, smtp_pass)
                            server.send_message(msg)
                        email_sent = True
                    except Exception as e2:
                        last_error = str(e2)
            except Exception as e:
                last_error = str(e)

    # Secure response: Never expose OTP on screen in production
    return {
        "status": "success" if email_sent else "pending",
        "email_sent": email_sent,
        "message": f"Verification code sent to {email}. Check your inbox or spam folder." if email_sent else f"Email delivery in progress to {email}.",
        "error_detail": last_error if not email_sent else None
    }

@router.post("/verify-otp", response_model=Token)
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    otp_data = _otp_store.get(email)

    valid = False
    if otp_data and otp_data["code"] == req.otp.strip():
        if datetime.utcnow() <= otp_data["expires_at"]:
            valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your email and try again."
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

    # Sync into Desktop Customers table for desk software recognition
    try:
        cust = db.query(DesktopCustomer).filter(DesktopCustomer.Email == user.Email).first()
        if not cust:
            code_num = db.query(DesktopCustomer).count() + 101
            cust = DesktopCustomer(
                CustomerCode=f"CUST-{code_num}",
                FullName=user.FullName,
                MobileNumber=user.Phone or "",
                Email=user.Email,
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
        print(f"[Desktop Customer Sync Warning on Register]: {e}")

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
