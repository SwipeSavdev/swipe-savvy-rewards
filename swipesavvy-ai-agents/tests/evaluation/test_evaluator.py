"""
Tests for evaluation framework
"""

import pytest
import json
from pathlib import Path
import sys

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from evaluation.evaluator import ConciergeEvaluator, EvaluationResult, EvaluationSummary


def test_test_cases_valid():
    """Test that test cases file is valid JSON with correct structure"""
    test_cases_path = Path(__file__).parent.parent.parent / "evaluation" / "test_cases.json"
    
    assert test_cases_path.exists(), "test_cases.json not found"
    
    with open(test_cases_path) as f:
        data = json.load(f)
    
    # Check metadata
    assert "metadata" in data
    assert "test_cases" in data
    assert "sampling_strategy" in data
    
    metadata = data["metadata"]
    assert metadata["version"] == "1.0.0"
    assert metadata["total_cases"] == 200
    
    # Check test cases
    test_cases = data["test_cases"]
    assert len(test_cases) > 0, "No test cases found"
    
    # Validate structure of first test case
    tc = test_cases[0]
    assert "id" in tc
    assert "category" in tc
    assert "user_input" in tc
    assert "context" in tc
    assert "expected_output" in tc
    
    # Check context structure
    assert "user_id" in tc["context"]
    assert "session_id" in tc["context"]
    
    # Check expected output structure
    expected = tc["expected_output"]
    assert "tools_called" in expected
    assert "should_handoff" in expected
    
    print(f"✓ Test cases file valid: {len(test_cases)} test cases")


def test_categories_complete():
    """Test that all required categories are present"""
    test_cases_path = Path(__file__).parent.parent.parent / "evaluation" / "test_cases.json"
    
    with open(test_cases_path) as f:
        data = json.load(f)
    
    required_categories = {
        "account_balance",
        "transaction_history",
        "transfers_payments",
        "security_privacy",
        "handoff_triggers",
        "edge_cases",
        "multi_turn"
    }
    
    test_cases = data["test_cases"]
    found_categories = {tc["category"] for tc in test_cases}
    
    missing = required_categories - found_categories
    assert len(missing) == 0, f"Missing categories: {missing}"
    
    print(f"✓ All categories present: {found_categories}")


def test_handoff_cases_present():
    """Test that handoff trigger scenarios are included"""
    test_cases_path = Path(__file__).parent.parent.parent / "evaluation" / "test_cases.json"
    
    with open(test_cases_path) as f:
        data = json.load(f)
    
    test_cases = data["test_cases"]
    
    # Find handoff cases
    handoff_cases = [
        tc for tc in test_cases
        if tc["expected_output"].get("should_handoff", False)
    ]
    
    assert len(handoff_cases) > 0, "No handoff test cases found"
    
    # Check for specific handoff triggers
    handoff_reasons = {
        tc["expected_output"].get("handoff_reason")
        for tc in handoff_cases
        if "handoff_reason" in tc["expected_output"]
    }
    
    expected_reasons = {
        "human_request",
        "frustration",
        "complex_topic",
        "high_value_transaction"
    }
    
    found_reasons = handoff_reasons & expected_reasons
    assert len(found_reasons) >= 3, f"Only found handoff reasons: {found_reasons}"
    
    print(f"✓ Handoff cases present: {len(handoff_cases)} cases, reasons: {handoff_reasons}")


def test_tool_coverage():
    """Test that all tools are covered in test cases"""
    test_cases_path = Path(__file__).parent.parent.parent / "evaluation" / "test_cases.json"
    
    with open(test_cases_path) as f:
        data = json.load(f)
    
    test_cases = data["test_cases"]
    
    # Collect all tools used
    all_tools = set()
    for tc in test_cases:
        tools = tc["expected_output"].get("tools_called", [])
        all_tools.update(tools)
    
    # Expected tools
    expected_tools = {
        "get_account_info",
        "get_account_balance",
        "get_transactions",
        "get_transaction_details"
    }
    
    # Check coverage (at least 3 of 4 tools should be covered)
    covered = all_tools & expected_tools
    assert len(covered) >= 3, f"Only {len(covered)} tools covered: {covered}"
    
    print(f"✓ Tool coverage: {covered}")


