from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class StationOut(BaseModel):
    id: int
    name: str
    category: str
    specs: Optional[str] = None
    hourly_rate: float
    status: str
    zone: Optional[str] = "Main Hall"

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    station_id: int
    date: str # YYYY-MM-DD
    start_time: str # HH:MM
    duration_hours: float
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    booking_code: str
    customer_name: str
    customer_email: Optional[str]
    customer_phone: Optional[str]
    station_id: int
    date: str
    start_time: str
    end_time: str
    duration_hours: float
    total_amount: float
    status: str
    notes: Optional[str]
    created_at: datetime
    station: Optional[StationOut] = None

    class Config:
        from_attributes = True
