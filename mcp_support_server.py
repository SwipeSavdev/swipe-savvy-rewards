#!/usr/bin/env python3
"""
SwipeSavvy AI Support Concierge MCP Server

Comprehensive AI-powered support system for SwipeSavvy admin portal, mobile app, and backend.
Features: Issue classification, intelligent resolution routing, knowledge base learning, and ML pattern recognition.

This MCP server provides tools for:
- Issue classification (CRITICAL/MODERATE/LOW severity)
- Intelligent resolution routing
- Documentation and log searching
- Knowledge base learning and pattern recognition
- Step-by-step resolution guidance
"""

import os
import json
import asyncio
import re
import time
from typing import Any, Dict, List, Optional
from datetime import datetime
from pathlib import Path
import logging
import hashlib

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize MCP Server - importing here to handle optional dependency
try:
    from mcp.server import Server
    from mcp.types import Tool, TextContent, ToolResult
    MCP_AVAILABLE = True
except ImportError:
    logger.warning("MCP not installed, running in standalone mode")
    MCP_AVAILABLE = False


# ============================================================================
# KNOWLEDGE BASE & LEARNING SYSTEM
# ============================================================================

class KnowledgeBase:
    """ML-backed knowledge base for learning from issues and patterns"""
    
    def __init__(self, kb_path: str = "support_kb.json"):
        self.kb_path = kb_path
        self.data = self._load_kb()
        self.pattern_weights = {}  # ML weights for pattern matching
    
    def _load_kb(self) -> dict:
        """Load existing knowledge base or create new one"""
        if os.path.exists(self.kb_path):
            try:
                with open(self.kb_path, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Could not parse {self.kb_path}, creating new KB")
        
        return {
            "issues": {},
            "solutions": {},
            "patterns": {},
            "learning_logs": [],
            "ai_recommendations": {},
            "statistics": {
                "total_issues_resolved": 0,
                "critical_resolved": 0,
                "moderate_resolved": 0,
                "low_resolved": 0,
                "avg_resolution_time": 0,
                "success_rate": 0.0
            }
        }
    
    def save_kb(self):
        """Persist knowledge base to disk"""
        try:
            with open(self.kb_path, 'w') as f:
                json.dump(self.data, f, indent=2, default=str)
            logger.info(f"Knowledge base saved to {self.kb_path}")
        except Exception as e:
            logger.error(f"Failed to save knowledge base: {e}")
    
    def learn_issue(self, issue_id: str, severity: str, description: str, 
                    solution: str, resolution_time: float, tags: list, success: bool = True):
        """Record an issue and learn from its resolution (ML learning)"""
        self.data["issues"][issue_id] = {
            "timestamp": datetime.now().isoformat(),
            "severity": severity,
            "description": description,
            "solution": solution,
            "resolution_time_seconds": resolution_time,
            "tags": tags,
            "success": success
        }
        
        # Update learning patterns
        for tag in tags:
            if tag not in self.data["patterns"]:
                self.data["patterns"][tag] = {
                    "count": 0,
                    "avg_resolution_time": 0,
                    "success_count": 0,
                    "weight": 1.0
                }
            
            pattern = self.data["patterns"][tag]
            pattern["count"] += 1
            pattern["avg_resolution_time"] = (
                (pattern["avg_resolution_time"] + resolution_time) / 2
            )
            if success:
                pattern["success_count"] += 1
            
            # Update weight based on success rate (ML)
            if pattern["count"] > 0:
                pattern["weight"] = pattern["success_count"] / pattern["count"]
        
        # Update statistics
        self.data["statistics"]["total_issues_resolved"] += 1
        self.data["statistics"][f"{severity.lower()}_resolved"] += 1
        
        if self.data["statistics"]["total_issues_resolved"] > 0:
            self.data["statistics"]["success_rate"] = (
                sum(1 for i in self.data["issues"].values() if i.get("success", True)) /
                self.data["statistics"]["total_issues_resolved"]
            )
        
        # Log learning event
        self.data["learning_logs"].append({
            "timestamp": datetime.now().isoformat(),
            "issue_id": issue_id,
            "severity": severity,
            "tags": tags,
            "success": success,
            "learning": f"{'Successfully resolved' if success else 'Recorded'} {severity} issue with tags: {tags}"
        })
        
        self.save_kb()
    
    def find_similar_issues(self, description: str, tags: list, limit: int = 5) -> list:
        """Find similar issues from knowledge base (ML-based pattern matching)"""
        similar = []
        
        for issue_id, issue_data in self.data["issues"].items():
            matching_tags = len(set(tags) & set(issue_data.get("tags", [])))
            
            if matching_tags > 0:
                # Weight by pattern success rate (ML)
                weight = sum(
                    self.data["patterns"].get(tag, {}).get("weight", 1.0)
                    for tag in issue_data.get("tags", [])
                ) / max(len(issue_data.get("tags", [])), 1)
                
                similar.append({
                    "issue_id": issue_id,
                    "description": issue_data["description"][:200],
                    "matching_tags": matching_tags,
                    "solution": issue_data["solution"],
                    "severity": issue_data["severity"],
                    "resolution_time": issue_data["resolution_time_seconds"],
                    "success": issue_data.get("success", True),
                    "confidence": weight * (matching_tags / max(len(tags), 1))
                })
        
        return sorted(similar, key=lambda x: x["confidence"], reverse=True)[:limit]
    
    def get_recommendations(self, tags: list) -> list:
        """Get AI-powered recommendations based on learned patterns"""
        recommendations = []
        
        for tag in tags:
            if tag in self.data["patterns"]:
                pattern = self.data["patterns"][tag]
                if pattern["count"] > 0:
                    recommendations.append({
                        "tag": tag,
                        "avg_resolution_time": pattern["avg_resolution_time"],
                        "success_rate": pattern["success_count"] / pattern["count"],
                        "recommendation": f"Based on {pattern['count']} historical issues, this typically takes ~{pattern['avg_resolution_time']:.1f}s to resolve"
                    })
        
        return recommendations


# ============================================================================
# DOCUMENTATION INDEXING
# ============================================================================

class DocumentationIndex:
    """Index and search documentation across the workspace"""
    
    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.docs = {}
        self.search_cache = {}
        self._index_docs()
    
    def _index_docs(self):
        """Index all markdown, text, and log files"""
        patterns = ["*.md", "*.txt", "*.log"]
        indexed_count = 0
        
        for pattern in patterns:
            for doc_path in Path(self.workspace_root).rglob(pattern):
                # Skip node_modules, venv, build artifacts
                if any(part in str(doc_path) for part in ['.git', 'node_modules', 'venv', '.next', 'build', 'dist']):
                    continue
                
                try:
                    with open(doc_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        rel_path = str(doc_path.relative_to(self.workspace_root))
                        
                        self.docs[rel_path] = {
                            "path": rel_path,
                            "content": content[:10000],  # First 10k chars for preview
                            "full_content": content,
                            "size": len(content),
                            "indexed_at": datetime.now().isoformat()
                        }
                        indexed_count += 1
                except Exception as e:
                    logger.debug(f"Could not index {doc_path}: {e}")
        
        logger.info(f"Indexed {indexed_count} documentation files")
    
    def search(self, query: str, limit: int = 5) -> list:
        """Search documentation by keyword with ranking"""
        query_lower = query.lower()
        results = []
        
        for doc_path, doc_data in self.docs.items():
            # Calculate relevance score
            content_lower = doc_data["content"].lower()
            full_lower = doc_data["full_content"].lower()
            
            keyword_count = full_lower.count(query_lower)
            if keyword_count > 0:
                # Boost if in filename or first 1000 chars
                boost = 1.0
                if query_lower in doc_path.lower():
                    boost += 3.0
                if query_lower in content_lower[:500]:
                    boost += 2.0
                
                results.append({
                    "path": doc_path,
                    "preview": doc_data["content"][:400],
                    "relevance": keyword_count * boost,
                    "full_content_available": True
                })
        
        return sorted(results, key=lambda x: x["relevance"], reverse=True)[:limit]


# ============================================================================
# ISSUE CLASSIFICATION
# ============================================================================

class IssueClassifier:
    """Classify issues by severity and extract relevant tags"""
    
    CRITICAL_KEYWORDS = {
        "crash", "fatal", "down", "broken", "security breach", "data loss",
        "authentication failed", "database error", "critical", "emergency",
        "not working", "production down", "unable to", "blocked", "cannot"
    }
    
    MODERATE_KEYWORDS = {
        "error", "bug", "slow", "performance", "issue", "problem",
        "failed", "warning", "timeout", "delay", "stuck", "lag"
    }
    
    SYSTEM_KEYWORDS = {
        "backend": ["backend", "api", "server", "database", "sql", "postgres"],
        "frontend": ["frontend", "admin portal", "ui", "interface", "button", "page", "react"],
        "mobile": ["mobile", "app", "ios", "android", "react native", "expo"],
        "auth": ["auth", "login", "logout", "token", "permission", "access"],
        "database": ["database", "db", "postgres", "sql", "query", "schema"],
        "api": ["api", "endpoint", "request", "response", "rest", "graphql"],
        "ai": ["ai", "concierge", "support", "recommendation", "ml"],
        "payment": ["payment", "transaction", "transfer", "billing", "invoice"]
    }
    
    @staticmethod
    def classify(description: str) -> dict:
        """Classify issue severity and extract tags"""
        desc_lower = description.lower()
        
        # Determine severity
        critical_found = sum(1 for kw in IssueClassifier.CRITICAL_KEYWORDS if kw in desc_lower)
        moderate_found = sum(1 for kw in IssueClassifier.MODERATE_KEYWORDS if kw in desc_lower)
        
        if critical_found > 0:
            severity = "CRITICAL"
        elif moderate_found > 0:
            severity = "MODERATE"
        else:
            severity = "LOW"
        
        # Extract system tags
        tags = []
        for system, keywords in IssueClassifier.SYSTEM_KEYWORDS.items():
            for keyword in keywords:
                if keyword in desc_lower:
                    tags.append(system)
                    break
        
        # Add custom tags
        if "timeout" in desc_lower or "slow" in desc_lower:
            tags.append("performance")
        if "error" in desc_lower or "exception" in desc_lower:
            tags.append("error-handling")
        
        tags = list(set(tags)) if tags else ["general"]
        
        return {
            "severity": severity,
            "tags": tags,
            "needs_escalation": severity == "CRITICAL",
            "confidence": min(1.0, (critical_found + moderate_found) / 10)
        }


# ============================================================================
# RESOLUTION ENGINE
# ============================================================================

class ResolutionEngine:
    """Provide step-by-step resolution guidance for issues"""
    
    RESOLUTION_TEMPLATES = {
        "backend": [
            "Step 1: Check backend logs: `tail -f logs/app.log`",
            "Step 2: Verify database connection: `psql -U postgres -c 'SELECT 1;'`",
            "Step 3: Check API endpoint health: `curl http://localhost:8000/health`",
            "Step 4: Review recent changes in git: `git log --oneline -10`",
            "Step 5: Restart the backend service",
            "Step 6: Monitor logs for new errors"
        ],
        "frontend": [
            "Step 1: Check browser console for JavaScript errors (F12)",
            "Step 2: Check network tab for failed API requests",
            "Step 3: Clear browser cache and reload: Ctrl+Shift+R (or Cmd+Shift+R)",
            "Step 4: Verify API connectivity: Check if backend is running",
            "Step 5: Check TypeScript compilation: `npm run build`",
            "Step 6: Restart dev server: `npm run dev`"
        ],
        "mobile": [
            "Step 1: Check mobile app logs: Check console/Xcode/Android Studio",
            "Step 2: Verify React Native version compatibility",
            "Step 3: Clear cache: `expo cache clean`",
            "Step 4: Reinstall dependencies: `npm install` and `npx expo prebuild`",
            "Step 5: Test on simulator/emulator",
            "Step 6: Check API endpoints from mobile client"
        ],
        "database": [
            "Step 1: Connect to PostgreSQL: `psql -U postgres -d swipesavvy_admin`",
            "Step 2: Check database status: `\\l`",
            "Step 3: Verify table schemas: `\\d`",
            "Step 4: Run diagnostic query: `SELECT COUNT(*) FROM {table};`",
            "Step 5: Check for locks: `SELECT * FROM pg_locks;`",
            "Step 6: Review slow queries in logs"
        ],
        "api": [
            "Step 1: Verify API is running on correct port (8000)",
            "Step 2: Test endpoint: `curl -X GET http://localhost:8000/api/health`",
            "Step 3: Check authentication headers if required",
            "Step 4: Verify request/response format",
            "Step 5: Review API documentation",
            "Step 6: Check backend logs for errors"
        ]
    }
    
    @staticmethod
    def get_resolution(tags: list, severity: str) -> dict:
        """Generate resolution steps based on issue tags"""
        steps = []
        
        for tag in tags:
            if tag in ResolutionEngine.RESOLUTION_TEMPLATES:
                steps.extend(ResolutionEngine.RESOLUTION_TEMPLATES[tag])
        
        if not steps:
            steps = [
                "Step 1: Gather detailed error information and logs",
                "Step 2: Search documentation for similar issues",
                "Step 3: Check if issue is in knowledge base of resolved issues",
                "Step 4: Contact support with error details and reproduction steps",
                "Step 5: Monitor system for resolution"
            ]
        
        return {
            "severity": severity,
            "tags": tags,
            "resolution_steps": steps,
            "estimated_time_minutes": {
                "CRITICAL": 5,
                "MODERATE": 15,
                "LOW": 30
            }.get(severity, 20)
        }


# ============================================================================
# MAIN SUPPORT CONCIERGE
# ============================================================================

class SwipeSavvySupportConcierge:
    """Main AI Support Concierge for SwipeSavvy ecosystem"""
    
    def __init__(self, workspace_root: str = "/Users/macbookpro/Documents/swipesavvy-mobile-app-v2"):
        self.workspace_root = workspace_root
        self.kb = KnowledgeBase()
        self.doc_index = DocumentationIndex(workspace_root)
        self.classifier = IssueClassifier()
        self.resolver = ResolutionEngine()
        logger.info("SwipeSavvy Support Concierge initialized")
    
    def analyze_issue(self, description: str, user_id: str = "unknown") -> dict:
        """Analyze an issue and provide comprehensive support"""
        issue_id = hashlib.md5(f"{description}{datetime.now()}".encode()).hexdigest()[:12]
        
        # Step 1: Classify the issue
        classification = self.classifier.classify(description)
        
        # Step 2: Find similar historical issues
        similar_issues = self.kb.find_similar_issues(description, classification["tags"])
        
        # Step 3: Get resolution steps
        resolution = self.resolver.get_resolution(classification["tags"], classification["severity"])
        
        # Step 4: Search documentation
        doc_results = self.doc_index.search(" ".join(classification["tags"]))
        
        # Step 5: Get AI recommendations
        recommendations = self.kb.get_recommendations(classification["tags"])
        
        return {
            "issue_id": issue_id,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "description": description,
            "classification": classification,
            "similar_issues": similar_issues,
            "resolution": resolution,
            "documentation": doc_results,
            "recommendations": recommendations,
            "next_steps": [
                f"1. Severity Level: {classification['severity']}",
                f"2. Affected Systems: {', '.join(classification['tags'])}",
                f"3. Estimated Resolution Time: {resolution['estimated_time_minutes']} minutes",
                f"4. Follow resolution steps provided above",
                f"5. Reference similar historical issues if available"
            ]
        }
    
    def record_resolution(self, issue_id: str, severity: str, description: str,
                         solution: str, resolution_time: float, tags: list, success: bool = True):
        """Record a resolution in the knowledge base for ML learning"""
        self.kb.learn_issue(issue_id, severity, description, solution, resolution_time, tags, success)
        logger.info(f"Recorded resolution for issue {issue_id}")
    
    def get_statistics(self) -> dict:
        """Get support system statistics"""
        stats = self.kb.data["statistics"]
        patterns = self.kb.data["patterns"]
        
        return {
            "statistics": stats,
            "top_patterns": sorted(
                patterns.items(),
                key=lambda x: x[1]["count"],
                reverse=True
            )[:5],
            "documentation_indexed": len(self.doc_index.docs),
            "learning_events": len(self.kb.data["learning_logs"])
        }


# ============================================================================
# MCP TOOL DEFINITIONS (if MCP is available)
# ============================================================================

if MCP_AVAILABLE:
    server = Server("swipesavvy-ai-support-concierge")
    concierge = None
    
    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict) -> str:
        """Handle MCP tool calls"""
        global concierge
        if concierge is None:
            concierge = SwipeSavvySupportConcierge()
        
        if name == "analyze_issue":
            result = concierge.analyze_issue(
                arguments["description"],
                arguments.get("user_id", "unknown")
            )
            return json.dumps(result, indent=2)
        
        elif name == "search_documentation":
            results = concierge.doc_index.search(
                arguments["query"],
                arguments.get("limit", 5)
            )
            return json.dumps(results, indent=2)
        
        elif name == "find_similar_issues":
            results = concierge.kb.find_similar_issues(
                arguments["description"],
                arguments.get("tags", []),
                arguments.get("limit", 5)
            )
            return json.dumps(results, indent=2)
        
        elif name == "record_resolution":
            concierge.record_resolution(
                arguments["issue_id"],
                arguments["severity"],
                arguments["description"],
                arguments["solution"],
                float(arguments["resolution_time"]),
                arguments["tags"],
                arguments.get("success", True)
            )
            return json.dumps({"status": "success", "message": "Resolution recorded"})
        
        elif name == "get_statistics":
            result = concierge.get_statistics()
            return json.dumps(result, indent=2)
        
        else:
            return json.dumps({"error": f"Unknown tool: {name}"})
    
    # Define available tools
    @server.list_tools()
    async def list_tools() -> List[Tool]:
        return [
            Tool(
                name="analyze_issue",
                description="Analyze an issue and provide comprehensive support recommendations",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Detailed description of the issue"
                        },
                        "user_id": {
                            "type": "string",
                            "description": "Optional user ID for tracking"
                        }
                    },
                    "required": ["description"]
                }
            ),
            Tool(
                name="search_documentation",
                description="Search documentation by keyword",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum results (default 5)"
                        }
                    },
                    "required": ["query"]
                }
            ),
            Tool(
                name="find_similar_issues",
                description="Find similar issues from knowledge base",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Issue description"
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Relevant tags/components"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum results"
                        }
                    },
                    "required": ["description"]
                }
            ),
            Tool(
                name="record_resolution",
                description="Record a resolution for ML learning",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "issue_id": {"type": "string"},
                        "severity": {"type": "string"},
                        "description": {"type": "string"},
                        "solution": {"type": "string"},
                        "resolution_time": {"type": "number"},
                        "tags": {"type": "array", "items": {"type": "string"}},
                        "success": {"type": "boolean"}
                    },
                    "required": ["issue_id", "severity", "description", "solution", "resolution_time", "tags"]
                }
            ),
            Tool(
                name="get_statistics",
                description="Get support system statistics and learning metrics",
                inputSchema={"type": "object", "properties": {}}
            )
        ]
