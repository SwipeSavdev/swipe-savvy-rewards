# AI Concierge Evaluation Framework

Comprehensive evaluation system for measuring AI Concierge performance against gold standard test cases.

## Overview

This framework provides:
- **200 gold standard test cases** covering all agent capabilities
- **Automated evaluation harness** with accuracy metrics
- **Performance benchmarking** (latency, throughput)
- **HTML dashboards** for visualizing results
- **Historical tracking** for regression detection

## Quick Start

### Run Evaluation

```bash
# Ensure Concierge service is running
cd services/concierge-agent
python main.py &

# Run evaluation
cd ../../evaluation
python evaluator.py
```

### Generate Dashboard

```bash
python dashboard.py
open results/dashboard.html
```

## Test Cases Structure

**test_cases.json** contains 200 test cases organized by category:

| Category | Count | Description |
|----------|-------|-------------|
| account_balance | 40 | Account balance queries and summaries |
| transaction_history | 50 | Transaction retrieval and filtering |
| transfers_payments | 30 | Transfer requests and payment info |
| security_privacy | 25 | Security settings, fraud, privacy |
| handoff_triggers | 20 | Human handoff detection scenarios |
| edge_cases | 15 | Out-of-scope, empty, gibberish inputs |
| multi_turn | 20 | Multi-turn conversation flows |

### Test Case Format

```json
{
  "id": "ACC_001",
  "category": "account_balance",
  "user_input": "What's my checking account balance?",
  "context": {
    "user_id": "user_001",
    "session_id": "session_001",
    "conversation_history": []
  },
  "expected_output": {
    "tools_called": ["get_account_info"],
    "response_contains": ["checking", "balance", "$"],
    "should_handoff": false,
    "expected_confidence": 0.95,
    "response_quality_min": 4,
    "latency_max_ms": 3000
  },
  "gold_response": "Your checking account (****1234) has a balance of $2,547.30..."
}
```

## Metrics

### Accuracy Metrics

- **Tool Call Accuracy**: % of test cases with correct tools called
- **Tool Order Accuracy**: % with correct tool execution sequence
- **Keyword Match Rate**: % of responses containing expected keywords
- **Response Quality Score**: Average quality rating (1-5 scale)

### Handoff Metrics

- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1 Score**: Harmonic mean of precision and recall

### Performance Metrics

- **Average Latency**: Mean response time across all tests
- **P50/P95/P99 Latency**: Percentile latency measurements
- **Pass Rate**: % of test cases meeting all quality criteria

### Overall Score

Weighted composite score (0.0 to 1.0):
- Tool accuracy: 25%
- Tool order: 10%
- Keyword match: 20%
- Handoff correctness: 25%
- Response quality: 20%

## Quality Rubric

| Score | Description |
|-------|-------------|
| 5 | Perfect - accurate, helpful, natural, includes all expected elements |
| 4 | Good - accurate and helpful, minor improvements possible |
| 3 | Acceptable - correct information but could be clearer |
| 2 | Poor - partially correct, missing key information |
| 1 | Unacceptable - incorrect information or fails to address question |

## Output Files

Results are saved to `evaluation/results/`:

- **results_YYYYMMDD_HHMMSS.json**: Detailed per-test results
- **summary_YYYYMMDD_HHMMSS.json**: Aggregate metrics
- **report_YYYYMMDD_HHMMSS.txt**: Human-readable report
- **dashboard.html**: Interactive HTML dashboard

## Example Usage

### Run Specific Categories

```python
from evaluator import ConciergeEvaluator
import asyncio

async def run_category(category: str):
    evaluator = ConciergeEvaluator()
    
    # Load and filter test cases
    with open("test_cases.json") as f:
        data = json.load(f)
        cases = [tc for tc in data["test_cases"] if tc["category"] == category]
    
    results = []
    for case in cases:
        result = await evaluator.run_test_case(case)
        results.append(result)
    
    await evaluator.close()
    return results

# Run only handoff tests
asyncio.run(run_category("handoff_triggers"))
```

### Custom Metrics

```python
from evaluator import ConciergeEvaluator

evaluator = ConciergeEvaluator()

# Add custom metric tracking
def custom_metric(result):
    # Your custom logic
    return score

# Run with custom analysis
results, summary = await evaluator.evaluate_all("test_cases.json")
for result in results:
    custom_score = custom_metric(result)
    print(f"{result.test_id}: {custom_score}")
```

## Continuous Integration

Add to `.github/workflows/evaluation.yml`:

```yaml
name: Weekly Evaluation

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Start services
        run: docker-compose up -d
      - name: Run evaluation
        run: python evaluation/evaluator.py
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: evaluation-results
          path: evaluation/results/
```

## Baseline Performance (Week 7)

| Metric | Target | Baseline |
|--------|--------|----------|
| Pass Rate | ≥90% | TBD |
| Overall Score | ≥0.85 | TBD |
| Tool Accuracy | ≥95% | TBD |
| Handoff F1 | ≥0.90 | TBD |
| Avg Latency | ≤2000ms | TBD |
| P95 Latency | ≤3000ms | TBD |

*Baseline will be established after first evaluation run.*

## Troubleshooting

### Service Connection Errors

```bash
# Check if Concierge is running
curl http://localhost:8000/health

# Start service if needed
cd services/concierge-agent
python main.py
```

### Import Errors

```bash
# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or install in development mode
pip install -e .
```

### Database Errors

The evaluation uses the mock database by default. To use PostgreSQL:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Apply schema
psql -h localhost -U postgres -d swipesavvy < scripts/init-database.sql
```

## Next Steps

1. **Expand test cases**: Add more edge cases and user variations
2. **A/B testing**: Compare different prompts or model versions
3. **User simulation**: Generate synthetic conversations
4. **Load testing**: Measure performance under concurrent load
5. **Regression detection**: Alert on metric degradation
