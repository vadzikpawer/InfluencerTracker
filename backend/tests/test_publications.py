import pytest
from fastapi import status

# Assuming Publication model/schema has project_id, influencer_id, content, status

@pytest.mark.publications
def test_create_publication(client, test_token, test_project, test_user_influencer):
    """Test publication creation."""
    response = client.post(
        "/api/v1/publications/",
        json={
            "project_id": test_project.id,
            "influencer_id": test_user_influencer.id,
            "content": "Publication content for testing", # Adjust if field name is different
            "status": "pending",
            "platform": "instagram",
            "publication_url": "http://insta.test/pub1",
            "published_at": "2024-01-01T00:00:00Z"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["project_id"] == test_project.id
    assert data["influencer_id"] == test_user_influencer.id
    assert data["content"] == "Publication content for testing"
    assert data["status"] == "pending"
    assert data["publication_url"] == "http://insta.test/pub1"
    assert "id" in data

@pytest.mark.publications
def test_read_publications(client, test_token, test_publication):
    """Test retrieving all publications."""
    response = client.get(
        "/api/v1/publications/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(pub["id"] == test_publication.id for pub in data)

@pytest.mark.publications
def test_read_publication(client, test_token, test_publication):
    """Test retrieving a specific publication."""
    response = client.get(
        f"/api/v1/publications/{test_publication.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_publication.id
    assert data["content"] == test_publication.content

@pytest.mark.publications
def test_read_nonexistent_publication(client, test_token):
    """Test retrieving a non-existent publication."""
    response = client.get(
        "/api/v1/publications/999",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Publication not found"

@pytest.mark.publications
def test_update_publication(client, test_token, test_publication):
    """Test updating a publication."""
    response = client.put(
        f"/api/v1/publications/{test_publication.id}",
        json={
            "project_id": test_publication.project_id,
            "influencer_id": test_publication.influencer_id,
            "content": "Updated Publication Content",
            "status": "published",
            "platform": "instagram",
            "publication_url": "http://insta.test/pub1_updated",
            "published_at": "2024-01-01T00:00:00Z"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_publication.id
    assert data["content"] == "Updated Publication Content"
    assert data["status"] == "published"
    assert data["publication_url"] == "http://insta.test/pub1_updated"

@pytest.mark.publications
def test_update_nonexistent_publication(client, test_token, test_project, test_user_influencer):
    """Test updating a non-existent publication."""
    response = client.put(
        "/api/v1/publications/999",
        json={
            "project_id": test_project.id,
            "influencer_id": test_user_influencer.id,
            "platform": "instagram",
            "content": "Non-existent publication",
            "status": "pending",
            "publication_url": "http://insta.test/pub1_updated",
            "published_at": "2024-01-01T00:00:00Z"
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Publication not found"

@pytest.mark.publications
def test_delete_publication(client, test_token, test_publication):
    """Test deleting a publication."""
    response = client.delete(
        f"/api/v1/publications/{test_publication.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Publication deleted successfully"
    
    # Verify deletion
    response = client.get(
        f"/api/v1/publications/{test_publication.id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.publications
def test_delete_nonexistent_publication(client, test_token):
    """Test deleting a non-existent publication."""
    response = client.delete(
        "/api/v1/publications/999",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Publication not found" 