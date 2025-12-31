"""
AI Concierge Evaluation Framework
Runs test cases against the system and measures performance metrics
"""

import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import httpx
import asyncio


@dataclass
class EvaluationResult:
    """Result of evaluating a single test case"""
    test_id: str
    category: str
    passed: bool
    score: float  # 0.0 to 1.0
    latency_ms: int
    
    # Tool accuracy
    tools_called_correct: bool
    tools_order_correct: bool
    expected_tools: List[str]
    actual_tools: List[str]
    
    # Response quality
    response_quality_score: int  # 1-5
    contains_expected_keywords: bool
    missing_keywords: List[str]
    
    # Handoff accuracy
    handoff_correct: bool
    expected_handoff: bool
    actual_handoff: bool
    handoff_reason_correct: Optional[bool]
    
    # Actual vs expected
    user_input: str
    actual_response: str
    gold_response: str
    
    # Error details
    errors: List[str]
    warnings: List[str]
    
    timestamp: str


@dataclass
class EvaluationSummary:
    """Aggregate evaluation metrics"""
    total_cases: int
    passed_cases: int
    failed_cases: int
    pass_rate: float
    
    # Performance
    avg_latency_ms: float
    p50_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    
    # Tool accuracy
    tool_accuracy: float
    tool_order_accuracy: float
    
    # Response quality
    avg_quality_score: float
    keyword_match_rate: float
    
    # Handoff accuracy
    handoff_precision: float
    handoff_recall: float
    handoff_f1: float
    
    # Category breakdown
    category_scores: Dict[str, float]
    
    # Overall score
    overall_score: float
    
    timestamp: str


