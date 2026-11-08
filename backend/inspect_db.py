import sqlite3
import os

db_path = os.path.expandvars(r'%LOCALAPPDATA%\ApexGamingCafe\Data\ApexGamingCafe.db')
print("DB path:", db_path, "Exists:", os.path.exists(db_path))

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print("Tables:", [t[0] for t in tables])
    
    if any(t[0] == 'GamingSetups' for t in tables):
        setups = cur.execute("SELECT Id, SetupName, SetupType, HourlyRate, IsAvailable, IsActive FROM GamingSetups").fetchall()
        print("GamingSetups count:", len(setups))
        for s in setups[:5]:
            print("  Setup:", s)
            
    if any(t[0] == 'Sessions' for t in tables):
        sessions = cur.execute("SELECT COUNT(*) FROM Sessions").fetchone()
        print("Sessions count:", sessions[0])
