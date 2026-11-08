import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Cloud Database URL (PostgreSQL / MySQL / Remote SQLite)
env_db_url = os.environ.get("DATABASE_URL")

if env_db_url:
    # Fix standard postgresql scheme for SQLAlchemy if needed
    if env_db_url.startswith("postgres://"):
        env_db_url = env_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = env_db_url
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # 2. Local Windows persistent desktop database location
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        persistent_db_dir = os.path.join(local_app_data, "ApexGamingCafe", "Data")
    else:
        # Fallback for Linux containers without LOCALAPPDATA
        persistent_db_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")

    os.makedirs(persistent_db_dir, exist_ok=True)
    DATABASE_PATH = os.path.join(persistent_db_dir, "ApexGamingCafe.db")
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
