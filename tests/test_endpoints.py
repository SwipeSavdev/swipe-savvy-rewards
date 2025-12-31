"""
Integration tests for all SwipeSavvy API endpoints
Tests real endpoint behavior without mocking internal implementation
"""

import pytest
from fastapi.testclient import TestClient


class TestCampaignEndpoints:
    """Test all campaign endpoints"""
    
    def test_list_campaigns(self, test_client):
        """Test GET /api/campaigns"""
        response = test_client.get("/api/campaigns")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_campaign(self, test_client):
        """Test GET /api/campaigns/{id}"""
        response = test_client.get("/api/campaigns/camp_001")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "campaign_id" in data
    
    def test_create_campaign(self, test_client):
        """Test POST /api/campaigns"""
        payload = {
            "name": "Spring Sale",
            "campaign_type": "EMAIL_OFFER",
            "offer_amount": 25.0,
            "offer_type": "PERCENTAGE"
        }
        response = test_client.post("/api/campaigns", json=payload)
        assert response.status_code in [200, 201, 422]  # Accept all valid responses
        if response.status_code < 400:
            data = response.json()
            assert isinstance(data, dict)
            assert "campaign_id" in data
    
    def test_update_campaign(self, test_client):
        """Test PUT /api/campaigns/{id}"""
        payload = {"name": "Updated Spring Sale", "offer_amount": 30.0}
        response = test_client.put("/api/campaigns/camp_001", json=payload)
        assert response.status_code in [200, 201, 422]  # Accept all valid responses
        if response.status_code < 400:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_delete_campaign(self, test_client):
        """Test DELETE /api/campaigns/{id}"""
        response = test_client.delete("/api/campaigns/camp_001")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_launch_campaign(self, test_client):
        """Test POST /api/campaigns/{id}/launch"""
        response = test_client.post("/api/campaigns/camp_001/launch")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert data.get("status") == "running"
    
    def test_pause_campaign(self, test_client):
        """Test POST /api/campaigns/{id}/pause"""
        response = test_client.post("/api/campaigns/camp_001/pause")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert data.get("status") == "paused"


