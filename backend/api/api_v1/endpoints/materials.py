from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Material, Project, Influencer, User
from schemas.schemas import MaterialCreate, Material as MaterialSchema
from core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=MaterialSchema)
def create_material(
    material: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == material.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == material.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    db_material = Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.get("/", response_model=List[MaterialSchema])
def read_materials(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    materials = db.query(Material).offset(skip).limit(limit).all()
    return materials

@router.get("/{material_id}", response_model=MaterialSchema)
def read_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.put("/{material_id}", response_model=MaterialSchema)
def update_material(
    material_id: int,
    material: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == material.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == material.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    for key, value in material.dict().items():
        setattr(db_material, key, value)
    
    db.commit()
    db.refresh(db_material)
    return db_material

@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if db_material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(db_material)
    db.commit()
    return {"message": "Material deleted successfully"} 