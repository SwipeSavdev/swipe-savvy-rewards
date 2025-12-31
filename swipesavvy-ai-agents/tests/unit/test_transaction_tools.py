"""
Unit tests for Transaction tool functions
"""

import pytest
from tools.transactions import (
    get_recent_transactions,
    get_transaction_details,
    search_transactions,
    TransactionNotFoundError
)


@pytest.mark.asyncio
async def test_get_recent_transactions_default_params():
    """Test get_recent_transactions with default parameters"""
    result = await get_recent_transactions("user_123")
    
    assert isinstance(result, dict)
    assert "transactions" in result
    assert "total_count" in result
    assert "has_more" in result
    assert isinstance(result["transactions"], list)


@pytest.mark.asyncio
async def test_get_recent_transactions_with_limit():
    """Test get_recent_transactions with custom limit"""
    result = await get_recent_transactions("user_123", limit=5)
    
    assert isinstance(result, dict)
    assert "transactions" in result


@pytest.mark.asyncio
async def test_get_transaction_details():
    """Test get_transaction_details returns expected structure"""
    result = await get_transaction_details("txn_123")
    
    assert isinstance(result, dict)
    assert "transaction_id" in result
    assert "status" in result
    assert "amount" in result
    assert "currency" in result
    assert "merchant" in result
    assert "category" in result
    assert "date" in result


@pytest.mark.asyncio
async def test_search_transactions_with_query():
    """Test search_transactions with text query"""
    result = await search_transactions("user_123", query="starbucks")
    
    assert isinstance(result, dict)
    assert "transactions" in result
    assert "total_count" in result
    assert "filters_applied" in result


@pytest.mark.asyncio
async def test_search_transactions_with_date_range():
    """Test search_transactions with date range"""
    result = await search_transactions(
        "user_123",
        start_date="2025-01-01",
        end_date="2025-01-31"
    )
    
    assert isinstance(result, dict)
    assert result["filters_applied"]["start_date"] == "2025-01-01"
    assert result["filters_applied"]["end_date"] == "2025-01-31"


# TODO (Week 4): Add more comprehensive tests
# - Test pagination (offset parameter)
# - Test amount range filters
# - Test category filters
# - Test error cases (TransactionNotFoundError)
# - Test invalid date formats
