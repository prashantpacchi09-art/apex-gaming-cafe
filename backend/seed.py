from app.core.database import SessionLocal, Base, engine
from app.models.models import WebUser, DesktopGamingSetup, GamingPlan
from app.core.security import get_password_hash
from datetime import datetime

DEFAULT_SETUPS = [
    {"SetupName": "PC-01 (RTX 4090)", "SetupType": "PC 1", "HourlyRate": 80.0, "Specifications": "RTX 4090, i9-14900K, 32GB RAM, 240Hz", "Location": "Row A - Esports"},
    {"SetupName": "PC-02 (RTX 4080)", "SetupType": "PC 1", "HourlyRate": 80.0, "Specifications": "RTX 4080, i7-14700K, 32GB RAM, 240Hz", "Location": "Row A - Esports"},
    {"SetupName": "PC-03 (RTX 4070)", "SetupType": "PC 2", "HourlyRate": 60.0, "Specifications": "RTX 4070, i5-13600K, 16GB RAM, 165Hz", "Location": "Row B - Standard"},
    {"SetupName": "PC-04 (RTX 4070)", "SetupType": "PC 2", "HourlyRate": 60.0, "Specifications": "RTX 4070, i5-13600K, 16GB RAM, 165Hz", "Location": "Row B - Standard"},
    {"SetupName": "PS5 Pro - Station 1", "SetupType": "PS5", "HourlyRate": 150.0, "Specifications": "PS5 Pro + 65\" 4K OLED + DualSense Edge", "Location": "Console Lounge 1"},
    {"SetupName": "PS5 - Station 2", "SetupType": "PS5", "HourlyRate": 150.0, "Specifications": "PS5 Console + 55\" 4K TV + 2 Controllers", "Location": "Console Lounge 2"},
    {"SetupName": "PS4 Pro - Station 1", "SetupType": "PS4", "HourlyRate": 100.0, "Specifications": "PS4 Pro + 55\" FHD TV + 2 DualShock 4", "Location": "Console Lounge 3"},
    {"SetupName": "PS4 - Station 2", "SetupType": "PS4", "HourlyRate": 100.0, "Specifications": "PS4 Slim + 50\" FHD TV + 2 DualShock 4", "Location": "Console Lounge 4"},
    {"SetupName": "VR Station (Quest 3)", "SetupType": "VR", "HourlyRate": 150.0, "Specifications": "Meta Quest 3 + 3m x 3m Padded Boundary", "Location": "VR Pod"},
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
    # PC 1 Passes
    {"Title": "PC1 1-Hour Pass", "Price": 80.0, "OriginalPrice": 80.0, "DurationHours": 1.0, "TargetSetupType": "PC 1", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC1 2-Hour Pass", "Price": 140.0, "OriginalPrice": 160.0, "DurationHours": 2.0, "TargetSetupType": "PC 1", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "PC1 3-Hour Pass", "Price": 200.0, "OriginalPrice": 240.0, "DurationHours": 3.0, "TargetSetupType": "PC 1", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC1 4-Hour Pass", "Price": 260.0, "OriginalPrice": 320.0, "DurationHours": 4.0, "TargetSetupType": "PC 1", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC1 5-Hour Pass", "Price": 300.0, "OriginalPrice": 400.0, "DurationHours": 5.0, "TargetSetupType": "PC 1", "Type": 0, "IsPopular": False, "BadgeText": "Saver"},
    # PC 2 Passes
    {"Title": "PC2 1-Hour Pass", "Price": 60.0, "OriginalPrice": 60.0, "DurationHours": 1.0, "TargetSetupType": "PC 2", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC2 2-Hour Pass", "Price": 100.0, "OriginalPrice": 120.0, "DurationHours": 2.0, "TargetSetupType": "PC 2", "Type": 0, "IsPopular": True, "BadgeText": "Popular"},
    {"Title": "PC2 3-Hour Pass", "Price": 140.0, "OriginalPrice": 180.0, "DurationHours": 3.0, "TargetSetupType": "PC 2", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC2 4-Hour Pass", "Price": 180.0, "OriginalPrice": 240.0, "DurationHours": 4.0, "TargetSetupType": "PC 2", "Type": 0, "IsPopular": False, "BadgeText": ""},
    {"Title": "PC2 5-Hour Pass", "Price": 210.0, "OriginalPrice": 300.0, "DurationHours": 5.0, "TargetSetupType": "PC 2", "Type": 0, "IsPopular": False, "BadgeText": "Saver"},
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

    # 3. Default Gaming Setups (if empty, e.g. fresh Cloud PostgreSQL)
    if db.query(DesktopGamingSetup).count() == 0:
        for s in DEFAULT_SETUPS:
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

    # 4. Default Gaming Plans (if empty)
    if db.query(GamingPlan).count() == 0:
        for p in DEFAULT_PLANS:
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

    db.commit()
    db.close()
    print("Database schema verified & seed data ready.")

if __name__ == "__main__":
    seed_database()
