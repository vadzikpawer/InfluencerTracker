from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Scenario, Project, Influencer
from schemas.schemas import ScenarioCreate, Scenario as ScenarioSchema
from core.security import oauth2_scheme

router = APIRouter()

@router.post("/", response_model=ScenarioSchema)
def create_scenario(
    scenario: ScenarioCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == scenario.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == scenario.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    db_scenario = Scenario(**scenario.dict())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    return db_scenario

@router.get("/", response_model=List[ScenarioSchema])
def read_scenarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    scenarios = db.query(Scenario).offset(skip).limit(limit).all()
    return scenarios

@router.get("/{scenario_id}", response_model=ScenarioSchema)
def read_scenario(
    scenario_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@router.put("/{scenario_id}", response_model=ScenarioSchema)
def update_scenario(
    scenario_id: int,
    scenario: ScenarioCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == scenario.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if influencer exists
    influencer = db.query(Influencer).filter(Influencer.id == scenario.influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    for key, value in scenario.dict().items():
        setattr(db_scenario, key, value)
    
    db.commit()
    db.refresh(db_scenario)
    return db_scenario

@router.delete("/{scenario_id}")
def delete_scenario(
    scenario_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    db.delete(db_scenario)
    db.commit()
    return {"message": "Scenario deleted successfully"} 