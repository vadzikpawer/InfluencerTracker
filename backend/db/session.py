from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Engine is created directly using the URL from settings
# which should be configured based on TESTING env var in config.py
engine = create_engine(settings.DATABASE_URL,
                       connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 