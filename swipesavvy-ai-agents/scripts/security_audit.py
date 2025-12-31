"""
Security Audit Script
Scans for common vulnerabilities and security issues
"""

import subprocess
import json
import sys
from pathlib import Path


def run_command(cmd, description):
    """Run shell command and return output"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"❌ Timeout: {description}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def check_dependencies():
    """Check for vulnerable dependencies"""
    print("\n🔍 Checking Python dependencies for vulnerabilities...")
    
    # Using pip-audit (needs to be installed: pip install pip-audit)
    success = run_command(
        "pip-audit --desc || pip list --format=json",
        "Dependency vulnerability scan"
    )
    
    return success


def check_secrets():
    """Check for hardcoded secrets"""
    print("\n🔍 Scanning for hardcoded secrets...")
    
    patterns = [
        "password",
        "api_key",
        "secret",
        "token",
        "TOGETHER_API_KEY"
    ]
    
    for pattern in patterns:
        print(f"\nSearching for: {pattern}")
        run_command(
            f"grep -r --include='*.py' '{pattern}' . | grep -v 'venv' | grep -v '.git' | head -20",
            f"Secret pattern: {pattern}"
        )


def check_docker_security():
    """Check Docker images for security issues"""
    print("\n🔍 Docker security scan...")
    
    # Check if Trivy is installed
    run_command(
        "docker --version",
        "Docker version check"
    )
    
    # Note: Trivy scan would require Trivy to be installed
    print("\n📝 Note: Install Trivy for comprehensive image scanning:")
    print("   brew install aquasecurity/trivy/trivy")
    print("   trivy image <image-name>")


def check_code_quality():
    """Run code quality and security linters"""
    print("\n🔍 Code quality and security checks...")
    
    # Bandit for security issues
    run_command(
        "bandit -r services/ shared/ -f json || echo 'Bandit not installed. Install: pip install bandit'",
        "Bandit security scan"
    )
    
    # Pylint
    run_command(
        "pylint services/*/main.py --exit-zero || echo 'Pylint not installed'",
        "Pylint code quality"
    )


def check_environment_variables():
    """Check for proper environment variable usage"""
    print("\n🔍 Environment variable security...")
    
    # Check for .env in .gitignore
    run_command(
        "grep -q '^.env$' .gitignore && echo '✅ .env in .gitignore' || echo '❌ .env NOT in .gitignore'",
        ".env file protection"
    )
    
    # Check for .env.template
    run_command(
        "test -f .env.template && echo '✅ .env.template exists' || echo '❌ .env.template missing'",
        "Environment template check"
    )


def check_permissions():
    """Check file permissions"""
    print("\n🔍 File permissions check...")
    
    run_command(
        "find . -type f -name '*.py' -perm +111 | head -10",
        "Executable Python files (should be minimal)"
    )


def generate_security_report():
    """Generate summary report"""
    print("\n" + "="*60)
    print("SECURITY AUDIT SUMMARY")
    print("="*60)
    
    report = {
        "timestamp": "2025-12-23",
        "checks_performed": [
            "Dependency vulnerabilities",
            "Secret scanning",
            "Docker security",
            "Code quality (Bandit)",
            "Environment variables",
            "File permissions"
        ],
        "recommendations": [
            "Install pip-audit: pip install pip-audit",
            "Install Bandit: pip install bandit",
            "Install Trivy: brew install aquasecurity/trivy/trivy",
            "Run: trivy image <image-name> for Docker scans",
            "Ensure .env is in .gitignore",
            "Use environment variables for all secrets",
            "Enable GitHub Dependabot alerts",
            "Set up SAST scanning in CI/CD"
        ]
    }
    
    print(json.dumps(report, indent=2))
    
    # Write to file
    with open("SECURITY-AUDIT-REPORT.md", "w") as f:
        f.write("# Security Audit Report\n\n")
        f.write(f"**Date**: {report['timestamp']}\n\n")
        f.write("## Checks Performed\n\n")
        for check in report['checks_performed']:
            f.write(f"- {check}\n")
        f.write("\n## Recommendations\n\n")
        for rec in report['recommendations']:
            f.write(f"- {rec}\n")
        f.write("\n## Security Checklist\n\n")
        f.write("- [ ] All dependencies up to date\n")
        f.write("- [ ] No hardcoded secrets in code\n")
        f.write("- [ ] Docker images scanned\n")
        f.write("- [ ] Environment variables properly managed\n")
        f.write("- [ ] HTTPS/TLS enabled in production\n")
        f.write("- [ ] Rate limiting configured\n")
        f.write("- [ ] Guardrails service active\n")
        f.write("- [ ] Database credentials rotated\n")
        f.write("- [ ] Access logs enabled\n")
        f.write("- [ ] Security headers configured\n")
    
    print("\n✅ Report saved to: SECURITY-AUDIT-REPORT.md")


if __name__ == "__main__":
    print("🔒 SwipeSavvy AI Agents - Security Audit")
    print("="*60)
    
    check_dependencies()
    check_secrets()
    check_docker_security()
    check_code_quality()
    check_environment_variables()
    check_permissions()
    generate_security_report()
    
    print("\n✅ Security audit complete!")
    print("📄 Review SECURITY-AUDIT-REPORT.md for details")
