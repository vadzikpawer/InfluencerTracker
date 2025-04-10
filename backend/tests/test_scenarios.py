import pytest
from fastapi import status

# Assuming Scenario model/schema has project_id, influencer_id, content, status

@pytest.mark.scenarios
def test_create_scenario(client, test_token, test_project, test_user_influencer):
    """Test scenario creation."""
    response = client.post(
        "/api/v1/scenarios/",
        json={
            "project_id": test_project.id,
            "influencer_id": test_user_influencer.id,
            "content": "Scenario content for testing",
            "status": "pending"
            # Add other required fields if necessary
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["project_id"] == test_project.id
    assert data["influencer_id"] == test_user_influencer.id
    assert data["content"] == "Scenario content for testing"
    assert data["status"] == "pending"
    assert "id" in data

@pytest.mark.scenarios
def test_read_scenarios(client, test_token, test_scenario):
    """Test retrieving all scenarios."""
    response = client.get(
        "/api/v1/scenarios/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(sc["id"] == test_scenario.id for sc in data)

@pytest.mark.scenarios
def test_read_scenario(client, test_token, test_scenario):
    """Test retrieving a specific scenario."""
    response = client.get(
        f"/api/v1/scenarios/{test_scenario.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_scenario.id
    assert data["content"] == test_scenario.content

@pytest.mark.scenarios
def test_read_nonexistent_scenario(client, test_token):
    """Test retrieving a non-existent scenario."""
    response = client.get(
        "/api/v1/scenarios/999",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Scenario not found"

@pytest.mark.scenarios
def test_update_scenario(client, test_token, test_scenario):
    """Test updating a scenario."""
    response = client.put(
        f"/api/v1/scenarios/{test_scenario.id}",
        json={
            "project_id": test_scenario.project_id,
            "influencer_id": test_scenario.influencer_id,
            "content": "Updated Scenario Content",
            "status": "in_review"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_scenario.id
    assert data["content"] == "Updated Scenario Content"
    assert data["status"] == "in_review"

@pytest.mark.scenarios
def test_update_nonexistent_scenario(client, test_token, test_project, test_user_influencer):
    """Test updating a non-existent scenario."""
    response = client.put(
        "/api/v1/scenarios/999",
        json={
            "project_id": test_project.id,
            "influencer_id": test_user_influencer.id,
            "content": "Non-existent scenario",
            "status": "pending"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Scenario not found"

@pytest.mark.scenarios
def test_delete_scenario(client, test_token, test_scenario):
    """Test deleting a scenario."""
    response = client.delete(
        f"/api/v1/scenarios/{test_scenario.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Scenario deleted successfully"
    
    # Verify deletion
    response = client.get(
        f"/api/v1/scenarios/{test_scenario.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.scenarios
def test_delete_nonexistent_scenario(client, test_token):
    """Test deleting a non-existent scenario."""
    response = client.delete(
        "/api/v1/scenarios/999",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Scenario not found" 