def test_quality_rubric_defined():
    """Test that quality rubric is defined"""
    test_cases_path = Path(__file__).parent.parent.parent / "evaluation" / "test_cases.json"
    
    with open(test_cases_path) as f:
        data = json.load(f)
    
    assert "quality_rubric" in data
    rubric = data["quality_rubric"]
    
    # Check all ratings defined
    for rating in ["1", "2", "3", "4", "5"]:
        assert rating in rubric, f"Rating {rating} not defined in rubric"
    
    print("✓ Quality rubric defined for ratings 1-5")


def test_evaluator_score_calculation():
    """Test evaluator score calculation logic"""
    evaluator = ConciergeEvaluator()
    
    # Test perfect score
    score = evaluator._calculate_test_score(
        tools_correct=True,
        order_correct=True,
        keywords_correct=True,
        handoff_correct=True,
        quality_score=5
    )
    assert score == 1.0, f"Perfect score should be 1.0, got {score}"
    
    # Test partial score
    score = evaluator._calculate_test_score(
        tools_correct=True,
        order_correct=True,
        keywords_correct=False,
        handoff_correct=True,
        quality_score=3
    )
    assert 0.5 < score < 1.0, f"Partial score out of range: {score}"
    
    # Test zero score
    score = evaluator._calculate_test_score(
        tools_correct=False,
        order_correct=False,
        keywords_correct=False,
        handoff_correct=False,
        quality_score=1
    )
    assert score < 0.3, f"Low score should be < 0.3, got {score}"
    
    print("✓ Score calculation working correctly")


def test_quality_score_calculation():
    """Test quality score calculation"""
    evaluator = ConciergeEvaluator()
    
    # Test high quality
    score = evaluator._calculate_quality_score(
        actual="Your checking account balance is $2,547.30",
        gold="Your checking account has $2,547.30",
        has_keywords=True,
        tools_correct=True,
        handoff_correct=True
    )
    assert score >= 4, f"High quality should be >= 4, got {score}"
    
    # Test medium quality
    score = evaluator._calculate_quality_score(
        actual="Balance is available",
        gold="Your checking account has $2,547.30",
        has_keywords=False,
        tools_correct=True,
        handoff_correct=True
    )
    assert 3 <= score <= 4, f"Medium quality should be 3-4, got {score}"
    
    print("✓ Quality score calculation working correctly")


def test_summary_generation():
    """Test summary metrics generation from results"""
    evaluator = ConciergeEvaluator()
    
    # Create mock results
    results = [
        EvaluationResult(
            test_id=f"TEST_{i:03d}",
            category="test",
            passed=i % 2 == 0,  # 50% pass rate
            score=0.8,
            latency_ms=1000 + i * 100,
            tools_called_correct=True,
            tools_order_correct=True,
            expected_tools=["tool1"],
            actual_tools=["tool1"],
            response_quality_score=4,
            contains_expected_keywords=True,
            missing_keywords=[],
            handoff_correct=True,
            expected_handoff=False,
            actual_handoff=False,
            handoff_reason_correct=None,
            user_input="test",
            actual_response="response",
            gold_response="gold",
            errors=[],
            warnings=[],
            timestamp="2025-12-23T00:00:00Z"
        )
        for i in range(10)
    ]
    
    summary = evaluator._generate_summary(results)
    
    assert summary.total_cases == 10
    assert summary.passed_cases == 5  # 50% pass rate
    assert summary.pass_rate == 0.5
    assert summary.tool_accuracy == 1.0  # All correct
    assert summary.avg_quality_score == 4.0
    
    print(f"✓ Summary generation working: {summary.pass_rate:.1%} pass rate")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
