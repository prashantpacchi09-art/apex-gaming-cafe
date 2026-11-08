import pytest
from fastapi.testclient import TestClient
import uuid
from main import app
from app.core.database import SessionLocal
from app.models.models import DesktopGamingSetup

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_list_stations():
    response = client.get("/api/stations/")
    assert response.status_code == 200
    stations = response.json()
    assert isinstance(stations, list)
    assert len(stations) > 0
    # Check that stations match desktop setups
    names = [s["name"] for s in stations]
    assert "PS5 - 01" in names or "Rx7600" in names

def test_auth_and_booking_flow():
    unique_id = uuid.uuid4().hex[:6]
    test_email = f"gamer_{unique_id}@test.com"
    test_password = "password123"

    # 1. Register new customer
    reg_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": f"Tester {unique_id}",
        "phone": f"98765{unique_id[:5]}"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, reg_res.text
    token_data = reg_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

    # 3. Find an available station
    stations_res = client.get("/api/stations/")
    stations = stations_res.json()
    avail_station = next((s for s in stations if s["status"] == "AVAILABLE"), None)
    if not avail_station:
        # If none marked available, temporarily enable one for testing
        avail_station = stations[0]
        db = SessionLocal()
        setup = db.query(DesktopGamingSetup).filter(DesktopGamingSetup.Id == avail_station["id"]).first()
        setup.IsAvailable = True
        setup.IsActive = True
        db.commit()
        db.close()

    station_id = avail_station["id"]
    test_date = "2026-11-15"
    start_time = "14:00"

    # 4. Check initial availability
    avail_res = client.get(f"/api/bookings/availability?date={test_date}&station_id={station_id}")
    assert avail_res.status_code == 200

    # 5. Create a booking
    book_payload = {
        "station_id": station_id,
        "date": test_date,
        "start_time": start_time,
        "duration_hours": 2.0,
        "notes": "Automated verification test"
    }
    book_res = client.post("/api/bookings/", json=book_payload, headers=headers)
    assert book_res.status_code == 200, book_res.text
    booking = book_res.json()
    assert booking["booking_code"].startswith("APEX-")
    assert booking["status"] == "CONFIRMED"
    booking_id = booking["id"]

    # 6. Verify collision prevention (trying to book overlapping slot: 15:00 - 17:00 on same station)
    overlap_payload = {
        "station_id": station_id,
        "date": test_date,
        "start_time": "15:00",
        "duration_hours": 1.0,
        "notes": "Should fail with collision"
    }
    collision_res = client.post("/api/bookings/", json=overlap_payload, headers=headers)
    assert collision_res.status_code == 400
    assert "overlaps" in collision_res.json()["detail"].lower()

    # 7. Verify booking in /api/bookings/my
    my_res = client.get("/api/bookings/my", headers=headers)
    assert my_res.status_code == 200
    my_bookings = my_res.json()
    assert any(b["id"] == booking_id for b in my_bookings)

    # 8. Admin login and status update
    admin_login_res = client.post("/api/auth/login", json={
        "email": "admin@apexgaming.com",
        "password": "admin123"
    })
    assert admin_login_res.status_code == 200
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin dashboard stats
    stats_res = client.get("/api/admin/dashboard-stats", headers=admin_headers)
    assert stats_res.status_code == 200

    # Admin check-in the booking
    update_res = client.put(f"/api/admin/bookings/{booking_id}/status?status=CHECKED_IN", headers=admin_headers)
    assert update_res.status_code == 200

    # Verify updated status
    my_res2 = client.get("/api/bookings/my", headers=headers)
    updated_b = next(b for b in my_res2.json() if b["id"] == booking_id)
    assert updated_b["status"] == "CHECKED_IN"

    # 9. Cancel booking
    cancel_res = client.post(f"/api/bookings/{booking_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
