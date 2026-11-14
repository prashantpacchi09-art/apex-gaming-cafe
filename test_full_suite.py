import urllib.request
import json
import os
import sqlite3
import sys

print("================================================================")
print("   APEX GAMING CAFE - FULL MULTI-SYSTEM INTEGRATION TEST        ")
print("================================================================")

passed = 0
failed = 0

def run_test(number, name, fn):
    global passed, failed
    print(f"[{number:02d}] {name}...", end=" ", flush=True)
    try:
        fn()
        print("✓ PASSED")
        passed += 1
    except Exception as e:
        print(f"✗ FAILED: {e}")
        failed += 1

# 1. Backend Root Health
def test_backend_health():
    req = urllib.request.urlopen("https://apex-cafe-backend.onrender.com/", timeout=30)
    data = json.loads(req.read().decode())
    assert data.get("status") == "online", f"Unexpected status payload: {data}"

run_test(1, "Cloud Backend API Health (/)", test_backend_health)

# 2. Station Roster
def test_stations_roster():
    req = urllib.request.urlopen("https://apex-cafe-backend.onrender.com/api/stations", timeout=30)
    stations = json.loads(req.read().decode())
    assert len(stations) == 4, f"Expected 4 active stations, received {len(stations)}"
    names = {s["name"]: s["hourly_rate"] for s in stations}
    assert "PC - RX 7600" in names and names["PC - RX 7600"] == 80.0, "RX 7600 missing or incorrect rate"
    assert "PC - R5 5600GT" in names and names["PC - R5 5600GT"] == 60.0, "R5 5600GT missing or incorrect rate"
    assert "PS5 - Station 1" in names and names["PS5 - Station 1"] == 150.0, "PS5 missing or incorrect rate"
    assert "PS4 - Station 1" in names and names["PS4 - Station 1"] == 100.0, "PS4 missing or incorrect rate"

run_test(2, "Station Roster: Exactly 2 PCs & 2 Consoles & Rates", test_stations_roster)

# 3. Gaming Plans
def test_gaming_plans():
    req = urllib.request.urlopen("https://apex-cafe-backend.onrender.com/api/stations/plans", timeout=30)
    plans = json.loads(req.read().decode())
    assert len(plans) >= 20, f"Expected at least 20 plans, received {len(plans)}"
    titles = [p["title"] for p in plans]
    assert any("PS5 2-Hour" in t for t in titles), "Missing PS5 2-Hour Pass"
    assert any("7 Hours" in t for t in titles), "Missing 7 Hours Anytime Package"
    assert any("30 Hours" in t for t in titles), "Missing 30 Hours Anytime Package"

run_test(3, "Pricing Plans: Same-Day Passes + 7h-30h Anytime Packages", test_gaming_plans)

