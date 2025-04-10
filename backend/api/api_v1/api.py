from fastapi import APIRouter
from api.api_v1.endpoints import auth, influencers, publications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(influencers.router, prefix="/influencers", tags=["influencers"])
api_router.include_router(publications.router, prefix="/publications", tags=["posts"]) 