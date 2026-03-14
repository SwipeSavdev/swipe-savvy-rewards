#!/usr/bin/env python3
"""
Extract the complete OpenAPI specification from the running FastAPI application.

Usage:
    # Start the FastAPI app first, then run:
    python generate-spec.py [--url URL] [--output FILE] [--format FORMAT]

    # Examples:
    python generate-spec.py                                    # Default: localhost:8000 -> openapi.yaml
    python generate-spec.py --url https://staging-api.swipesavvy.com --output staging-spec.json --format json
    python generate-spec.py --url http://localhost:8000 --output openapi.yaml --format yaml
"""

import argparse
import json
import sys
import urllib.request
import urllib.error


def fetch_openapi_spec(base_url: str) -> dict:
    """Fetch the OpenAPI JSON spec from a running FastAPI instance."""
    url = f"{base_url.rstrip('/')}/openapi.json"
    print(f"Fetching OpenAPI spec from {url}...")

    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            print(f"  Found {len(data.get('paths', {}))} paths")
            endpoint_count = sum(
                len(methods) for methods in data.get("paths", {}).values()
            )
            print(f"  Total endpoints: {endpoint_count}")
            return data
    except urllib.error.URLError as e:
        print(f"Error: Cannot connect to {url}")
        print(f"  {e}")
        print(f"\nMake sure the FastAPI app is running:")
        print(f"  cd swipesavvy-ai-agents && uvicorn app.main:app --port 8000")
        sys.exit(1)


def save_as_yaml(spec: dict, output_path: str):
    """Save spec as YAML (requires PyYAML)."""
    try:
        import yaml

        with open(output_path, "w") as f:
            yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    except ImportError:
        print("PyYAML not installed. Install with: pip install pyyaml")
        print("Falling back to JSON format...")
        output_path = output_path.replace(".yaml", ".json").replace(".yml", ".json")
        save_as_json(spec, output_path)


def save_as_json(spec: dict, output_path: str):
    """Save spec as JSON."""
    with open(output_path, "w") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="Extract OpenAPI spec from SwipeSavvy API")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the running API")
    parser.add_argument("--output", default="openapi.yaml", help="Output file path")
    parser.add_argument("--format", choices=["yaml", "json"], default="yaml", help="Output format")
    args = parser.parse_args()

    spec = fetch_openapi_spec(args.url)

    # Enhance the spec with server URLs for all environments
    spec["servers"] = [
        {"url": "https://api.swipesavvy.com/api/v1", "description": "Production"},
        {"url": "https://staging-api.swipesavvy.com/api/v1", "description": "Staging"},
        {"url": "http://localhost:8000/api/v1", "description": "Development"},
    ]

    if args.format == "yaml":
        save_as_yaml(spec, args.output)
    else:
        save_as_json(spec, args.output)

    print(f"\nSpec saved to {args.output}")
    print("You can now deploy the docs-site with the updated spec.")


if __name__ == "__main__":
    main()
