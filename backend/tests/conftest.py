from sqlalchemy import text
from core.config import settings
import pytest
from fastapi.testclient import TestClient

from main import app
from db.base import Base
from db.session import engine, SessionLocal, get_db
from core.security import get_password_hash
from models.models import User, Project, Scenario, Material, Publication, Comment, Activity, ProjectInfluencer, Influencer

# Fixture to set up and tear down the database for each test function
@pytest.fixture(scope="function", autouse=True)
def db_session():
    # Ensure the engine is using the test database (SQLite)
    assert "sqlite" in str(engine.url), f"Engine URL is not SQLite: {engine.url}"
    
    # Create tables
    print("Creating tables")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # print(db.execute(text("SELECT name FROM my_db.sqlite_master WHERE type='table';")).fetchall())
    
    try:
        yield db
    finally:
        db.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)

# Fixture to provide a test client with overridden DB dependency
@pytest.fixture(scope="function")
def client(db_session):
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass # Session is closed in the db_session fixture teardown
    
    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear() # Clear overrides after test

# Fixture to create a test user
@pytest.fixture(scope="function")
def test_user(db_session):
    db_user = db_session.query(User).filter(User.username == "testuser").first()
    if not db_user:
        db_user = User(
            username="testuser",
            email="test@example.com",
            password=get_password_hash("password"),
            role="manager"
        )
        db_session.add(db_user)
        db_session.commit()
        db_session.refresh(db_user)
    return db_user

@pytest.fixture(scope="function")
def test_user_influencer(db_session, test_user):
    db_user = db_session.query(User).filter(User.username == "testinfluencer").first()
    if not db_user:
        db_user = User(
            username="testinfluencer",
            email="test@example.com",
            password=get_password_hash("password"),
            role="influencer"
        )
        db_session.add(db_user)
        db_session.commit()
        db_session.refresh(db_user)
    db_influencer = db_session.query(Influencer).filter(Influencer.user_id == db_user.id).first()
    if not db_influencer:
        db_influencer = Influencer(
            user_id=db_user.id,
            manager_id=test_user.id
        )
        db_session.add(db_influencer)
        db_session.commit()
        db_session.refresh(db_influencer)
    return db_influencer

# Fixture to get an authentication token for the test user
@pytest.fixture(scope="function")
def test_token(client, test_user):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login", # Use settings for prefix
        data={"username": "testuser", "password": "password"}
    )
    # Ensure login was successful before returning token
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

# Fixture to create a test project
@pytest.fixture(scope="function")
def test_project(db_session, test_user):
    project = Project(
        title="Test Project",
        description="Test Description",
        client="Test Client",
        manager_id=test_user.id,
        status="active"
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project

# Fixture to create a test scenario
@pytest.fixture(scope="function")
def test_scenario(db_session, test_project, test_influencer):
    scenario = Scenario(
        project_id=test_project.id,
        influencer_id=test_influencer.id,
        content="Test Scenario Content",
        status="approved"
    )
    db_session.add(scenario)
    db_session.commit()
    db_session.refresh(scenario)
    return scenario

# Fixture to create a test publication
@pytest.fixture(scope="function")
def test_publication(db_session, test_project, test_influencer):
    publication = Publication(
        project_id=test_project.id,
        influencer_id=test_influencer.id,
        content="Test Publication Content", # Assuming content field exists
        status="published"
    )
    db_session.add(publication)
    db_session.commit()
    db_session.refresh(publication)
    return publication 