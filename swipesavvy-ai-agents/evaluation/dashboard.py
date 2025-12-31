"""
Metrics Dashboard Generator - Creates HTML reports from evaluation results
"""

import json
from pathlib import Path


def generate_dashboard(results_dir: str = "evaluation/results"):
    """Generate HTML dashboard from latest evaluation results"""
    results_path = Path(results_dir)
    
    # Find latest files
    summary_files = sorted(results_path.glob("summary_*.json"))
    if not summary_files:
        print("No evaluation results found")
        return
    
    with open(summary_files[-1]) as f:
        summary = json.load(f)
    
    # Generate simple HTML report
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>AI Concierge Evaluation</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }}
        h1 {{ color: #333; }}
        .metric {{ padding: 15px; margin: 10px 0; background: #f9f9f9; border-left: 4px solid #4CAF50; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #4CAF50; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background: #f0f0f0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Concierge Evaluation Dashboard</h1>
        <p>Generated: {summary['timestamp']}</p>
        
        <h2>Summary</h2>
        <div class="metric">
            <div>Pass Rate</div>
            <div class="metric-value">{summary['pass_rate']*100:.1f}%</div>
        </div>
        <div class="metric">
            <div>Overall Score</div>
            <div class="metric-value">{summary['overall_score']*100:.1f}%</div>
        </div>
        
        <h2>Performance</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Avg Latency</td><td>{summary['avg_latency_ms']:.0f}ms</td></tr>
            <tr><td>P95 Latency</td><td>{summary['p95_latency_ms']:.0f}ms</td></tr>
            <tr><td>Tool Accuracy</td><td>{summary['tool_accuracy']*100:.1f}%</td></tr>
            <tr><td>Handoff F1</td><td>{summary['handoff_f1']:.3f}</td></tr>
        </table>
        
        <h2>Category Scores</h2>
        <table>
            <tr><th>Category</th><th>Score</th></tr>
            {"".join(f"<tr><td>{cat}</td><td>{score:.3f}</td></tr>" for cat, score in summary['category_scores'].items())}
        </table>
    </div>
</body>
</html>"""
    
    output = results_path / "dashboard.html"
    output.write_text(html)
    print(f"Dashboard generated: {output}")


if __name__ == "__main__":
    generate_dashboard()
