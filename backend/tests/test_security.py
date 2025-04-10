import pytest
from fastapi import status
from core.security import create_access_token, verify_password, get_password_hash

def test_password_hashing():
    """Test password hashing and verification."""
    password = "testpassword123"
    hashed_password = get_password_hash(password)
    
    # Verify the password
    assert verify_password(password, hashed_password) is True
    assert verify_password("wrong_password", hashed_password) is False
    
    # Make sure the hash is different from the original password
    assert password != hashed_password

def test_token_creation():
    """Test access token creation."""
    data = {"sub": "testuser"}
    token = create_access_token(data)
    
    # Ensure token is a non-empty string
    assert isinstance(token, str)
    assert len(token) > 0
    
    # Token should be a JWT with 3 parts separated by dots
    parts = token.split(".")
    assert len(parts) == 3

def test_token_authentication(client, test_token):
    """Test authentication with JWT token."""
    # Request with valid token should work
    response = client.get(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Request without token should fail
    response = client.get("/api/v1/projects/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Request with invalid token should fail
    response = client.get(
        "/api/v1/projects/",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 