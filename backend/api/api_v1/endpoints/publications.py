from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Publication, Project, Influencer, User
from schemas.schemas import PublicationCreate, Publication as PublicationSchema
from core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=PublicationSchema)
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == publication.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == publication.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    db_publication = Publication(**publication.dict())
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication

@router.get("/", response_model=List[PublicationSchema])
def read_publications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    publications = db.query(Publication).offset(skip).limit(limit).all()
    return publications

@router.get("/{publication_id}", response_model=PublicationSchema)
def read_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    return publication

@router.put("/{publication_id}", response_model=PublicationSchema)
def update_publication(
    publication_id: int,
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == publication.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == publication.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    for key, value in publication.dict().items():
        setattr(db_publication, key, value)
    
    db.commit()
    db.refresh(db_publication)
    return db_publication

@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    db.delete(db_publication)
    db.commit()
    return {"message": "Publication deleted successfully"} 