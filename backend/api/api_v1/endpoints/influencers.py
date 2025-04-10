from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Influencer
from schemas.schemas import InfluencerCreate, Influencer as InfluencerSchema
from core.security import oauth2_scheme

router = APIRouter()

@router.post("/", response_model=InfluencerSchema)
def create_influencer(
    influencer: InfluencerCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_influencer = Influencer(**influencer.dict())
    db.add(db_influencer)
    db.commit()
    db.refresh(db_influencer)
    return db_influencer

@router.get("/", response_model=List[InfluencerSchema])
def read_influencers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    influencers = db.query(Influencer).offset(skip).limit(limit).all()
    return influencers

@router.get("/{influencer_id}", response_model=InfluencerSchema)
def read_influencer(
    influencer_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return influencer

@router.put("/{influencer_id}", response_model=InfluencerSchema)
def update_influencer(
    influencer_id: int,
    influencer: InfluencerCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if db_influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    for key, value in influencer.dict().items():
        setattr(db_influencer, key, value)
    
    db.commit()
    db.refresh(db_influencer)
    return db_influencer

@router.delete("/{influencer_id}")
def delete_influencer(
    influencer_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if db_influencer is None:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    db.delete(db_influencer)
    db.commit()
    return {"message": "Influencer deleted successfully"} 