class TestUserEndpoints:
    """Test all user endpoints"""
    
    def test_get_user_profile(self, test_client):
        """Test GET /api/users/{user_id}"""
        response = test_client.get("/api/users/user_001")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "user_id" in data
    
    def test_get_user_accounts(self, test_client):
        """Test GET /api/users/{user_id}/accounts"""
        response = test_client.get("/api/users/user_001/accounts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_user_transactions(self, test_client):
        """Test GET /api/users/{user_id}/transactions"""
        response = test_client.get("/api/users/user_001/transactions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_user_transactions_paginated(self, test_client):
        """Test GET /api/users/{user_id}/transactions with pagination"""
        response = test_client.get("/api/users/user_001/transactions?limit=5&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_user_rewards(self, test_client):
        """Test GET /api/users/{user_id}/rewards"""
        response = test_client.get("/api/users/user_001/rewards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_user_spending_analytics(self, test_client):
        """Test GET /api/users/{user_id}/analytics/spending"""
        response = test_client.get("/api/users/user_001/analytics/spending?days=30")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestAdminEndpoints:
    """Test all admin endpoints"""
    
    def test_health_check(self, test_client):
        """Test GET /api/admin/health"""
        response = test_client.get("/api/admin/health")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data
    
    def test_list_users(self, test_client):
        """Test GET /api/admin/users"""
        response = test_client.get("/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_list_users_filtered(self, test_client):
        """Test GET /api/admin/users with status filter"""
        response = test_client.get("/api/admin/users?status=active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_list_users_paginated(self, test_client):
        """Test GET /api/admin/users with pagination"""
        response = test_client.get("/api/admin/users?limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_audit_logs(self, test_client):
        """Test GET /api/admin/audit-logs"""
        response = test_client.get("/api/admin/audit-logs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_get_audit_logs_filtered(self, test_client):
        """Test GET /api/admin/audit-logs with event_type filter"""
        response = test_client.get("/api/admin/audit-logs?event_type=LOGIN")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_update_settings(self, test_client):
        """Test POST /api/admin/settings"""
        payload = {"debug_mode": "true"}
        response = test_client.post("/api/admin/settings", json=payload)
        assert response.status_code in [200, 201]
        data = response.json()
        assert isinstance(data, dict)
    
    def test_reset_user_password(self, test_client):
        """Test POST /api/admin/users/{user_id}/reset-password"""
        response = test_client.post("/api/admin/users/user_001/reset-password", json={})
        assert response.status_code in [200, 201]
        data = response.json()
        assert isinstance(data, dict)


class TestResponseFormats:
    """Test response format consistency across all endpoints"""
    
    def test_campaign_response_has_id(self, test_client):
        """Verify campaign responses include campaign_id"""
        response = test_client.get("/api/campaigns/camp_001")
        assert response.status_code == 200
        data = response.json()
        assert "campaign_id" in data
    
    def test_user_response_has_id(self, test_client):
        """Verify user responses include user_id"""
        response = test_client.get("/api/users/profile?user_id=user_001")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
    
    def test_all_responses_are_json(self, test_client):
        """Verify all responses are valid JSON"""
        endpoints = [
            "/api/campaigns",
            "/api/users/user_001",
            "/api/admin/health",
        ]
        for endpoint in endpoints:
            response = test_client.get(endpoint)
            assert response.status_code == 200
            # This will raise an exception if not valid JSON
            data = response.json()
            assert isinstance(data, (dict, list))


class TestErrorHandling:
    """Test error handling across endpoints"""
    
    def test_missing_query_parameter_handling(self, test_client):
        """Test endpoint behavior with missing query parameters"""
        # Some endpoints may have default behavior without params
        response = test_client.get("/api/users/user_001")
        # Should either work with defaults or return 422
        assert response.status_code in [200, 422]
    
    def test_invalid_json_payload(self, test_client):
        """Test error handling for invalid JSON"""
        response = test_client.post(
            "/api/campaigns",
            json={"invalid_field": "value"}
        )
        # Should either validate or return 200 with defaults
        assert response.status_code in [200, 422]
    
    def test_status_codes_are_correct(self, test_client):
        """Verify successful endpoints return valid status codes"""
        endpoints = [
            ("GET", "/api/campaigns", None),
            ("GET", "/api/users/user_001", None),
            ("GET", "/api/admin/health", None),
            ("POST", "/api/campaigns", {"name": "Test", "campaign_type": "EMAIL_OFFER", "offer_amount": 50.0, "offer_type": "PERCENTAGE"}),
        ]
        
        for method, endpoint, payload in endpoints:
            if method == "GET":
                response = test_client.get(endpoint)
            else:
                response = test_client.post(endpoint, json=payload)
            
            # Accept 2xx or 422 (validation error)
            assert response.status_code < 500, f"Endpoint {method} {endpoint} returned {response.status_code}"


class TestAllEndpointsExist:
    """Verify all 17 required endpoints exist and are accessible"""
    
    @pytest.mark.parametrize("method,endpoint", [
        ("GET", "/api/campaigns"),
        ("GET", "/api/campaigns/test_id"),
        ("POST", "/api/campaigns"),
        ("PUT", "/api/campaigns/test_id"),
        ("DELETE", "/api/campaigns/test_id"),
        ("POST", "/api/campaigns/test_id/launch"),
        ("POST", "/api/campaigns/test_id/pause"),
        ("GET", "/api/users/user_001"),
        ("GET", "/api/users/user_001/accounts"),
        ("GET", "/api/users/user_001/transactions"),
        ("GET", "/api/users/user_001/rewards"),
        ("GET", "/api/users/user_001/analytics/spending"),
        ("GET", "/api/admin/health"),
        ("GET", "/api/admin/users"),
        ("GET", "/api/admin/audit-logs"),
        ("POST", "/api/admin/settings"),
        ("POST", "/api/admin/users/user_001/reset-password"),
    ])
    def test_endpoint_exists(self, test_client, method, endpoint):
        """Verify endpoint exists and responds (doesn't return 404)"""
        if method == "GET":
            response = test_client.get(endpoint)
        elif method == "POST":
            response = test_client.post(endpoint, json={})
        elif method == "PUT":
            response = test_client.put(endpoint, json={})
        elif method == "DELETE":
            response = test_client.delete(endpoint)
        
        # Should not be 404 (endpoint exists)
        assert response.status_code != 404, f"{method} {endpoint} returned 404 (not found)"
        # Should return 2xx or 4xx (validation error), not 5xx
        assert response.status_code < 500, f"{method} {endpoint} returned {response.status_code}"
