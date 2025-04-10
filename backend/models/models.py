from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
from db.base import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    MANAGER = "manager"
    INFLUENCER = "influencer"

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"

class WorkflowStage(str, enum.Enum):
    SCENARIO = "scenario"
    MATERIAL = "material"
    PUBLICATION = "publication"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    email = Column(String)
    role = Column(Enum(UserRole))
    profile_image = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Manager(Base):
    __tablename__ = "managers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    influencers = relationship("Influencer", back_populates="manager")
    projects = relationship("Project", back_populates="manager")

class Influencer(Base):
    __tablename__ = "influencers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("managers.id"))
    nickname = Column(String)
    bio = Column(String)
    instagram_handle = Column(String, nullable=True)
    instagram_followers = Column(Integer, nullable=True)
    tiktok_handle = Column(String, nullable=True)
    tiktok_followers = Column(Integer, nullable=True)
    youtube_handle = Column(String, nullable=True)
    youtube_followers = Column(Integer, nullable=True)
    telegram_handle = Column(String, nullable=True)
    telegram_followers = Column(Integer, nullable=True)
    vk_handle = Column(String, nullable=True)
    vk_followers = Column(Integer, nullable=True)
    
    manager = relationship("Manager", back_populates="influencers")
    projects = relationship("ProjectInfluencer", back_populates="influencer")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    client = Column(String)
    description = Column(String)
    key_requirements = Column(JSON)
    start_date = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime)
    scenario_deadline = Column(DateTime, nullable=True)
    material_deadline = Column(DateTime, nullable=True)
    publication_deadline = Column(DateTime, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    workflow_stage = Column(Enum(WorkflowStage), default=WorkflowStage.SCENARIO)
    budget = Column(Integer)
    erid = Column(String, nullable=True)
    manager_id = Column(Integer, ForeignKey("managers.id"))
    technical_links = Column(JSON)
    platforms = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    manager = relationship("Manager", back_populates="projects")
    influencers = relationship("ProjectInfluencer", back_populates="project")

class ProjectInfluencer(Base):
    __tablename__ = "project_influencers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    influencer_id = Column(Integer, ForeignKey("influencers.id"))
    scenario_status = Column(String)
    material_status = Column(String)
    publication_status = Column(String)
    scenario_completed_at = Column(DateTime)
    material_completed_at = Column(DateTime)
    publication_completed_at = Column(DateTime)

    project = relationship("Project", back_populates="influencers")
    influencer = relationship("Influencer", back_populates="projects")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    influencer_id = Column(Integer, ForeignKey("influencers.id"))
    content = Column(String)
    google_doc_url = Column(String)
    status = Column(String)
    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)
    deadline = Column(DateTime)
    version = Column(Integer, default=1)

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    influencer_id = Column(Integer, ForeignKey("influencers.id"))
    material_url = Column(String)
    google_drive_url = Column(String)
    description = Column(String)
    status = Column(String)
    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)
    deadline = Column(DateTime)

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    influencer_id = Column(Integer, ForeignKey("influencers.id"))
    platform = Column(String)
    publication_url = Column(String)
    content = Column(String, nullable=True)
    published_at = Column(DateTime)
    status = Column(String)
    verified_at = Column(DateTime)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow) 