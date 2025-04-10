import pytest
from fastapi import status

def test_create_project(client, test_token, test_user):
    """Test project creation."""
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "New Project",
            "description": "New Description",
            "client": "New Client",
            "manager_id": test_user.id,
            "status": "draft"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "New Project"
    assert data["description"] == "New Description"
    assert data["client"] == "New Client"
    assert data["manager_id"] == test_user.id
    assert data["status"] == "draft"
    assert "id" in data

def test_create_project_nonexistent_manager(client, test_token):
    """Test project creation with non-existent manager ID."""
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Project with Invalid Manager",
            "description": "Description",
            "client": "Client",
            "manager_id": 999,  # Non-existent manager ID
            "status": "draft"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Manager not found"

def test_read_projects(client, test_token, test_project):
    """Test retrieving all projects."""
    response = client.get(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == test_project.title

def test_read_project(client, test_token, test_project):
    """Test retrieving a specific project."""
    response = client.get(
        f"/api/v1/projects/{test_project.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_project.id
    assert data["title"] == test_project.title
    assert data["description"] == test_project.description

def test_read_nonexistent_project(client, test_token):
    """Test retrieving a non-existent project."""
    response = client.get(
        "/api/v1/projects/999",  # Non-existent project ID
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Project not found"

def test_update_project(client, test_token, test_project, test_user):
    """Test updating a project."""
    response = client.put(
        f"/api/v1/projects/{test_project.id}",
        json={
            "title": "Updated Project",
            "description": "Updated Description",
            "client": "Updated Client",
            "manager_id": test_user.id,
            "status": "active"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_project.id
    assert data["title"] == "Updated Project"
    assert data["description"] == "Updated Description"
    assert data["client"] == "Updated Client"
    assert data["status"] == "active"

def test_update_nonexistent_project(client, test_token, test_user):
    """Test updating a non-existent project."""
    response = client.put(
        "/api/v1/projects/999",  # Non-existent project ID
        json={
            "title": "Project That Doesn't Exist",
            "description": "Description",
            "client": "Client",
            "manager_id": test_user.id,
            "status": "active"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Project not found"

def test_delete_project(client, test_token, test_project):
    """Test deleting a project."""
    response = client.delete(
        f"/api/v1/projects/{test_project.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Project deleted successfully"
    
    # Verify the project is actually deleted
    response = client.get(
        f"/api/v1/projects/{test_project.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_nonexistent_project(client, test_token):
    """Test deleting a non-existent project."""
    response = client.delete(
        "/api/v1/projects/999",  # Non-existent project ID
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Project not found" 