from fastapi import APIRouter
from api.api_v1.endpoints import auth, influencers, publications, comments, materials, projects, scenarios

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(influencers.router, prefix="/influencers", tags=["influencers"])
api_router.include_router(publications.router, prefix="/publications", tags=["publications"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["scenarios"])
