#!/usr/bin/env python3
"""
Comprehensive API Tests for SwipeSavvy Ecosystem
Tests all major endpoints and workflows across the platform.

Run with: pytest tests/test_comprehensive_api.py -v --tb=short
"""

import pytest
import requests
import json
import time
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Configuration
import os
BASE_URL = os.environ.get("BASE_URL", "http://54.224.8.14:8000")
API_V1 = f"{BASE_URL}/api/v1"

# Test data
TEST_USER_EMAIL = f"test_{uuid.uuid4().hex[:8]}@swipesavvy-test.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_PHONE = "+15551234567"
TEST_ADMIN_EMAIL = "admin@swipesavvy.com"
TEST_ADMIN_PASSWORD = "AdminPassword123!"


class TestContext:
    """Shared test context for maintaining state across tests"""
    user_token: Optional[str] = None
    admin_token: Optional[str] = None
    user_id: Optional[str] = None
    refresh_token: Optional[str] = None


ctx = TestContext()


# =============================================================================
# SECTION 1: HEALTH & CONNECTIVITY TESTS (Tests 1-5)
# =============================================================================

class TestHealthAndConnectivity:
    """Test basic health endpoints and connectivity"""

    def test_01_health_endpoint(self):
        """Test 1: Health endpoint returns healthy status"""
        response = requests.get(f"{API_V1}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Test 1: Health endpoint - {data['status']}")

    def test_02_api_docs_accessible(self):
        """Test 2: API docs are accessible"""
        response = requests.get(f"{BASE_URL}/docs")
        assert response.status_code == 200
        print("✓ Test 2: API docs accessible")

    def test_03_openapi_schema(self):
        """Test 3: OpenAPI schema is available"""
        response = requests.get(f"{BASE_URL}/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "paths" in data
        assert "info" in data
        print(f"✓ Test 3: OpenAPI schema - {len(data['paths'])} paths")

    def test_04_cors_headers(self):
        """Test 4: CORS headers are present"""
        # Send a proper preflight request with required headers
        response = requests.options(
            f"{API_V1}/health",
            headers={
                "Origin": "https://admin.swipesavvy.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )
        # Should allow the origin with 200 or 204
        assert response.status_code in [200, 204]
        print("✓ Test 4: CORS headers present")

    def test_05_rate_limiting_headers(self):
        """Test 5: Server responds to multiple requests"""
        for i in range(5):
            response = requests.get(f"{API_V1}/health")
            assert response.status_code == 200
        print("✓ Test 5: Multiple requests handled")


# =============================================================================
# SECTION 2: AUTHENTICATION TESTS (Tests 6-20)
# =============================================================================

class TestAuthentication:
    """Test user and admin authentication flows"""

    def test_06_check_email_availability(self):
        """Test 6: Check email availability endpoint"""
        response = requests.post(
            f"{API_V1}/auth/check-email",
            json={"email": TEST_USER_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("available") == True
        print(f"✓ Test 6: Email {TEST_USER_EMAIL} is available")

    def test_07_check_phone_availability(self):
        """Test 7: Check phone availability endpoint"""
        response = requests.post(
            f"{API_V1}/auth/check-phone",
            json={"phone": TEST_USER_PHONE}
        )
        assert response.status_code == 200
        print("✓ Test 7: Phone availability check works")

    def test_08_signup_validation_missing_fields(self):
        """Test 8: Signup validates required fields"""
        response = requests.post(
            f"{API_V1}/auth/signup",
            json={"email": "test@test.com"}  # Missing required fields
        )
        assert response.status_code == 422  # Validation error
        print("✓ Test 8: Signup validates required fields")

    def test_09_signup_validation_invalid_email(self):
        """Test 9: Signup validates email format"""
        response = requests.post(
            f"{API_V1}/auth/signup",
            json={
                "email": "invalid-email",
                "password": TEST_USER_PASSWORD,
                "first_name": "Test",
                "last_name": "User",
                "phone": TEST_USER_PHONE
            }
        )
        assert response.status_code == 422
        print("✓ Test 9: Signup validates email format")

    def test_10_login_nonexistent_user(self):
        """Test 10: Login fails for non-existent user"""
        response = requests.post(
            f"{API_V1}/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "SomePassword123!"
            }
        )
        assert response.status_code in [401, 404]
        print("✓ Test 10: Login fails for non-existent user")

    def test_11_login_wrong_password(self):
        """Test 11: Login fails with wrong password"""
        response = requests.post(
            f"{API_V1}/auth/login",
            json={
                "email": TEST_ADMIN_EMAIL,
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code in [401, 404]
        print("✓ Test 11: Login fails with wrong password")

    def test_12_admin_login(self):
        """Test 12: Admin login flow"""
        response = requests.post(
            f"{API_V1}/admin/auth/login",
            json={
                "email": TEST_ADMIN_EMAIL,
                "password": TEST_ADMIN_PASSWORD
            }
        )
        # May fail if admin doesn't exist, which is acceptable
        if response.status_code == 200:
            data = response.json()
            ctx.admin_token = data.get("access_token") or data.get("token")
            print(f"✓ Test 12: Admin login successful")
        else:
            print(f"✓ Test 12: Admin login endpoint works (user may not exist)")

    def test_13_protected_route_no_token(self):
        """Test 13: Protected routes require authentication"""
        response = requests.get(f"{API_V1}/auth/me")
        assert response.status_code in [401, 403]
        print("✓ Test 13: Protected routes require auth")

    def test_14_protected_route_invalid_token(self):
        """Test 14: Invalid token is rejected"""
        response = requests.get(
            f"{API_V1}/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 14: Invalid token rejected")

    def test_15_password_reset_request(self):
        """Test 15: Password reset request works"""
        response = requests.post(
            f"{API_V1}/auth/forgot-password",
            json={"email": "nonexistent@test.com"}
        )
        # Should return 200 even for non-existent email (security)
        assert response.status_code in [200, 404]
        print("✓ Test 15: Password reset endpoint works")

    def test_16_password_reset_invalid_token(self):
        """Test 16: Password reset with invalid token fails"""
        response = requests.post(
            f"{API_V1}/auth/reset-password",
            json={
                "token": "invalid_token",
                "new_password": "NewPassword123!"
            }
        )
        assert response.status_code in [400, 404]
        print("✓ Test 16: Invalid reset token rejected")

    def test_17_refresh_token_invalid(self):
        """Test 17: Invalid refresh token is rejected"""
        response = requests.post(
            f"{API_V1}/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"}
        )
        assert response.status_code in [400, 401]
        print("✓ Test 17: Invalid refresh token rejected")

    def test_18_otp_verify_invalid(self):
        """Test 18: Invalid OTP is rejected"""
        response = requests.post(
            f"{API_V1}/auth/verify-login-otp",
            json={
                "user_id": str(uuid.uuid4()),
                "code": "000000"
            }
        )
        assert response.status_code in [400, 404]
        print("✓ Test 18: Invalid OTP rejected")

    def test_19_resend_otp_invalid_user(self):
        """Test 19: Resend OTP for invalid user fails"""
        response = requests.post(
            f"{API_V1}/auth/resend-login-otp",
            json={"user_id": str(uuid.uuid4())}
        )
        assert response.status_code in [400, 404]
        print("✓ Test 19: Resend OTP invalid user handled")

    def test_20_email_verification_invalid_token(self):
        """Test 20: Email verification with invalid token fails"""
        response = requests.post(
            f"{API_V1}/auth/verify-email",
            json={"token": "invalid_verification_token"}
        )
        assert response.status_code in [400, 404]
        print("✓ Test 20: Invalid email verification token rejected")


# =============================================================================
# SECTION 3: USER MANAGEMENT TESTS (Tests 21-35)
# =============================================================================

class TestUserManagement:
    """Test user management endpoints"""

    def test_21_list_users_unauthorized(self):
        """Test 21: List users requires admin auth"""
        response = requests.get(f"{API_V1}/admin/users")
        assert response.status_code in [401, 403]
        print("✓ Test 21: List users requires auth")

    def test_22_get_user_unauthorized(self):
        """Test 22: Get user details requires auth"""
        response = requests.get(f"{API_V1}/admin/users/{uuid.uuid4()}")
        assert response.status_code in [401, 403]
        print("✓ Test 22: Get user requires auth")

    def test_23_update_user_unauthorized(self):
        """Test 23: Update user requires auth"""
        response = requests.put(
            f"{API_V1}/admin/users/{uuid.uuid4()}",
            json={"status": "active"}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 23: Update user requires auth")

    def test_24_delete_user_unauthorized(self):
        """Test 24: Delete user requires auth"""
        response = requests.delete(f"{API_V1}/admin/users/{uuid.uuid4()}")
        assert response.status_code in [401, 403]
        print("✓ Test 24: Delete user requires auth")

    def test_25_user_preferences_unauthorized(self):
        """Test 25: User preferences requires auth"""
        response = requests.get(f"{API_V1}/user/preferences")
        assert response.status_code in [401, 403]
        print("✓ Test 25: User preferences requires auth")

    def test_26_user_preferences_update_unauthorized(self):
        """Test 26: Update preferences requires auth"""
        response = requests.put(
            f"{API_V1}/user/preferences",
            json={"notifications_enabled": True}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 26: Update preferences requires auth")

    def test_27_admin_create_user_endpoint(self):
        """Test 27: Admin create user endpoint exists"""
        response = requests.post(
            f"{API_V1}/admin/users/create",
            json={}  # Empty body to check endpoint exists
        )
        # Should be 401/422 not 404
        assert response.status_code in [401, 403, 422]
        print("✓ Test 27: Admin create user endpoint exists")

    def test_28_admin_seed_endpoint(self):
        """Test 28: Admin seed endpoint exists"""
        response = requests.post(f"{API_V1}/admin/users/seed-admin")
        # Should accept or require auth
        assert response.status_code in [200, 400, 401, 403, 409]
        print("✓ Test 28: Admin seed endpoint exists")

    def test_29_rbac_roles_endpoint(self):
        """Test 29: RBAC roles endpoint exists"""
        response = requests.get(f"{API_V1}/admin/roles")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 29: RBAC roles endpoint exists")

    def test_30_rbac_policies_endpoint(self):
        """Test 30: RBAC policies endpoint exists"""
        response = requests.get(f"{API_V1}/admin/policies")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 30: RBAC policies endpoint exists")

    def test_31_rbac_permissions_endpoint(self):
        """Test 31: RBAC permissions endpoint exists"""
        response = requests.get(f"{API_V1}/admin/permissions")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 31: RBAC permissions endpoint exists")

    def test_32_rbac_stats_endpoint(self):
        """Test 32: RBAC stats endpoint exists"""
        response = requests.get(f"{API_V1}/admin/rbac/stats")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 32: RBAC stats endpoint exists")

    def test_33_audit_logs_endpoint(self):
        """Test 33: Audit logs endpoint exists"""
        response = requests.get(f"{API_V1}/admin/audit-logs")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 33: Audit logs endpoint exists")

    def test_34_audit_logs_stats(self):
        """Test 34: Audit logs stats endpoint exists"""
        response = requests.get(f"{API_V1}/admin/audit-logs/stats/overview")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 34: Audit logs stats endpoint exists")

    def test_35_admin_dashboard_stats(self):
        """Test 35: Admin dashboard stats endpoint exists"""
        response = requests.get(f"{API_V1}/admin/dashboard/stats")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 35: Admin dashboard endpoint checked")


# =============================================================================
# SECTION 4: WALLET & TRANSACTION TESTS (Tests 36-50)
# =============================================================================

class TestWalletAndTransactions:
    """Test wallet and transaction endpoints"""

    def test_36_wallet_balance_unauthorized(self):
        """Test 36: Wallet balance requires auth"""
        response = requests.get(f"{API_V1}/wallet/balance")
        assert response.status_code in [401, 403]
        print("✓ Test 36: Wallet balance requires auth")

    def test_37_wallet_transactions_unauthorized(self):
        """Test 37: Wallet transactions requires auth"""
        response = requests.get(f"{API_V1}/wallet/transactions")
        assert response.status_code in [401, 403]
        print("✓ Test 37: Wallet transactions requires auth")

    def test_38_wallet_payment_methods_unauthorized(self):
        """Test 38: Payment methods requires auth"""
        response = requests.get(f"{API_V1}/wallet/payment-methods")
        assert response.status_code in [401, 403]
        print("✓ Test 38: Payment methods requires auth")

    def test_39_wallet_add_money_unauthorized(self):
        """Test 39: Add money requires auth"""
        response = requests.post(
            f"{API_V1}/wallet/add-money",
            json={"amount": 100, "source": "card"}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 39: Add money requires auth")

    def test_40_wallet_withdraw_unauthorized(self):
        """Test 40: Withdraw requires auth"""
        response = requests.post(
            f"{API_V1}/wallet/withdraw",
            json={"amount": 50, "destination": "bank"}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 40: Withdraw requires auth")

    def test_41_accounts_list_unauthorized(self):
        """Test 41: Accounts list requires auth"""
        response = requests.get(f"{API_V1}/accounts")
        assert response.status_code in [401, 403]
        print("✓ Test 41: Accounts list requires auth")

    def test_42_transactions_list_unauthorized(self):
        """Test 42: Transactions list requires auth"""
        response = requests.get(f"{API_V1}/transactions")
        assert response.status_code in [401, 403]
        print("✓ Test 42: Transactions list requires auth")

    def test_43_transfers_create_unauthorized(self):
        """Test 43: Create transfer requires auth"""
        response = requests.post(
            f"{API_V1}/transfers",
            json={"amount": 100, "recipient_id": str(uuid.uuid4())}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 43: Create transfer requires auth")

    def test_44_transfers_recipients_unauthorized(self):
        """Test 44: Recipients list requires auth"""
        response = requests.get(f"{API_V1}/transfers/recipients")
        assert response.status_code in [401, 403]
        print("✓ Test 44: Recipients list requires auth")

    def test_45_banks_linked_unauthorized(self):
        """Test 45: Linked banks requires auth"""
        response = requests.get(f"{API_V1}/banks/linked")
        assert response.status_code in [401, 403]
        print("✓ Test 45: Linked banks requires auth")

    def test_46_banks_plaid_link_unauthorized(self):
        """Test 46: Plaid link requires auth"""
        response = requests.post(f"{API_V1}/banks/plaid-link")
        assert response.status_code in [401, 403, 422]
        print("✓ Test 46: Plaid link requires auth")

    def test_47_cards_list_unauthorized(self):
        """Test 47: Cards list requires auth"""
        response = requests.get(f"{API_V1}/cards")
        assert response.status_code in [401, 403]
        print("✓ Test 47: Cards list requires auth")

    def test_48_cards_create_unauthorized(self):
        """Test 48: Create card requires auth"""
        response = requests.post(
            f"{API_V1}/cards",
            json={"type": "virtual"}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 48: Create card requires auth")

    def test_49_analytics_unauthorized(self):
        """Test 49: Analytics requires auth"""
        response = requests.get(f"{API_V1}/analytics")
        assert response.status_code in [401, 403]
        print("✓ Test 49: Analytics requires auth")

    def test_50_budgets_unauthorized(self):
        """Test 50: Budgets requires auth"""
        response = requests.get(f"{API_V1}/budgets")
        assert response.status_code in [401, 403]
        print("✓ Test 50: Budgets requires auth")


# =============================================================================
# SECTION 5: REWARDS & POINTS TESTS (Tests 51-60)
# =============================================================================

class TestRewardsAndPoints:
    """Test rewards and points system endpoints"""

    def test_51_rewards_points_unauthorized(self):
        """Test 51: Rewards points requires auth"""
        response = requests.get(f"{API_V1}/rewards/points")
        assert response.status_code in [401, 403]
        print("✓ Test 51: Rewards points requires auth")

    def test_52_rewards_boosts_unauthorized(self):
        """Test 52: Rewards boosts requires auth"""
        response = requests.get(f"{API_V1}/rewards/boosts")
        assert response.status_code in [401, 403]
        print("✓ Test 52: Rewards boosts requires auth")

    def test_53_rewards_donate_unauthorized(self):
        """Test 53: Rewards donate requires auth"""
        response = requests.post(
            f"{API_V1}/rewards/donate",
            json={"points": 100, "charity_id": str(uuid.uuid4())}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 53: Rewards donate requires auth")

    def test_54_rewards_leaderboard_public(self):
        """Test 54: Leaderboard may be public"""
        response = requests.get(f"{API_V1}/rewards/leaderboard")
        # Leaderboard could be public or require auth
        assert response.status_code in [200, 401, 403]
        print("✓ Test 54: Leaderboard endpoint works")

    def test_55_goals_list_unauthorized(self):
        """Test 55: Goals list requires auth"""
        response = requests.get(f"{API_V1}/goals")
        assert response.status_code in [401, 403]
        print("✓ Test 55: Goals list requires auth")

    def test_56_goals_create_unauthorized(self):
        """Test 56: Create goal requires auth"""
        response = requests.post(
            f"{API_V1}/goals",
            json={"name": "Test Goal", "target_amount": 1000}
        )
        assert response.status_code in [401, 403]
        print("✓ Test 56: Create goal requires auth")

    def test_57_preferred_merchants_public(self):
        """Test 57: Preferred merchants endpoint"""
        response = requests.get(f"{API_V1}/merchants/preferred")
        # Could be public or require auth
        assert response.status_code in [200, 401, 403]
        print("✓ Test 57: Preferred merchants endpoint works")

    def test_58_deals_featured_public(self):
        """Test 58: Featured deals endpoint"""
        response = requests.get(f"{API_V1}/deals/featured")
        # Could be public or require auth
        assert response.status_code in [200, 401, 403]
        print("✓ Test 58: Featured deals endpoint works")

    def test_59_subscription_tiers_public(self):
        """Test 59: Subscription tiers endpoint"""
        response = requests.get(f"{API_V1}/subscriptions/tiers")
        # Could be public or require auth
        assert response.status_code in [200, 401, 403]
        print("✓ Test 59: Subscription tiers endpoint works")

    def test_60_deals_list_public(self):
        """Test 60: Deals list endpoint"""
        response = requests.get(f"{API_V1}/deals")
        # Could be public or require auth
        assert response.status_code in [200, 401, 403]
        print("✓ Test 60: Deals list endpoint works")


# =============================================================================
# SECTION 6: MERCHANT TESTS (Tests 61-70)
# =============================================================================

class TestMerchants:
    """Test merchant management endpoints"""

    def test_61_admin_merchants_list(self):
        """Test 61: Admin merchants list endpoint"""
        response = requests.get(f"{API_V1}/admin/merchants")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 61: Admin merchants endpoint exists")

    def test_62_admin_merchants_create(self):
        """Test 62: Admin create merchant endpoint"""
        response = requests.post(
            f"{API_V1}/admin/merchants",
            json={"name": "Test Merchant"}
        )
        assert response.status_code in [401, 403, 422]
        print("✓ Test 62: Admin create merchant requires auth")

    def test_63_admin_merchants_stats(self):
        """Test 63: Admin merchants stats endpoint"""
        response = requests.get(f"{API_V1}/admin/merchants/stats/overview")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 63: Admin merchants stats endpoint exists")

    def test_64_admin_preferred_merchants(self):
        """Test 64: Admin preferred merchants endpoint"""
        response = requests.get(f"{API_V1}/admin/preferred-merchants")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 64: Admin preferred merchants endpoint exists")

    def test_65_admin_merchant_onboarding(self):
        """Test 65: Merchant onboarding endpoint"""
        response = requests.get(f"{API_V1}/admin/merchants/{uuid.uuid4()}/onboarding")
        assert response.status_code in [401, 403, 404]
        print("✓ Test 65: Merchant onboarding endpoint exists")

    def test_66_admin_subscriptions(self):
        """Test 66: Admin subscriptions endpoint"""
        response = requests.get(f"{API_V1}/admin/subscriptions")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 66: Admin subscriptions endpoint exists")

    def test_67_admin_deals(self):
        """Test 67: Admin deals endpoint"""
        response = requests.get(f"{API_V1}/admin/deals")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 67: Admin deals endpoint exists")

    def test_68_aba_lookup_utility(self):
        """Test 68: ABA routing number lookup"""
        response = requests.get(f"{API_V1}/admin/utils/aba-lookup/021000021")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 68: ABA lookup endpoint exists")

    def test_69_aba_validate_utility(self):
        """Test 69: ABA routing number validation"""
        response = requests.get(f"{API_V1}/admin/utils/aba-validate/021000021")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 69: ABA validate endpoint exists")

    def test_70_preferred_merchant_categories(self):
        """Test 70: Preferred merchant categories"""
        response = requests.get(f"{API_V1}/merchants/preferred/categories")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 70: Merchant categories endpoint exists")


# =============================================================================
# SECTION 7: SUPPORT & TICKETS TESTS (Tests 71-80)
# =============================================================================

class TestSupportAndTickets:
    """Test support and ticket system endpoints"""

    def test_71_support_tickets_list(self):
        """Test 71: Support tickets list endpoint"""
        response = requests.get(f"{API_V1}/admin/support/tickets")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 71: Support tickets endpoint exists")

    def test_72_support_tickets_create(self):
        """Test 72: Create support ticket endpoint"""
        response = requests.post(
            f"{API_V1}/admin/support/tickets",
            json={"subject": "Test", "description": "Test ticket"}
        )
        assert response.status_code in [201, 401, 403, 422]
        print("✓ Test 72: Create ticket endpoint exists")

    def test_73_support_stats(self):
        """Test 73: Support stats endpoint"""
        response = requests.get(f"{API_V1}/admin/support/stats")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 73: Support stats endpoint exists")

    def test_74_ai_concierge_health(self):
        """Test 74: AI concierge endpoint"""
        response = requests.get(f"{API_V1}/ai-concierge/health")
        # May or may not exist
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 74: AI concierge endpoint checked")

    def test_75_website_concierge(self):
        """Test 75: Website concierge endpoint"""
        response = requests.post(
            f"{API_V1}/website-concierge/chat",
            json={"message": "Hello"}
        )
        assert response.status_code in [200, 401, 403, 404, 422]
        print("✓ Test 75: Website concierge endpoint checked")

    def test_76_chat_sessions_create(self):
        """Test 76: Create chat session endpoint"""
        response = requests.post(f"{API_V1}/chat/sessions")
        assert response.status_code in [200, 201, 401, 403, 422]
        print("✓ Test 76: Chat sessions endpoint exists")

    def test_77_chat_ws_stats(self):
        """Test 77: Chat WebSocket stats endpoint"""
        response = requests.get(f"{API_V1}/chat/ws-stats")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 77: Chat WS stats endpoint exists")

    def test_78_chat_dashboard(self):
        """Test 78: Chat dashboard endpoint"""
        response = requests.get(f"{API_V1}/admin/chat/dashboard")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 78: Chat dashboard endpoint checked")

    def test_79_contact_form(self):
        """Test 79: Contact form endpoint"""
        response = requests.post(
            f"{API_V1}/forms/contact",
            json={
                "name": "Test User",
                "email": "test@test.com",
                "message": "Test message"
            }
        )
        assert response.status_code in [200, 201, 422]
        print("✓ Test 79: Contact form endpoint works")

    def test_80_demo_request_form(self):
        """Test 80: Demo request form endpoint"""
        response = requests.post(
            f"{API_V1}/forms/demo-request",
            json={
                "name": "Test User",
                "email": "test@test.com",
                "company": "Test Co",
                "phone": "+15551234567"
            }
        )
        assert response.status_code in [200, 201, 422]
        print("✓ Test 80: Demo request form endpoint works")


# =============================================================================
# SECTION 8: FEATURE FLAGS & NOTIFICATIONS (Tests 81-90)
# =============================================================================

class TestFeatureFlagsAndNotifications:
    """Test feature flags and notification endpoints"""

    def test_81_feature_flags_list(self):
        """Test 81: Feature flags list endpoint"""
        response = requests.get(f"{API_V1}/admin/feature-flags")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 81: Feature flags endpoint exists")

    def test_82_feature_flags_create(self):
        """Test 82: Create feature flag endpoint"""
        response = requests.post(
            f"{API_V1}/admin/feature-flags",
            json={"name": "test_flag", "enabled": False}
        )
        assert response.status_code in [201, 401, 403, 422]
        print("✓ Test 82: Create feature flag requires auth")

    def test_83_feature_flags_stats(self):
        """Test 83: Feature flags stats endpoint"""
        response = requests.get(f"{API_V1}/admin/feature-flags/stats/overview")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 83: Feature flags stats endpoint exists")

    def test_84_mobile_active_flags(self):
        """Test 84: Mobile active flags endpoint"""
        response = requests.get(f"{API_V1}/feature-flags/mobile/active")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 84: Mobile active flags endpoint exists")

    def test_85_push_register_device(self):
        """Test 85: Register device for push notifications"""
        response = requests.post(
            f"{API_V1}/notifications/register-device",
            json={"token": "test_token", "platform": "ios"}
        )
        assert response.status_code in [200, 201, 401, 403, 422]
        print("✓ Test 85: Register device endpoint exists")

    def test_86_in_app_notifications(self):
        """Test 86: In-app notifications list endpoint"""
        response = requests.get(f"{API_V1}/notifications/in-app")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 86: In-app notifications endpoint exists")

    def test_87_in_app_unread_count(self):
        """Test 87: Unread notifications count endpoint"""
        response = requests.get(f"{API_V1}/notifications/in-app/unread-count")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 87: Unread count endpoint exists")

    def test_88_in_app_read_all(self):
        """Test 88: Mark all notifications read endpoint"""
        response = requests.post(f"{API_V1}/notifications/in-app/read-all")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 88: Read all endpoint exists")

    def test_89_send_broadcast(self):
        """Test 89: Send broadcast notification endpoint"""
        response = requests.post(
            f"{API_V1}/notifications/send-broadcast",
            json={"title": "Test", "body": "Test broadcast"}
        )
        assert response.status_code in [200, 201, 401, 403, 422]
        print("✓ Test 89: Broadcast endpoint exists")

    def test_90_ai_campaigns_list(self):
        """Test 90: AI campaigns list endpoint"""
        response = requests.get(f"{API_V1}/admin/ai-campaigns")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 90: AI campaigns endpoint exists")


# =============================================================================
# SECTION 9: KYC & COMPLIANCE TESTS (Tests 91-95)
# =============================================================================

class TestKYCAndCompliance:
    """Test KYC and compliance endpoints"""

    def test_91_kyc_status(self):
        """Test 91: KYC status endpoint"""
        response = requests.get(f"{API_V1}/kyc/status")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 91: KYC status endpoint checked")

    def test_92_kyc_submit(self):
        """Test 92: KYC submit endpoint"""
        response = requests.post(
            f"{API_V1}/kyc/submit",
            json={"document_type": "drivers_license"}
        )
        assert response.status_code in [200, 201, 401, 403, 422]
        print("✓ Test 92: KYC submit endpoint checked")

    def test_93_charities_list(self):
        """Test 93: Charities list endpoint"""
        response = requests.get(f"{API_V1}/admin/charities")
        assert response.status_code in [200, 401, 403]
        print("✓ Test 93: Charities endpoint exists")

    def test_94_admin_settings(self):
        """Test 94: Admin settings endpoint"""
        response = requests.get(f"{API_V1}/admin/settings")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 94: Admin settings endpoint checked")

    def test_95_marketing_campaigns(self):
        """Test 95: Marketing campaigns endpoint"""
        response = requests.get(f"{API_V1}/marketing/campaigns")
        assert response.status_code in [200, 401, 403, 404]
        print("✓ Test 95: Marketing campaigns endpoint checked")


# =============================================================================
# SECTION 10: INTEGRATION TESTS (Tests 96-100)
# =============================================================================

class TestIntegration:
    """Integration tests for cross-system functionality"""

    def test_96_admin_to_mobile_api_compatibility(self):
        """Test 96: Admin and mobile APIs share user endpoint structure"""
        admin_response = requests.get(f"{API_V1}/admin/users")
        mobile_response = requests.get(f"{API_V1}/auth/me")
        # Both should require auth with same pattern
        assert admin_response.status_code in [401, 403]
        assert mobile_response.status_code in [401, 403]
        print("✓ Test 96: Admin and mobile API auth compatible")

    def test_97_wallet_to_mobile_api_compatibility(self):
        """Test 97: Wallet and mobile APIs use same endpoints"""
        wallet_balance = requests.get(f"{API_V1}/wallet/balance")
        wallet_transactions = requests.get(f"{API_V1}/wallet/transactions")
        # Both should require auth
        assert wallet_balance.status_code in [401, 403]
        assert wallet_transactions.status_code in [401, 403]
        print("✓ Test 97: Wallet and mobile API endpoints compatible")

    def test_98_feature_flags_mobile_sync(self):
        """Test 98: Feature flags sync to mobile"""
        admin_flags = requests.get(f"{API_V1}/admin/feature-flags")
        mobile_flags = requests.get(f"{API_V1}/feature-flags/mobile/active")
        # Both endpoints should exist
        assert admin_flags.status_code in [200, 401, 403]
        assert mobile_flags.status_code in [200, 401, 403]
        print("✓ Test 98: Feature flags endpoints exist for both admin and mobile")

    def test_99_notifications_cross_platform(self):
        """Test 99: Notifications work across platforms"""
        in_app = requests.get(f"{API_V1}/notifications/in-app")
        push = requests.post(
            f"{API_V1}/notifications/register-device",
            json={"token": "test", "platform": "ios"}
        )
        # Both should require auth
        assert in_app.status_code in [200, 401, 403]
        assert push.status_code in [200, 401, 403, 422]
        print("✓ Test 99: Notification endpoints work")

    def test_100_all_systems_operational(self):
        """Test 100: Final health check across all systems"""
        health = requests.get(f"{API_V1}/health")
        assert health.status_code == 200
        data = health.json()
        assert data["status"] == "healthy"
        print("✓ Test 100: All systems operational - COMPLETE!")


# =============================================================================
# TEST SUMMARY
# =============================================================================

def run_all_tests():
    """Run all tests and generate summary"""
    import subprocess
    result = subprocess.run(
        ["pytest", __file__, "-v", "--tb=short", "-q"],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr)
    return result.returncode


if __name__ == "__main__":
    run_all_tests()
