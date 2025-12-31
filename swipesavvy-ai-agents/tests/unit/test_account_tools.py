"""
Unit tests for Account tool functions
"""

import pytest
from tools.account import (
    get_account_balance,
    get_account_info,
    get_account_settings,
    AccountNotFoundError,
    UnauthorizedAccessError
)


@pytest.mark.asyncio
async def test_get_account_balance_returns_dict():
    """Test that get_account_balance returns expected structure"""
    result = await get_account_balance("user_123")
    
    assert isinstance(result, dict)
    assert "available_balance" in result
    assert "pending_balance" in result
    assert "total_balance" in result
    assert "currency" in result
    assert "as_of" in result
    assert result["currency"] == "USD"


@pytest.mark.asyncio
async def test_get_account_info_returns_dict():
    """Test that get_account_info returns expected structure"""
    result = await get_account_info("user_123")
    
    assert isinstance(result, dict)
    assert "account_status" in result
    assert "account_type" in result
    assert "daily_limit" in result
    assert "monthly_limit" in result
    assert "kyc_status" in result
    assert "member_since" in result


@pytest.mark.asyncio
async def test_get_account_settings_returns_dict():
    """Test that get_account_settings returns expected structure"""
    result = await get_account_settings("user_123")
    
    assert isinstance(result, dict)
    assert "notifications_enabled" in result
    assert "language" in result
    assert "timezone" in result


# TODO (Week 4): Add tests for error cases
# - AccountNotFoundError when user doesn't exist
# - UnauthorizedAccessError when access denied
# - API timeout handling
# - Invalid user_id format
