import pytest
from fastapi import status


@pytest.mark.influencers
def test_read_influencers(client, test_token, test_user_influencer):
    """Test retrieving all influencers."""
    response = client.get(
        "/api/v1/influencers/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check if the test_influencer is in the list
    assert any(inf["id"] == test_user_influencer.id for inf in data)

@pytest.mark.influencers
def test_read_influencer(client, test_token, test_user_influencer):
    """Test retrieving a specific influencer."""
    response = client.get(
        f"/api/v1/influencers/{test_user_influencer.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user_influencer.id

@pytest.mark.influencers
def test_read_nonexistent_influencer(client, test_token):
    """Test retrieving a non-existent influencer."""
    response = client.get(
        "/api/v1/influencers/999",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Influencer not found"

@pytest.mark.influencers
def test_update_influencer(client, test_token, test_user_influencer):
    """Test updating an influencer."""
    response = client.put(
        f"/api/v1/influencers/{test_user_influencer.id}",
        json={
            "bio": "Updated Bio"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["bio"] == "Updated Bio"

@pytest.mark.influencers
def test_update_nonexistent_influencer(client, test_token):
    """Test updating a non-existent influencer."""
    response = client.put(
        "/api/v1/influencers/999",
        json={
            "bio": "Non Existent"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Influencer not found"

