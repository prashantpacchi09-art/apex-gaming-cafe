# Apex Gaming Cafe - Web & Mobile Platforms

Completely separated platforms for **Apex Gaming Cafe**:
1. **🎮 Customer Web & Mobile App** (`frontend`): Dedicated exclusively for gamers to explore live rigs, book time slots, and manage gamer passes on mobile or desktop without any admin clutter.
2. **👑 Admin & Staff Operations Portal** (`admin-portal`): Dedicated command desk for cafe staff to verify booking codes, check in customers, monitor active gaming sessions, track daily revenue, and supervise floor occupancy.
3. **⚙️ Backend API** (`backend`): FastAPI service with shared SQLite database connected to the cafe desktop management system.

---

## 🚀 Quick Start (Running Everything)

Simply double-click:
```powershell
start_dev.bat
```
Or start each service individually:

### 1. Start FastAPI Backend (Port 8000)
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
* API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start Customer Web & Mobile App (Port 5173)
```powershell
cd frontend
npm.cmd run dev
```
* Customer Web: [http://localhost:5173](http://localhost:5173)
* Mobile Phones on Cafe Wi-Fi: `http://192.168.29.25:5173`

### 3. Start Admin & Staff Portal (Port 5174)
```powershell
cd admin-portal
npm.cmd run dev
```
* Staff Portal: [http://localhost:5174](http://localhost:5174)
* Mobile Phones on Cafe Wi-Fi: `http://192.168.29.25:5174`

---

## 🔑 Access & Roles

| Platform | URL | Default Login | Intended For |
|---|---|---|---|
| **Customer App** | `http://localhost:5173` | `gamer@apexgaming.com` / `gamer123` (or register) | Customers, Gamers, Walk-ins |
| **Admin Portal** | `http://localhost:5174` | `admin@apexgaming.com` / `admin123` | Cafe Staff, Cashiers, Owner |

*You can also click the 1-click quick login buttons inside the Sign In modal.*

---

## 🕹️ Key Features

- **Interactive Floor Map**: Visual breakdown of **Pro PC Battlezone** (RTX 4080 / 240Hz), **Console Lounge** (PS5 & Xbox Series X), and **VIP Cabin & Sim Racing Arena**.
- **Real-Time Slot Engine**: Automatic calculation of time blocks, end times, hourly pricing, and collision prevention.
- **Apex Gamer Pass**: Instant booking ticket generation with reference code and timing.
- **Admin Management Desk**: Live dashboard tracking daily bookings, check-ins, active sessions, and revenue.
