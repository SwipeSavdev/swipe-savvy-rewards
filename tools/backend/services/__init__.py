"""
Backend Services Package
Contains all API service modules for SwipeSavvy
"""

from .campaign_service import CampaignService, setup_campaign_routes
from .user_service import UserService, setup_user_routes
from .admin_service import AdminService, setup_admin_routes

__all__ = [
    "CampaignService",
    "UserService",
    "AdminService",
    "setup_campaign_routes",
    "setup_user_routes",
    "setup_admin_routes",
]
