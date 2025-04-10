import pytest
from fastapi import status

@pytest.mark.comments
def test_create_comment(client, test_token, test_user, test_project):
    """Test comment creation."""
    response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Test comment content",
            "project_id": test_project.id,
            "user_id": test_user.id
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["content"] == "Test comment content"
    assert data["project_id"] == test_project.id
    assert data["user_id"] == test_user.id
    assert "id" in data
    assert "created_at" in data

@pytest.mark.comments
def test_create_comment_nonexistent_project(client, test_token, test_user):
    """Test comment creation with non-existent project."""
    response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Comment on non-existent project",
            "project_id": 999,  # Non-existent project ID
            "user_id": test_user.id
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Project not found"

@pytest.mark.comments
def test_create_comment_nonexistent_user(client, test_token, test_project):
    """Test comment creation with non-existent user."""
    response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Comment by non-existent user",
            "project_id": test_project.id,
            "user_id": 999  # Non-existent user ID
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "User not found"

@pytest.mark.comments
def test_read_comments(client, test_token, test_project):
    """Test retrieving all comments."""
    # First create a comment to ensure there's at least one
    comment_response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Comment for read test",
            "project_id": 1,
            "user_id": 1
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert comment_response.status_code == status.HTTP_200_OK
    
    # Now retrieve all comments
    response = client.get(
        "/api/v1/comments/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "content" in data[0]
    assert "project_id" in data[0]
    assert "user_id" in data[0]

@pytest.mark.comments
def test_read_comment(client, test_token, test_user, test_project):
    """Test retrieving a specific comment."""
    # First create a comment
    comment_response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Comment to be retrieved individually",
            "project_id": test_project.id,
            "user_id": test_user.id
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert comment_response.status_code == status.HTTP_200_OK
    comment_id = comment_response.json()["id"]
    
    # Now retrieve the specific comment
    response = client.get(
        f"/api/v1/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == comment_id
    assert data["content"] == "Comment to be retrieved individually"
    assert data["project_id"] == test_project.id
    assert data["user_id"] == test_user.id

@pytest.mark.comments
def test_read_nonexistent_comment(client, test_token):
    """Test retrieving a non-existent comment."""
    response = client.get(
        "/api/v1/comments/999",  # Non-existent comment ID
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Comment not found"

@pytest.mark.comments
def test_delete_comment(client, test_token, test_user, test_project):
    """Test deleting a comment."""
    # First create a comment
    comment_response = client.post(
        "/api/v1/comments/",
        json={
            "content": "Comment to be deleted",
            "project_id": test_project.id,
            "user_id": test_user.id
        },
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert comment_response.status_code == status.HTTP_200_OK
    comment_id = comment_response.json()["id"]
    
    # Now delete the comment
    response = client.delete(
        f"/api/v1/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Comment deleted successfully"
    
    # Verify the comment is actually deleted
    response = client.get(
        f"/api/v1/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.comments
def test_delete_nonexistent_comment(client, test_token):
    """Test deleting a non-existent comment."""
    response = client.delete(
        "/api/v1/comments/999",  # Non-existent comment ID
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Comment not found" 