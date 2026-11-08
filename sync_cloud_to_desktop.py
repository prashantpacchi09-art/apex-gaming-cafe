"""
Apex Gaming Cafe - 24/7 Cloud to Desktop Sync Tool
Uses only built-in Python libraries (zero external pip packages needed).
Runs when the Counter PC is turned on to fetch all online bookings & registered gamers
from the 24/7 Cloud Server directly into your local desktop database.
"""
import sqlite3
import os
import urllib.request
import urllib.error
import json

# Cloud Backend API URL (Live 24/7 Render cloud domain)
CLOUD_API_URL = os.environ.get("APEX_CLOUD_URL", "https://apex-cafe-backend.onrender.com")
ADMIN_EMAIL = os.environ.get("APEX_ADMIN_EMAIL", "admin@apexgaming.com")
ADMIN_PASSWORD = os.environ.get("APEX_ADMIN_PASS", "admin123")

def get_db_path():
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    return os.path.join(local_app_data, "ApexGamingCafe", "Data", "ApexGamingCafe.db")

def login_to_cloud():
    try:
        req = urllib.request.Request(
            f"{CLOUD_API_URL}/api/auth/login",
            data=json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            return data.get("access_token")
    except Exception as e:
        print(f"[Cloud Connection Error]: {e}")
    return None

def sync_bookings_and_customers():
    token = login_to_cloud()
    if not token:
        print("[Sync Failed]: Could not authenticate with 24/7 cloud server.")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"[Sync Warning]: Local database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Fetch Cloud Bookings
    try:
        b_req = urllib.request.Request(f"{CLOUD_API_URL}/api/admin/bookings", headers=headers)
        with urllib.request.urlopen(b_req, timeout=10) as b_resp:
            cloud_bookings = json.loads(b_resp.read().decode())
            inserted_count = 0
            for b in cloud_bookings:
                cur.execute("SELECT Id FROM WebBookings WHERE BookingCode = ?", (b["booking_code"],))
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO WebBookings (
                            BookingCode, CustomerName, CustomerEmail, CustomerPhone,
                            GamingSetupId, BookingDate, StartTime, EndTime,
                            DurationHours, TotalAmount, Status, Remarks, CreatedDate
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        b["booking_code"], b["customer_name"], b.get("customer_email"), b.get("customer_phone"),
                        b["station_id"], b["date"], b["start_time"], b["end_time"],
                        b["duration_hours"], b["total_amount"], b["status"], b.get("notes") or "",
                        b.get("created_at")
                    ))
                    inserted_count += 1
            conn.commit()
            print(f"[Bookings Sync]: {inserted_count} new online reservation(s) synced to desktop software.")
    except Exception as e:
        print(f"[Bookings Sync Error]: {e}")

    # 2. Fetch Cloud Registered Gamers
    try:
        c_req = urllib.request.Request(f"{CLOUD_API_URL}/api/admin/customers", headers=headers)
        with urllib.request.urlopen(c_req, timeout=10) as c_resp:
            cloud_customers = json.loads(c_resp.read().decode())
            new_cust_count = 0
            for c in cloud_customers:
                email = c.get("Email")
                if not email:
                    continue
                cur.execute("SELECT Id FROM Customers WHERE Email = ?", (email,))
                if not cur.fetchone():
                    code = c.get("CustomerCode") or f"CUST-{100 + len(cloud_customers)}"
                    cur.execute("""
                        INSERT INTO Customers (
                            CustomerCode, FullName, MobileNumber, Email, AadhaarNumber, RFID,
                            WalletBalance, RewardPoints, CustomerType, IsActive, DateOfBirth,
                            Address, City, State, Pincode, TotalHoursPlayed, TotalSpent, Notes, CreatedDate
                        ) VALUES (?, ?, ?, ?, '', '', '0.0', 0, 0, 1, '', '', '', '', '', 0.0, '0', 'Online Registered Gamer', ?)
                    """, (code, c["FullName"], c.get("MobileNumber") or "", email, c.get("CreatedDate")))
                    new_cust_count += 1
            conn.commit()
            print(f"[Gamers Sync]: {new_cust_count} new customer account(s) synced to desktop software.")
    except Exception as e:
        print(f"[Gamers Sync Error]: {e}")

    conn.close()
    print("[Sync Complete]: Local desktop software is up to date!")

if __name__ == "__main__":
    sync_bookings_and_customers()
