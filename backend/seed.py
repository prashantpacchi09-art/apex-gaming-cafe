from app.core.database import SessionLocal, Base, engine
from app.models.models import WebUser, DesktopGamingSetup, GamingPlan
from app.core.security import get_password_hash
from datetime import datetime

DEFAULT_SETUPS = [
    {"SetupName": "PC-01 (RX 7600)", "SetupType": "PC (RX 7600)", "HourlyRate": 80.0, "Specifications": "AMD Radeon RX 7600 8GB, 144Hz Gaming Display", "Location": "PC Arena 1"},
    {"SetupName": "PC-02 (RX 7600)", "SetupType": "PC (RX 7600)", "HourlyRate": 80.0, "Specifications": "AMD Radeon RX 7600 8GB, 144Hz Gaming Display", "Location": "PC Arena 2"},
    {"SetupName": "PC-03 (R5 5600GT)", "SetupType": "PC (R5 5600GT)", "HourlyRate": 60.0, "Specifications": "AMD Ryzen 5 5600GT, Fast Gaming Display", "Location": "PC Arena 3"},
    {"SetupName": "PC-04 (R5 5600GT)", "SetupType": "PC (R5 5600GT)", "HourlyRate": 60.0, "Specifications": "AMD Ryzen 5 5600GT, Fast Gaming Display", "Location": "PC Arena 4"},
    {"SetupName": "PS5 - Station 1", "SetupType": "PS5", "HourlyRate": 150.0, "Specifications": "Sony PlayStation 5 + 4K OLED + DualSense", "Location": "Console Lounge 1"},
    {"SetupName": "PS5 - Station 2", "SetupType": "PS5", "HourlyRate": 150.0, "Specifications": "Sony PlayStation 5 + 55\" 4K TV + DualSense", "Location": "Console Lounge 2"},
    {"SetupName": "PS4 - Station 1", "SetupType": "PS4", "HourlyRate": 100.0, "Specifications": "Sony PlayStation 4 + FHD TV + DualShock 4", "Location": "Console Lounge 3"},
    {"SetupName": "PS4 - Station 2", "SetupType": "PS4", "HourlyRate": 100.0, "Specifications": "Sony PlayStation 4 + FHD TV + DualShock 4", "Location": "Console Lounge 4"},
]

