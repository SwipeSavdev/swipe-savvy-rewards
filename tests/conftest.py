"""
Pytest configuration and fixtures for testing
Creates a FastAPI test app with all routes configured
"""

import pytest
import sys
import os
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import Mock
from sqlalchemy.orm import Session

# Add the project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Import route setup functions
from tools.backend.services import (
    setup_campaign_routes,
    setup_user_routes,
    setup_admin_routes
)


@pytest.fixture
def mock_db():
    """Create a mock database session for unit tests"""
    return Mock(spec=Session)


@pytest.fixture
def test_app():
    """Create a FastAPI app for testing with all routes registered"""
    app = FastAPI(title="SwipeSavvy Test API")
    
    # Register routes using the module-level functions
    setup_campaign_routes(app)
    setup_user_routes(app)
    setup_admin_routes(app)
    
    return app


@pytest.fixture
def test_client(test_app):
    """Create a TestClient for the test app"""
    return TestClient(test_app)
