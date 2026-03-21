"""
Tests for authentication routes and services.
"""

import pytest
from app import db
from app.models import User


class TestUserRegistration:
    """Test user registration endpoint."""
    
    def test_successful_registration(self, client):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "role": "USER"
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["success"] is True
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "newuser@example.com"
    
    def test_registration_duplicate_username(self, client, test_user):
        """Test registration with duplicate username."""
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "another@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False
        assert "already exists" in data["message"]
    
    def test_registration_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "test@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False
    
    def test_registration_invalid_password(self, client):
        """Test registration with weak password."""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "weak"
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False
    
    def test_registration_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "not-an-email",
            "password": "password123"
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False


class TestUserLogin:
    """Test user login endpoint."""
    
    def test_successful_login(self, client, test_user):
        """Test successful login."""
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]
        assert data["data"]["token_type"] == "Bearer"
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials."""
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data["success"] is False
    
    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent email."""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data["success"] is False
    
    def test_login_unverified_email(self, client, app):
        """Test login with unverified email."""
        with app.app_context():
            user = User(
                username="unverified",
                email="unverified@example.com",
                role="USER",
                is_verified=False
            )
            user.set_password("password123")
            db.session.add(user)
            db.session.commit()
        
        response = client.post("/api/auth/login", json={
            "email": "unverified@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert "not verified" in data["message"].lower()


class TestLogout:
    """Test logout endpoint."""
    
    def test_successful_logout(self, client, auth_headers):
        """Test successful logout."""
        response = client.post("/api/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_logout_without_token(self, client):
        """Test logout without auth token."""
        response = client.post("/api/auth/logout")
        
        assert response.status_code == 401


class TestGetCurrentUser:
    """Test get current user endpoint."""
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user."""
        response = client.get("/api/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["user"]["username"] == "testuser"
    
    def test_get_current_user_without_token(self, client):
        """Test getting current user without token."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401


class TestRefreshToken:
    """Test token refresh endpoint."""
    
    def test_refresh_token(self, client, test_user):
        """Test refreshing access token."""
        # Login to get tokens
        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        
        refresh_token = login_response.get_json()["data"]["refresh_token"]
        headers = {"Authorization": f"Bearer {refresh_token}"}
        
        # Refresh token
        response = client.post("/api/auth/refresh", headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "access_token" in data["data"]