class ConciergeEvaluator:
    """Evaluates AI Concierge against gold standard test cases"""
    
    def __init__(self, concierge_url: str = "http://localhost:8000"):
        self.concierge_url = concierge_url
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    async def run_test_case(self, test_case: Dict[str, Any]) -> EvaluationResult:
        """Run a single test case and evaluate the result"""
        test_id = test_case["id"]
        category = test_case["category"]
        user_input = test_case["user_input"]
        context = test_case["context"]
        expected = test_case["expected_output"]
        gold_response = test_case.get("gold_response", "")
        
        errors = []
        warnings = []
        
        # Make request to Concierge
        start_time = time.time()
        try:
            response = await self.client.post(
                f"{self.concierge_url}/api/v1/concierge/chat",
                json={
                    "user_id": context["user_id"],
                    "session_id": context["session_id"],
                    "message": user_input,
                    "context": context.get("conversation_history", [])
                }
            )
            latency_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code != 200:
                errors.append(f"HTTP {response.status_code}: {response.text}")
                return self._create_error_result(
                    test_id, category, user_input, gold_response, 
                    expected, errors, latency_ms
                )
            
            result = response.json()
            
        except Exception as e:
            errors.append(f"Request failed: {str(e)}")
            return self._create_error_result(
                test_id, category, user_input, gold_response,
                expected, errors, 0
            )
        
        # Extract actual values
        actual_response = result.get("response", "")
        actual_tools = result.get("tools_used", [])
        actual_handoff = result.get("should_handoff", False)
        
        # Evaluate tool accuracy
        expected_tools = expected.get("tools_called", [])
        expected_order = expected.get("tool_call_order", [])
        
        tools_called_correct = set(actual_tools) == set(expected_tools)
        tools_order_correct = actual_tools == expected_order if expected_order else True
        
        if not tools_called_correct:
            warnings.append(
                f"Tool mismatch: expected {expected_tools}, got {actual_tools}"
            )
        
        # Evaluate response quality
        expected_keywords = expected.get("response_contains", [])
        missing_keywords = [
            kw for kw in expected_keywords
            if kw.lower() not in actual_response.lower()
        ]
        contains_expected = len(missing_keywords) == 0
        
        if missing_keywords:
            warnings.append(f"Missing keywords: {missing_keywords}")
        
        # Evaluate handoff
        expected_handoff = expected.get("should_handoff", False)
        handoff_correct = actual_handoff == expected_handoff
        
        handoff_reason_correct = None
        if expected_handoff and actual_handoff:
            expected_reason = expected.get("handoff_reason")
            actual_reason = result.get("handoff_reason")
            if expected_reason:
                handoff_reason_correct = expected_reason == actual_reason
                if not handoff_reason_correct:
                    warnings.append(
                        f"Handoff reason: expected '{expected_reason}', "
                        f"got '{actual_reason}'"
                    )
        
        if not handoff_correct:
            errors.append(
                f"Handoff mismatch: expected {expected_handoff}, "
                f"got {actual_handoff}"
            )
        
        # Check latency
        max_latency = expected.get("latency_max_ms", 5000)
        if latency_ms > max_latency:
            warnings.append(
                f"Latency {latency_ms}ms exceeds max {max_latency}ms"
            )
        
        # Calculate response quality score (1-5)
        quality_score = self._calculate_quality_score(
            actual_response, gold_response, contains_expected,
            tools_called_correct, handoff_correct
        )
        
        # Calculate overall score
        score = self._calculate_test_score(
            tools_called_correct, tools_order_correct,
            contains_expected, handoff_correct, quality_score
        )
        
        # Determine pass/fail
        min_quality = expected.get("response_quality_min", 3)
        passed = (
            handoff_correct and
            quality_score >= min_quality and
            len(errors) == 0
        )
        
        return EvaluationResult(
            test_id=test_id,
            category=category,
            passed=passed,
            score=score,
            latency_ms=latency_ms,
            tools_called_correct=tools_called_correct,
            tools_order_correct=tools_order_correct,
            expected_tools=expected_tools,
            actual_tools=actual_tools,
            response_quality_score=quality_score,
            contains_expected_keywords=contains_expected,
            missing_keywords=missing_keywords,
            handoff_correct=handoff_correct,
            expected_handoff=expected_handoff,
            actual_handoff=actual_handoff,
            handoff_reason_correct=handoff_reason_correct,
            user_input=user_input,
            actual_response=actual_response,
            gold_response=gold_response,
            errors=errors,
            warnings=warnings,
            timestamp=datetime.utcnow().isoformat()
        )
    
    def _create_error_result(
        self, test_id: str, category: str, user_input: str,
        gold_response: str, expected: Dict, errors: List[str],
        latency_ms: int
    ) -> EvaluationResult:
        """Create result for failed test"""
        return EvaluationResult(
            test_id=test_id,
            category=category,
            passed=False,
            score=0.0,
            latency_ms=latency_ms,
            tools_called_correct=False,
            tools_order_correct=False,
            expected_tools=expected.get("tools_called", []),
            actual_tools=[],
            response_quality_score=0,
            contains_expected_keywords=False,
            missing_keywords=expected.get("response_contains", []),
            handoff_correct=False,
            expected_handoff=expected.get("should_handoff", False),
            actual_handoff=False,
            handoff_reason_correct=None,
            user_input=user_input,
            actual_response="",
            gold_response=gold_response,
            errors=errors,
            warnings=[],
            timestamp=datetime.utcnow().isoformat()
        )
    
    def _calculate_quality_score(
        self, actual: str, gold: str, has_keywords: bool,
        tools_correct: bool, handoff_correct: bool
    ) -> int:
        """Calculate response quality score (1-5)"""
        score = 3  # Start with acceptable
        
        # Bonus for keyword match
        if has_keywords:
            score += 1
        
        # Bonus for tool correctness
        if tools_correct:
            score += 0.5
        
        # Bonus for handoff correctness
        if handoff_correct:
            score += 0.5
        
        # Cap at 5
        return min(5, int(score))
    
    def _calculate_test_score(
        self, tools_correct: bool, order_correct: bool,
        keywords_correct: bool, handoff_correct: bool,
        quality_score: int
    ) -> float:
        """Calculate overall test score (0.0 to 1.0)"""
        weights = {
            "tools": 0.25,
            "order": 0.10,
            "keywords": 0.20,
            "handoff": 0.25,
            "quality": 0.20
        }
        
        score = 0.0
        score += weights["tools"] if tools_correct else 0.0
        score += weights["order"] if order_correct else 0.0
        score += weights["keywords"] if keywords_correct else 0.0
        score += weights["handoff"] if handoff_correct else 0.0
        score += weights["quality"] * (quality_score / 5.0)
        
        return score
    
    async def evaluate_all(
        self, test_cases_path: str
    ) -> tuple[List[EvaluationResult], EvaluationSummary]:
        """Run all test cases and generate summary"""
        
        # Load test cases
        with open(test_cases_path, 'r') as f:
            data = json.load(f)
            test_cases = data["test_cases"]
        
        print(f"Running {len(test_cases)} test cases...")
        
        # Run all tests
        results = []
        for i, test_case in enumerate(test_cases, 1):
            print(f"  [{i}/{len(test_cases)}] {test_case['id']}...", end=" ")
            result = await self.run_test_case(test_case)
            results.append(result)
            
            status = "✓ PASS" if result.passed else "✗ FAIL"
            print(f"{status} ({result.latency_ms}ms)")
            
            # Small delay to avoid overwhelming the service
            await asyncio.sleep(0.1)
        
        # Generate summary
        summary = self._generate_summary(results)
        
        return results, summary
    
    def _generate_summary(
        self, results: List[EvaluationResult]
    ) -> EvaluationSummary:
        """Generate aggregate metrics from results"""
        
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        failed = total - passed
        
        # Performance metrics
        latencies = [r.latency_ms for r in results]
        latencies_sorted = sorted(latencies)
        
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        p50_latency = latencies_sorted[int(len(latencies) * 0.50)] if latencies else 0
        p95_latency = latencies_sorted[int(len(latencies) * 0.95)] if latencies else 0
        p99_latency = latencies_sorted[int(len(latencies) * 0.99)] if latencies else 0
        
        # Tool accuracy
        tool_correct = sum(1 for r in results if r.tools_called_correct)
        tool_accuracy = tool_correct / total if total > 0 else 0
        
        order_correct = sum(1 for r in results if r.tools_order_correct)
        tool_order_accuracy = order_correct / total if total > 0 else 0
        
        # Response quality
        quality_scores = [r.response_quality_score for r in results]
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        keyword_matches = sum(1 for r in results if r.contains_expected_keywords)
        keyword_rate = keyword_matches / total if total > 0 else 0
        
        # Handoff metrics (precision, recall, F1)
        true_positives = sum(
            1 for r in results
            if r.expected_handoff and r.actual_handoff
        )
        false_positives = sum(
            1 for r in results
            if not r.expected_handoff and r.actual_handoff
        )
        false_negatives = sum(
            1 for r in results
            if r.expected_handoff and not r.actual_handoff
        )
        
        precision = (
            true_positives / (true_positives + false_positives)
            if (true_positives + false_positives) > 0 else 0
        )
        recall = (
            true_positives / (true_positives + false_negatives)
            if (true_positives + false_negatives) > 0 else 0
        )
        f1 = (
            2 * (precision * recall) / (precision + recall)
            if (precision + recall) > 0 else 0
        )
        
        # Category breakdown
        categories = {}
        for result in results:
            cat = result.category
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(result.score)
        
        category_scores = {
            cat: sum(scores) / len(scores)
            for cat, scores in categories.items()
        }
        
        # Overall score
        overall = sum(r.score for r in results) / total if total > 0 else 0
        
        return EvaluationSummary(
            total_cases=total,
            passed_cases=passed,
            failed_cases=failed,
            pass_rate=passed / total if total > 0 else 0,
            avg_latency_ms=avg_latency,
            p50_latency_ms=p50_latency,
            p95_latency_ms=p95_latency,
            p99_latency_ms=p99_latency,
            tool_accuracy=tool_accuracy,
            tool_order_accuracy=tool_order_accuracy,
            avg_quality_score=avg_quality,
            keyword_match_rate=keyword_rate,
            handoff_precision=precision,
            handoff_recall=recall,
            handoff_f1=f1,
            category_scores=category_scores,
            overall_score=overall,
            timestamp=datetime.utcnow().isoformat()
        )
    
    def save_results(
        self, results: List[EvaluationResult],
        summary: EvaluationSummary,
        output_dir: str = "evaluation/results"
    ):
        """Save evaluation results to JSON files"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        # Save detailed results
        results_file = f"{output_dir}/results_{timestamp}.json"
        with open(results_file, 'w') as f:
            json.dump(
                [asdict(r) for r in results],
                f,
                indent=2
            )
        
        # Save summary
        summary_file = f"{output_dir}/summary_{timestamp}.json"
        with open(summary_file, 'w') as f:
            json.dump(asdict(summary), f, indent=2)
        
        # Save human-readable report
        report_file = f"{output_dir}/report_{timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(self._generate_report(summary, results))
        
        print(f"\nResults saved:")
        print(f"  - {results_file}")
        print(f"  - {summary_file}")
        print(f"  - {report_file}")
    
    def _generate_report(
        self, summary: EvaluationSummary, results: List[EvaluationResult]
    ) -> str:
        """Generate human-readable evaluation report"""
        
        report = []
        report.append("=" * 80)
        report.append("AI CONCIERGE EVALUATION REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {summary.timestamp}")
        report.append("")
        
        # Overall metrics
        report.append("OVERALL METRICS")
        report.append("-" * 80)
        report.append(f"Total Test Cases:     {summary.total_cases}")
        report.append(f"Passed:               {summary.passed_cases} ({summary.pass_rate:.1%})")
        report.append(f"Failed:               {summary.failed_cases}")
        report.append(f"Overall Score:        {summary.overall_score:.3f} / 1.000")
        report.append("")
        
        # Performance
        report.append("PERFORMANCE")
        report.append("-" * 80)
        report.append(f"Avg Latency:          {summary.avg_latency_ms:.0f}ms")
        report.append(f"P50 Latency:          {summary.p50_latency_ms:.0f}ms")
        report.append(f"P95 Latency:          {summary.p95_latency_ms:.0f}ms")
        report.append(f"P99 Latency:          {summary.p99_latency_ms:.0f}ms")
        report.append("")
        
        # Accuracy
        report.append("ACCURACY METRICS")
        report.append("-" * 80)
        report.append(f"Tool Call Accuracy:   {summary.tool_accuracy:.1%}")
        report.append(f"Tool Order Accuracy:  {summary.tool_order_accuracy:.1%}")
        report.append(f"Keyword Match Rate:   {summary.keyword_match_rate:.1%}")
        report.append(f"Avg Quality Score:    {summary.avg_quality_score:.2f} / 5.00")
        report.append("")
        
        # Handoff metrics
        report.append("HANDOFF DETECTION")
        report.append("-" * 80)
        report.append(f"Precision:            {summary.handoff_precision:.1%}")
        report.append(f"Recall:               {summary.handoff_recall:.1%}")
        report.append(f"F1 Score:             {summary.handoff_f1:.3f}")
        report.append("")
        
        # Category breakdown
        report.append("CATEGORY PERFORMANCE")
        report.append("-" * 80)
        for category, score in sorted(summary.category_scores.items()):
            report.append(f"{category:25s} {score:.3f}")
        report.append("")
        
        # Failed tests
        failed = [r for r in results if not r.passed]
        if failed:
            report.append("FAILED TESTS")
            report.append("-" * 80)
            for result in failed[:10]:  # Show first 10
                report.append(f"\n{result.test_id} ({result.category})")
                report.append(f"  Input: {result.user_input}")
                if result.errors:
                    report.append(f"  Errors: {'; '.join(result.errors)}")
                if result.warnings:
                    report.append(f"  Warnings: {'; '.join(result.warnings)}")
            
            if len(failed) > 10:
                report.append(f"\n... and {len(failed) - 10} more failed tests")
        
        report.append("")
        report.append("=" * 80)
        
        return "\n".join(report)


async def main():
    """Run evaluation"""
    import sys
    
    test_cases_path = "evaluation/test_cases.json"
    if len(sys.argv) > 1:
        test_cases_path = sys.argv[1]
    
    evaluator = ConciergeEvaluator()
    
    try:
        results, summary = await evaluator.evaluate_all(test_cases_path)
        evaluator.save_results(results, summary)
        
        # Print summary
        print("\n" + "=" * 80)
        print(f"EVALUATION COMPLETE")
        print("=" * 80)
        print(f"Pass Rate:        {summary.pass_rate:.1%}")
        print(f"Overall Score:    {summary.overall_score:.3f}")
        print(f"Avg Latency:      {summary.avg_latency_ms:.0f}ms")
        print(f"Handoff F1:       {summary.handoff_f1:.3f}")
        print("=" * 80)
        
    finally:
        await evaluator.close()


if __name__ == "__main__":
    asyncio.run(main())
