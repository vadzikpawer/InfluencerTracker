from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from core.config import settings
from api.api_v1.api import api_router
from db.session import engine
from db.base import Base

# REMOVED conditional table creation. Tests will handle this via fixtures.
# if not os.environ.get("TESTING", "False") == "True":
#     Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    # Create tables only when running the app directly (not testing)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
    uvicorn.run(app, host="0.0.0.0", port=5000) 