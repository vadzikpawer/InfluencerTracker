from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Influencer, User
from schemas.schemas import InfluencerCreate as InfluencerSchema, InfluencerUpdate
from core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[InfluencerSchema])
def read_influencers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    influencers = db.query(Influencer).filter(Influencer.manager_id == current_user.id).offset(skip).limit(limit).all()
    return influencers

@router.post("/", response_model=InfluencerSchema)
def create_influencer(
    influencer: InfluencerSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_influencer = Influencer(**influencer.model_dump())
    db.add(db_influencer)
    db.commit()
    db.refresh(db_influencer)
    return db_influencer

@router.get("/{influencer_id}", response_model=InfluencerSchema)
def read_influencer(
    influencer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return influencer

@router.put("/{influencer_id}", response_model=InfluencerSchema)
def update_influencer(
    influencer_id: int,
    influencer: InfluencerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if db_influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    for key, value in influencer.dict(exclude_unset=True).items():
        setattr(db_influencer, key, value)
    
    db.commit()
    db.refresh(db_influencer)
    return db_influencer
