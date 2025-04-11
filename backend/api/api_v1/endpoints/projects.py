from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Project, User, Scenario, Activity, Publication
from schemas.schemas import ProjectCreate, Project as ProjectSchema, PublicationCreate, WorkflowStageUpdate, Scenario as ScenarioSchema, ScenarioCreate, Publication as PublicationSchema, Activity as ActivitySchema
from core.security import get_current_user
from datetime import datetime

router = APIRouter()

def create_activity(db: Session, project_id: int, user_id: int, activity_type: str, description: str):
    activity = Activity(
        project_id=project_id,
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    return activity

@router.post("/", response_model=ProjectSchema)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if manager exists
    manager = db.query(User).filter(User.id == project.manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    create_activity(
        db=db,
        project_id=db_project.id,
        user_id=current_user.id,
        activity_type="project_created",
        description=f"Project '{db_project.title}' was created"
    )
    
    return db_project

@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if manager exists
    manager = db.query(User).filter(User.id == project.manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    old_title = db_project.title
    for key, value in project.dict().items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    
    if old_title != db_project.title:
        create_activity(
            db=db,
            project_id=project_id,
            user_id=current_user.id,
            activity_type="project_updated",
            description=f"Project title changed from '{old_title}' to '{db_project.title}'"
        )
    
    return db_project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_title = db_project.title
    db.delete(db_project)
    db.commit()
    
    create_activity(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        activity_type="project_deleted",
        description=f"Project '{project_title}' was deleted"
    )
    
    return {"message": "Project deleted successfully"}

@router.patch("/{project_id}/workflow-stage", response_model=ProjectSchema)
def update_project_workflow_stage(
    project_id: int,
    workflow_stage_update: WorkflowStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    old_stage = db_project.workflow_stage
    db_project.workflow_stage = workflow_stage_update.workflow_stage
    db.commit()
    db.refresh(db_project)
    
    create_activity(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        activity_type=f"workflow_to_{db_project.workflow_stage.value}",
        description=f"Workflow stage changed from '{old_stage}' to '{db_project.workflow_stage}'"
    )
    
    return db_project

@router.get("/{project_id}/scenarios", response_model=List[ScenarioSchema])
def read_project_scenarios(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenarios = db.query(Scenario).filter(Scenario.project_id == project_id).all()
    return scenarios

@router.post("/{project_id}/scenarios", response_model=ScenarioSchema)
def create_project_scenario(
    project_id: int,
    scenario: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_scenario = Scenario(**scenario.dict())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    
    create_activity(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        activity_type="scenario_created",
        description=f"New scenario version {db_scenario.version} was created"
    )
    
    return db_scenario

@router.put("/{project_id}/scenarios/{scenario_id}", response_model=ScenarioSchema)
def update_project_scenario(
    project_id: int,
    scenario_id: int,
    scenario: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    old_status = db_scenario.status
    if "status" in scenario:
        db_scenario.status = scenario["status"]
    if "approved_at" in scenario:
        db_scenario.approved_at = scenario["approved_at"]
    
    db.commit()
    db.refresh(db_scenario)
    
    if old_status != db_scenario.status:
        create_activity(
            db=db,
            project_id=project_id,
            user_id=current_user.id,
            activity_type="scenario_approved",
            description=f"Scenario status changed from '{old_status}' to '{db_scenario.status}'"
        )
    
    return db_scenario

@router.delete("/{project_id}/scenarios/{scenario_id}")
def delete_project_scenario(
    project_id: int,
    scenario_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    version = db_scenario.version
    db.delete(db_scenario)
    db.commit()
    
    create_activity(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        activity_type="scenario_deleted",
        description=f"Scenario version {version} was deleted"
    )
    
    return {"message": "Scenario deleted successfully"}

@router.get("/{project_id}/publications", response_model=List[PublicationSchema])
def read_project_publications(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    publications = db.query(Publication).filter(Publication.project_id == project_id).all()
    return publications

@router.post("/{project_id}/publications", response_model=PublicationSchema)
def create_project_publication(
    project_id: int,
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_publication = Publication(**publication.dict())
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    
    create_activity(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        activity_type="publication_created",
        description=f"New publication was created"
    )
    
    return db_publication

@router.put("/{project_id}/publications/{publication_id}", response_model=PublicationSchema)
def update_project_publication(
    project_id: int,
    publication_id: int,
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    old_status = db_publication.status
    if "status" in publication:
        db_publication.status = publication["status"]
    if "verified_at" in publication:
        db_publication.verified_at = publication["verified_at"]
    
    db.commit()
    db.refresh(db_publication)
    
    if old_status != db_publication.status:
        create_activity(
            db=db,
            project_id=project_id,
            user_id=current_user.id,
            activity_type="publication_status_updated",
            description=f"Publication status changed from '{old_status}' to '{db_publication.status}'"
        )
    
    return db_publication

@router.get("/{project_id}/activities", response_model=List[ActivitySchema])
def read_project_activities(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    activities = (
        db.query(Activity)
        .filter(Activity.project_id == project_id)
        .order_by(Activity.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return activities
