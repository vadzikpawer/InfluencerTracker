from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from models.models import UserRole, ProjectStatus, WorkflowStage

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: UserRole
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class InfluencerBase(BaseModel):
    nickname: Optional[str] = None
    bio: Optional[str] = None
    instagram_handle: Optional[str] = None
    instagram_followers: Optional[int] = None
    tiktok_handle: Optional[str] = None
    tiktok_followers: Optional[int] = None
    youtube_handle: Optional[str] = None
    youtube_followers: Optional[int] = None
    telegram_handle: Optional[str] = None
    telegram_followers: Optional[int] = None
    vk_handle: Optional[str] = None
    vk_followers: Optional[int] = None

class InfluencerCreate(InfluencerBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

class InfluencerUpdate(InfluencerBase):
    manager_id: Optional[int] = None
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    client: str
    description: Optional[str] = None
    key_requirements: Optional[List[str]] = Field(default_factory=list)
    deadline: Optional[datetime] = None
    scenario_deadline: Optional[datetime] = None
    material_deadline: Optional[datetime] = None
    publication_deadline: Optional[datetime] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    workflow_stage: WorkflowStage = WorkflowStage.SCENARIO
    budget: Optional[int] = None
    erid: Optional[str] = None
    manager_id: int
    technical_links: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    platforms: Optional[List[str]] = Field(default_factory=list)

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    start_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectInfluencerBase(BaseModel):
    project_id: int
    influencer_id: int
    scenario_status: Optional[str] = None
    material_status: Optional[str] = None
    publication_status: Optional[str] = None
    scenario_completed_at: Optional[datetime] = None
    material_completed_at: Optional[datetime] = None
    publication_completed_at: Optional[datetime] = None

class ProjectInfluencerCreate(ProjectInfluencerBase):
    pass

class ProjectInfluencer(ProjectInfluencerBase):
    id: int

    class Config:
        from_attributes = True

class ScenarioBase(BaseModel):
    project_id: int
    influencer_id: int
    content: Optional[str] = None
    google_doc_url: Optional[str] = None
    status: str = "pending"
    deadline: Optional[datetime] = None
    version: int = 1

class ScenarioCreate(ScenarioBase):
    content: str

class Scenario(ScenarioBase):
    id: int
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MaterialBase(BaseModel):
    project_id: int
    influencer_id: int
    material_url: Optional[str] = None
    google_drive_url: Optional[str] = None
    description: Optional[str] = None
    status: str = "pending"
    deadline: Optional[datetime] = None

class MaterialCreate(MaterialBase):
    material_url: str

class Material(MaterialBase):
    id: int
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PublicationBase(BaseModel):
    project_id: int = None
    influencer_id: int = None
    platform: str = None
    publication_url: Optional[str] = None
    published_at: Optional[datetime] = None
    status: str = "pending"
    content: Optional[str] = None

class PublicationCreate(PublicationBase):
    published_at: datetime

    class Config:
        from_attributes = True

class Publication(PublicationBase):
    id: int
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    project_id: int
    user_id: int
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    user: User

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    project_id: Optional[int] = None
    user_id: Optional[int] = None
    activity_type: str
    description: str

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    created_at: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True 