"""
Tests for Role-Based Access Control (RBAC).
Tests the @role_required decorator and permission enforcement.
"""

import pytest


class TestRoleRequired:
    """Test @role_required decorator."""
    
    def test_admin_can_access_admin_routes(self, client, admin_headers):
        """Test admin can access admin-only routes."""
        response = client.get("/api/users", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_user_cannot_access_admin_routes(self, client, auth_headers):
        """Test regular user cannot access admin routes."""
        response = client.get("/api/users", headers=auth_headers)
        
        assert response.status_code == 403
        data = response.get_json()
        assert data["success"] is False
        assert data["error"] == "Forbidden"
    
    def test_trainer_can_create_workshop(self, client, trainer_headers):
        """Test trainer can create workshop."""
        response = client.post("/api/workshops", headers=trainer_headers, json={
            "title": "Pottery Workshop",
            "description": "Learn pottery basics",
            "skill_category": "Pottery",
            "max_participants": 20
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["success"] is True
    
    def test_user_cannot_create_workshop(self, client, auth_headers):
        """Test regular user cannot create workshop."""
        response = client.post("/api/workshops", headers=auth_headers, json={
            "title": "Pottery Workshop",
            "description": "Learn pottery basics",
            "skill_category": "Pottery",
            "max_participants": 20
        })
        
        assert response.status_code == 403
        data = response.get_json()
        assert data["success"] is False
    
    def test_admin_can_approve_workshop(self, client, admin_headers, trainer_headers):
        """Test admin can approve workshop."""
        # Create workshop as trainer
        create_response = client.post("/api/workshops", headers=trainer_headers, json={
            "title": "Pottery Workshop",
            "description": "Learn pottery basics",
            "skill_category": "Pottery",
            "max_participants": 20
        })
        
        workshop_id = create_response.get_json()["workshop"]["id"]
        
        # Approve as admin
        response = client.patch(
            f"/api/workshops/{workshop_id}/approve",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["workshop"]["status"] == "APPROVED"
    
    def test_trainer_cannot_approve_workshop(self, client, trainer_headers):
        """Test trainer cannot approve workshop."""
        # Create workshop
        create_response = client.post("/api/workshops", headers=trainer_headers, json={
            "title": "Pottery Workshop",
            "description": "Learn pottery basics",
            "skill_category": "Pottery",
            "max_participants": 20
        })
        
        workshop_id = create_response.get_json()["workshop"]["id"]
        
        # Try to approve (should fail)
        response = client.patch(
            f"/api/workshops/{workshop_id}/approve",
            headers=trainer_headers
        )
        
        assert response.status_code == 403


class TestUserPermissions:
    """Test user-specific permissions."""
    
    def test_user_can_view_own_profile(self, client, auth_headers, test_user):
        """Test user can view their own profile."""
        response = client.get(f"/api/users/{test_user.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["user"]["id"] == test_user.id
    
    def test_user_cannot_view_other_profile(self, client, auth_headers, test_trainer):
        """Test user cannot view other user's profile."""
        response = client.get(f"/api/users/{test_trainer.id}", headers=auth_headers)
        
        assert response.status_code == 403
        data = response.get_json()
        assert data["success"] is False
    
    def test_admin_can_view_any_profile(self, client, admin_headers, test_user):
        """Test admin can view any user's profile."""
        response = client.get(f"/api/users/{test_user.id}", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_user_can_update_own_profile(self, client, auth_headers, test_user):
        """Test user can update their own profile."""
        response = client.put(f"/api/users/{test_user.id}", headers=auth_headers, json={
            "username": "newusername"
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_user_cannot_update_other_profile(self, client, auth_headers, test_trainer):
        """Test user cannot update other user's profile."""
        response = client.put(f"/api/users/{test_trainer.id}", headers=auth_headers, json={
            "username": "hacker"
        })
        
        assert response.status_code == 403
        data = response.get_json()
        assert data["success"] is False


class TestAdminPermissions:
    """Test admin-specific permissions."""
    
    def test_admin_can_list_users(self, client, admin_headers):
        """Test admin can list all users."""
        response = client.get("/api/users", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_admin_can_change_user_role(self, client, admin_headers, test_user):
        """Test admin can change user role."""
        response = client.patch(
            f"/api/users/{test_user.id}/role",
            headers=admin_headers,
            json={"role": "TRAINER"}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["user"]["role"] == "TRAINER"
    
    def test_admin_can_toggle_user_status(self, client, admin_headers, test_user):
        """Test admin can toggle user status."""
        response = client.patch(
            f"/api/users/{test_user.id}/status",
            headers=admin_headers,
            json={"is_active": False}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["user"]["is_active"] is False
    
    def test_admin_can_delete_user(self, client, admin_headers, test_trainer):
        """Test admin can delete user."""
        response = client.delete(
            f"/api/users/{test_trainer.id}",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
    
    def test_admin_cannot_delete_self(self, client, admin_headers, test_admin):
        """Test admin cannot delete their own account."""
        response = client.delete(
            f"/api/users/{test_admin.id}",
            headers=admin_headers
        )
        
        assert response.status_code == 403
        data = response.get_json()
        assert data["success"] is False