# 4. Admin Auth
admin_token = None
def test_admin_auth():
    global admin_token
    payload = json.dumps({"email": "admin@apexgaming.com", "password": "admin123"}).encode("utf-8")
    req = urllib.request.Request(
        "https://apex-cafe-backend.onrender.com/api/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode())
        assert "access_token" in data, "No access token received"
        admin_token = data["access_token"]

run_test(4, "Admin Login Authentication & Permanent JWT Token", test_admin_auth)

# 5. Admin Dashboard Stats
def test_admin_stats():
    global admin_token
    req = urllib.request.Request(
        "https://apex-cafe-backend.onrender.com/api/admin/dashboard-stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode())
        assert "total_stations" in data, f"Invalid stats structure: {data}"

run_test(5, "Admin Desk Live Dashboard Stats Endpoint", test_admin_stats)

# 6. Admin Setups Management Endpoint
def test_admin_setups():
    global admin_token
    req = urllib.request.Request(
        "https://apex-cafe-backend.onrender.com/api/admin/setups",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode())
        active = [s for s in data if s.get("is_active")]
        assert len(active) == 4, f"Expected 4 active admin setups, got {len(active)}"

run_test(6, "Admin Setups Management Roster Endpoint", test_admin_setups)

# 7. Customer Web App
def test_customer_web():
    with urllib.request.urlopen("https://apex-gamer-web.onrender.com", timeout=30) as res:
        assert res.status == 200, f"Customer Web status: {res.status}"
        body = res.read().decode()
        assert "<div id=\"root\">" in body, "React root tag not found in customer web"

run_test(7, "Customer Web Application (https://apex-gamer-web.onrender.com)", test_customer_web)

# 8. Customer Web API Rewrite
def test_customer_proxy():
    with urllib.request.urlopen("https://apex-gamer-web.onrender.com/api/stations", timeout=30) as res:
        assert res.status == 200, f"Customer proxy status: {res.status}"
        stations = json.loads(res.read().decode())
        assert len(stations) == 4, f"Customer proxy returned {len(stations)} stations"

run_test(8, "Customer Web -> Backend API Proxy Rewrite", test_customer_proxy)

# 9. Admin Portal Web App
def test_admin_web():
    with urllib.request.urlopen("https://apex-admin-portal.onrender.com", timeout=30) as res:
        assert res.status == 200, f"Admin portal status: {res.status}"
        body = res.read().decode()
        assert "<div id=\"root\">" in body, "React root tag not found in admin portal"

run_test(9, "Staff Admin Desk Portal (https://apex-admin-portal.onrender.com)", test_admin_web)

# 10. Admin Portal API Rewrite
def test_admin_proxy():
    with urllib.request.urlopen("https://apex-admin-portal.onrender.com/api/stations", timeout=30) as res:
        assert res.status == 200, f"Admin proxy status: {res.status}"
        stations = json.loads(res.read().decode())
        assert len(stations) == 4, f"Admin proxy returned {len(stations)} stations"

run_test(10, "Admin Portal -> Backend API Proxy Rewrite", test_admin_proxy)

# 11. Direct Android APK Serving
def test_apk_download():
    with urllib.request.urlopen("https://apex-gamer-web.onrender.com/ApexGamer.apk", timeout=30) as res:
        assert res.status == 200, f"APK status: {res.status}"
        ctype = res.headers.get("Content-Type", "")
        assert "vnd.android.package-archive" in ctype, f"Invalid APK Content-Type: {ctype}"
        clen = int(res.headers.get("Content-Length", 0))
        assert clen > 600000, f"APK file size invalid: {clen} bytes"

run_test(11, "Direct Android APK Serving (MIME: package-archive, Size: ~635KB)", test_apk_download)

# 12. QR Code Graphics Assets
def test_qr_graphics():
    for qr in ["qr_customer_web.png", "qr_customer_app.png"]:
        with urllib.request.urlopen(f"https://apex-gamer-web.onrender.com/{qr}", timeout=30) as res:
            assert res.status == 200, f"QR asset {qr} status: {res.status}"
            data = res.read()
            assert len(data) > 100, f"QR asset {qr} is too small: {len(data)} bytes"

run_test(12, "Standee QR Code Graphics (Web & APK QR Images)", test_qr_graphics)

# 13. Local Desktop Database & Active Setups
def test_local_database():
    db_path = os.path.join(os.environ.get("LOCALAPPDATA", ""), "ApexGamingCafe", "Data", "ApexGamingCafe.db")
    assert os.path.exists(db_path), f"Desktop DB not found at: {db_path}"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    # Check 4 active setups locally
    rows = cur.execute("SELECT SetupName, HourlyRate FROM GamingSetups WHERE IsActive=1").fetchall()
    assert len(rows) == 4, f"Expected 4 active local setups, found: {rows}"
    # Check table existence
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    for t in ["GamingSetups", "GamingPlans", "Customers", "WebBookings", "Sessions"]:
        assert t in tables, f"Missing table {t} in local database"
    conn.close()

run_test(13, "Local Counter Desktop SQLite Database (4 Active Rigs)", test_local_database)

# 14. Cloud-to-Desktop Synchronization Engine
def test_sync_engine():
    sync_file = r"C:\Users\Admin\OneDrive\Documents\Apexgaming\ApexGamingCafe\ApexGamingCafeWeb\sync_cloud_to_desktop.py"
    assert os.path.exists(sync_file), "sync_cloud_to_desktop.py is missing"
    sys.path.insert(0, os.path.dirname(sync_file))
    import sync_cloud_to_desktop
    sync_cloud_to_desktop.sync_bookings_and_customers()

run_test(14, "Cloud-to-Desktop Real-Time Sync Engine", test_sync_engine)

print("================================================================")
print(f"   FINAL RESULT: {passed} OF {passed + failed} TESTS PASSED ({100.0 * passed / (passed + failed):.0f}%)")
print("================================================================")
