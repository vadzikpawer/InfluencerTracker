from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Activity, Project, User
from schemas.schemas import ActivityCreate, Activity as ActivitySchema
from core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=ActivitySchema)
def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == activity.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == activity.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_activity = Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/", response_model=List[ActivitySchema])
def read_activities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activities = db.query(Activity).offset(skip).limit(limit).all()
    return activities

@router.get("/{activity_id}", response_model=ActivitySchema)
def read_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.delete("/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"message": "Activity deleted successfully"} 