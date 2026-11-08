from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class WebUser(Base):
    """Web customer authentication table"""
    __tablename__ = "WebUsers"

    Id = Column(Integer, primary_key=True, index=True)
    FullName = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True, index=True, nullable=False)
    Phone = Column(String(20), index=True, nullable=True)
    HashedPassword = Column(String(255), nullable=False)
    IsAdmin = Column(Boolean, default=False)
    CreatedDate = Column(DateTime, default=datetime.utcnow)


class DesktopGamingSetup(Base):
    """Directly maps to the existing Desktop GamingSetups table!"""
    __tablename__ = "GamingSetups"

    Id = Column(Integer, primary_key=True, index=True)
    SetupName = Column(String(50), nullable=False)
    SetupType = Column(String(30), nullable=False) # PC, PS5, PS4, VR, etc.
    Location = Column(String(100), nullable=True)
    HourlyRate = Column(Float, nullable=False, default=100.0)
    IsAvailable = Column(Boolean, default=True)
    IsActive = Column(Boolean, default=True)
    Specifications = Column(String(500), nullable=True)
    ClientId = Column(String(50), nullable=True)
    IpAddress = Column(String(50), nullable=True)
    MacAddress = Column(String(50), nullable=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    web_bookings = relationship("WebBookingModel", back_populates="setup")


class WebBookingModel(Base):
    """Directly maps to the WebBookings table shared with C# desktop app!"""
    __tablename__ = "WebBookings"

    Id = Column(Integer, primary_key=True, index=True)
    BookingCode = Column(String(30), unique=True, index=True, nullable=False)
    CustomerName = Column(String(100), nullable=False)
    CustomerPhone = Column(String(50), nullable=True)
    CustomerEmail = Column(String(100), nullable=True)
    
    GamingSetupId = Column(Integer, ForeignKey("GamingSetups.Id"), nullable=False)
    BookingDate = Column(String(20), nullable=False) # YYYY-MM-DD
    StartTime = Column(String(10), nullable=False) # HH:MM
    EndTime = Column(String(10), nullable=False) # HH:MM
    DurationHours = Column(Float, nullable=False)
    TotalAmount = Column(Float, nullable=False)
    Status = Column(String(30), default="CONFIRMED") # CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED
    Remarks = Column(String(500), nullable=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    setup = relationship("DesktopGamingSetup", back_populates="web_bookings")


class GamingPlan(Base):
    """Maps directly to the admin/desktop GamingPlans table!"""
    __tablename__ = "GamingPlans"

    Id = Column(Integer, primary_key=True, index=True)
    Title = Column(String(100), nullable=False)
    Description = Column(String(500), nullable=True)
    Type = Column(Integer, default=0) # 0 = Hourly / Consecutive, 1 = Anytime package
    Price = Column(Float, nullable=False)
    OriginalPrice = Column(Float, nullable=False)
    DurationHours = Column(Float, nullable=False)
    ValidityDays = Column(Integer, nullable=True)
    TargetSetupType = Column(String(50), nullable=True)
    IsPopular = Column(Boolean, default=False)
    IsActive = Column(Boolean, default=True)
    BadgeText = Column(String(50), nullable=True)
    CreatedAt = Column(String(50), nullable=True)


class DesktopCustomer(Base):
    """Directly maps to the Desktop Customers table!"""
    __tablename__ = "Customers"

    Id = Column(Integer, primary_key=True, index=True)
    CustomerCode = Column(String(50), nullable=True)
    FullName = Column(String(100), nullable=False)
    MobileNumber = Column(String(30), index=True, nullable=True)
    Email = Column(String(100), nullable=True)
    AadhaarNumber = Column(String(50), default="")
    RFID = Column(String(50), default="")
    WalletBalance = Column(String(50), default="0")
    RewardPoints = Column(Integer, default=0)
    CustomerType = Column(Integer, default=0)
    IsActive = Column(Boolean, default=True)
    DateOfBirth = Column(String(50), default="")
    Address = Column(String(200), default="")
    City = Column(String(100), default="")
    State = Column(String(100), default="")
    Pincode = Column(String(50), default="")
    TotalHoursPlayed = Column(Float, default=0.0)
    TotalSpent = Column(String(50), default="0")
    Notes = Column(String(500), default="")
    CreatedDate = Column(String(50), nullable=True)

    # Active Gaming Plan / Membership snapshot
    ActivePlanTitle = Column(String(100), nullable=True)
    ActivePlanId = Column(Integer, nullable=True)
    PassActivatedDate = Column(String(50), nullable=True)
    PassExpiryDate = Column(String(50), nullable=True)
    PassDurationHours = Column(Float, nullable=True)
    PassDailyHoursLimit = Column(Float, nullable=True)
    PassHoursUsedToday = Column(Float, nullable=True)
    PassStationType = Column(String(50), nullable=True)
    PassPricePaid = Column(String(50), nullable=True)
    PassPaymentMethod = Column(String(50), nullable=True)
    PassTotalHoursUsed = Column(Float, default=0.0)


class CustomerPassModel(Base):
    """Directly maps to the Desktop CustomerPasses table for multi-pass tracking!"""
    __tablename__ = "CustomerPasses"

    Id = Column(Integer, primary_key=True, index=True)
    CustomerId = Column(Integer, ForeignKey("Customers.Id"), nullable=False)
    PlanId = Column(Integer, ForeignKey("GamingPlans.Id"), nullable=True)
    PlanTitle = Column(String(100), nullable=False)
    StationType = Column(String(50), nullable=True)
    PricePaid = Column(Float, nullable=False)
    PaymentMethod = Column(String(50), default="Cash")
    IsFullDayPass = Column(Boolean, default=False)
    StartDate = Column(String(50), nullable=False)
    ExpiryDate = Column(String(50), nullable=False)
    ValidityDays = Column(Integer, default=30)
    DailyHoursLimit = Column(Float, default=0.0)
    TotalDurationHours = Column(Float, default=0.0)
    HoursUsedToday = Column(Float, default=0.0)
    LastUsedDate = Column(String(50), nullable=True)
    Status = Column(String(50), default="Active")
    CreatedDate = Column(String(50), nullable=False)
    TotalHoursUsed = Column(Float, default=0.0)



class DesktopSession(Base):
    """Directly maps to the Desktop Sessions table!"""
    __tablename__ = "Sessions"

    Id = Column(Integer, primary_key=True, index=True)
    CustomerId = Column(Integer, ForeignKey("Customers.Id"), nullable=True)
    GamingSetupId = Column(Integer, ForeignKey("GamingSetups.Id"), nullable=False)
    StartTime = Column(String(50), nullable=False)
    EndTime = Column(String(50), nullable=True)
    HourlyRate = Column(String(50), nullable=True)
    TotalAmount = Column(String(50), nullable=True)
    IsCompleted = Column(Boolean, default=False)
    Remarks = Column(String(500), nullable=True)
    CreatedDate = Column(String(50), nullable=True)


class WalletTransactionModel(Base):
    """Directly maps to the Desktop WalletTransactions table!"""
    __tablename__ = "WalletTransactions"

    Id = Column(Integer, primary_key=True, index=True)
    CustomerId = Column(Integer, ForeignKey("Customers.Id"), nullable=False)
    Amount = Column(String(50), nullable=False)
    TransactionType = Column(String(50), nullable=False) # Credit, Debit
    Description = Column(String(200), nullable=True)
    TransactionDate = Column(String(50), nullable=True)

