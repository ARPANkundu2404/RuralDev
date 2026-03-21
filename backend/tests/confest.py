"""
Test configuration and fixtures for RuralDev tests.
"""

import pytest
from app import create_app, db
from app.models import User, RoleEnum


@pytest.fixture
def app():
    """Create and configure a test app."""
    app = create_app(config_name="testing")
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client for making requests."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def test_user(app):
    """Create a test user."""
    with app.app_context():
        user = User(
            username="testuser",
            email="test@example.com",
            role=RoleEnum.USER.value,
            is_verified=True
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def test_trainer(app):
    """Create a test trainer."""
    with app.app_context():
        user = User(
            username="testtrainer",
            email="trainer@example.com",
            role=RoleEnum.TRAINER.value,
            is_verified=True
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def test_admin(app):
    """Create a test admin."""
    with app.app_context():
        user = User(
            username="testadmin",
            email="admin@example.com",
            role=RoleEnum.ADMIN.value,
            is_verified=True
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authorization headers for test user."""
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    token = response.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, test_admin):
    """Get authorization headers for admin."""
    response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "password123"
    })
    token = response.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def trainer_headers(client, test_trainer):
    """Get authorization headers for trainer."""
    response = client.post("/api/auth/login", json={
        "email": "trainer@example.com",
        "password": "password123"
    })
    token = response.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