else:
    # Standalone mode (for testing without MCP)
    concierge = SwipeSavvySupportConcierge()


# ============================================================================
# STANDALONE CLI (for testing)
# ============================================================================

async def main():
    """Standalone mode for testing the concierge"""
    if not MCP_AVAILABLE:
        print("\n🤖 SwipeSavvy AI Support Concierge (Standalone Mode)")
        print("=" * 60)
        
        concierge = SwipeSavvySupportConcierge()
        
        # Test issue analysis
        test_issue = "The admin portal is completely down and users cannot login. Database seems to be not responding."
        print(f"\n📋 Analyzing issue: {test_issue}\n")
        
        result = concierge.analyze_issue(test_issue)
        print(json.dumps(result, indent=2))
        
        # Record the resolution
        concierge.record_resolution(
            issue_id=result["issue_id"],
            severity=result["classification"]["severity"],
            description=test_issue,
            solution="Restarted PostgreSQL service and verified database connectivity",
            resolution_time=300,
            tags=result["classification"]["tags"]
        )
        
        print("\n✅ Resolution recorded")
        print(f"\n📊 System Statistics:\n{json.dumps(concierge.get_statistics(), indent=2)}")
    else:
        print("🚀 SwipeSavvy AI Support Concierge MCP Server")
        print("Listening for MCP connections...")
        await server.run()


if __name__ == "__main__":
    asyncio.run(main())