DEFAULT_PLANS = [
    # PS5 Consecutive Passes
    {"Title": "PS5 1-Hour Pass", "Price": 150.0, "OriginalPrice": 150.0, "DurationHours": 1.0, "TargetSetupType": "PS5", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PS5 2-Hour Pass", "Price": 250.0, "OriginalPrice": 300.0, "DurationHours": 2.0, "TargetSetupType": "PS5", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "PS5 3-Hour Pass", "Price": 360.0, "OriginalPrice": 450.0, "DurationHours": 3.0, "TargetSetupType": "PS5", "Type": 0, "IsPopular": True, "BadgeText": "Best Value"},
    {"Title": "PS5 4-Hour Pass", "Price": 460.0, "OriginalPrice": 600.0, "DurationHours": 4.0, "TargetSetupType": "PS5", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PS5 5-Hour Pass", "Price": 550.0, "OriginalPrice": 750.0, "DurationHours": 5.0, "TargetSetupType": "PS5", "Type": 0, "IsPopular": False, "BadgeText": "Big Saver"},
    # PS4 Consecutive Passes
    {"Title": "PS4 1-Hour Pass", "Price": 100.0, "OriginalPrice": 100.0, "DurationHours": 1.0, "TargetSetupType": "PS4", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PS4 2-Hour Pass", "Price": 170.0, "OriginalPrice": 200.0, "DurationHours": 2.0, "TargetSetupType": "PS4", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "PS4 3-Hour Pass", "Price": 250.0, "OriginalPrice": 300.0, "DurationHours": 3.0, "TargetSetupType": "PS4", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PS4 4-Hour Pass", "Price": 320.0, "OriginalPrice": 400.0, "DurationHours": 4.0, "TargetSetupType": "PS4", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PS4 5-Hour Pass", "Price": 370.0, "OriginalPrice": 500.0, "DurationHours": 5.0, "TargetSetupType": "PS4", "Type": 0, "IsPopular": False, "BadgeText": "Saver"},
    # RX 7600 Passes
    {"Title": "RX 7600 1-Hour Pass", "Price": 80.0, "OriginalPrice": 80.0, "DurationHours": 1.0, "TargetSetupType": "PC (RX 7600)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "RX 7600 2-Hour Pass", "Price": 140.0, "OriginalPrice": 160.0, "DurationHours": 2.0, "TargetSetupType": "PC (RX 7600)", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "RX 7600 3-Hour Pass", "Price": 200.0, "OriginalPrice": 240.0, "DurationHours": 3.0, "TargetSetupType": "PC (RX 7600)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "RX 7600 4-Hour Pass", "Price": 260.0, "OriginalPrice": 320.0, "DurationHours": 4.0, "TargetSetupType": "PC (RX 7600)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "RX 7600 5-Hour Pass", "Price": 300.0, "OriginalPrice": 400.0, "DurationHours": 5.0, "TargetSetupType": "PC (RX 7600)", "Type": 0, "IsPopular": False, "BadgeText": "Saver"},
    # R5 5600GT Passes
    {"Title": "R5 5600GT 1-Hour Pass", "Price": 60.0, "OriginalPrice": 60.0, "DurationHours": 1.0, "TargetSetupType": "PC (R5 5600GT)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "R5 5600GT 2-Hour Pass", "Price": 100.0, "OriginalPrice": 120.0, "DurationHours": 2.0, "TargetSetupType": "PC (R5 5600GT)", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "R5 5600GT 3-Hour Pass", "Price": 140.0, "OriginalPrice": 180.0, "DurationHours": 3.0, "TargetSetupType": "PC (R5 5600GT)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "R5 5600GT 4-Hour Pass", "Price": 180.0, "OriginalPrice": 240.0, "DurationHours": 4.0, "TargetSetupType": "PC (R5 5600GT)", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "R5 5600GT 5-Hour Pass", "Price": 210.0, "OriginalPrice": 300.0, "DurationHours": 5.0, "TargetSetupType": "PC (R5 5600GT)", "Type": 0, "IsPopular": False, "BadgeText": "Saver"},
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Admin
    admin = db.query(WebUser).filter(WebUser.Email == "admin@apexgaming.com").first()
    if not admin:
        admin = WebUser(
            FullName="Apex Admin",
            Email="admin@apexgaming.com",
            Phone="9876543210",
            HashedPassword=get_password_hash("admin123"),
            IsAdmin=True
        )
        db.add(admin)

    # 2. Demo Customer
    gamer = db.query(WebUser).filter(WebUser.Email == "gamer@apexgaming.com").first()
    if not gamer:
        gamer = WebUser(
            FullName="Alex Gamer",
            Email="gamer@apexgaming.com",
            Phone="9988776655",
            HashedPassword=get_password_hash("gamer123"),
            IsAdmin=False
        )
        db.add(gamer)

    # 3. Synchronize Gaming Setups to exact requested roster:
    # Consoles: PS5 and PS4 only
    # PCs: RX 7600 and R5 5600GT only
    valid_names = [s["SetupName"] for s in DEFAULT_SETUPS]
    existing_setups = db.query(DesktopGamingSetup).all()
    for s in existing_setups:
        if s.SetupName not in valid_names:
            s.IsActive = False
            s.IsAvailable = False

    # Ensure each default setup exists and is active
    for s in DEFAULT_SETUPS:
        found = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.SetupName == s["SetupName"]).first()
        if not found:
            db.add(DesktopGamingSetup(
                SetupName=s["SetupName"],
                SetupType=s["SetupType"],
                HourlyRate=s["HourlyRate"],
                Specifications=s["Specifications"],
                Location=s["Location"],
                IsAvailable=True,
                IsActive=True,
                ClientId="",
                IpAddress="",
                MacAddress=""
            ))
        else:
            found.SetupType = s["SetupType"]
            found.HourlyRate = s["HourlyRate"]
            found.Specifications = s["Specifications"]
            found.Location = s["Location"]
            found.IsActive = True
            found.IsAvailable = True

    # 4. Synchronize Gaming Plans
    valid_plan_titles = [p["Title"] for p in DEFAULT_PLANS]
    existing_plans = db.query(GamingPlan).all()
    for p in existing_plans:
        if p.Title not in valid_plan_titles:
            p.IsActive = False

    for p in DEFAULT_PLANS:
        found_p = db.query(GamingPlan).filter(GamingPlan.Title == p["Title"]).first()
        if not found_p:
            db.add(GamingPlan(
                Title=p["Title"],
                Description=f"{p['Title']} for {p['TargetSetupType']}",
                Type=p["Type"],
                Price=p["Price"],
                OriginalPrice=p["OriginalPrice"],
                DurationHours=p["DurationHours"],
                ValidityDays=30,
                TargetSetupType=p["TargetSetupType"],
                IsPopular=p["IsPopular"],
                IsActive=True,
                BadgeText=p["BadgeText"],
                CreatedAt=datetime.utcnow().isoformat()
            ))
        else:
            found_p.Price = p["Price"]
            found_p.OriginalPrice = p["OriginalPrice"]
            found_p.DurationHours = p["DurationHours"]
            found_p.TargetSetupType = p["TargetSetupType"]
            found_p.IsPopular = p["IsPopular"]
            found_p.BadgeText = p["BadgeText"]
            found_p.IsActive = True

    db.commit()
    db.close()
    print("Database synced: Only PS5, PS4, RX 7600, and R5 5600GT are active.")

if __name__ == "__main__":
    seed_database()
