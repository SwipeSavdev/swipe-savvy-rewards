"""
AI Support Concierge API Routes
Integration layer for the SwipeSavvy Support Concierge MCP Server with the FastAPI backend
"""

import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import json
import logging

# Add workspace root to path to import the MCP server
workspace_root = str(Path(__file__).parent.parent)
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

from mcp_support_server import SwipeSavvySupportConcierge

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/support", tags=["AI Support Concierge"])

# Initialize the support concierge
concierge = SwipeSavvySupportConcierge(workspace_root=workspace_root)


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class IssueRequest(BaseModel):
    """Request model for submitting an issue"""
    description: str
    user_id: Optional[str] = None


class ResolutionRecordRequest(BaseModel):
    """Request model for recording a resolution"""
    issue_id: str
    severity: str
    description: str
    solution: str
    resolution_time: float
    tags: List[str]
    success: Optional[bool] = True


class DocumentationSearchRequest(BaseModel):
    """Request model for documentation search"""
    query: str
    limit: Optional[int] = 5


class SimilarIssuesRequest(BaseModel):
    """Request model for finding similar issues"""
    description: str
    tags: Optional[List[str]] = None
    limit: Optional[int] = 5


# ============================================================================
# API ROUTES
# ============================================================================

@router.post("/analyze-issue")
async def analyze_issue(request: IssueRequest):
    """
    Analyze an issue and provide comprehensive support recommendations
    
    Args:
        description: Detailed description of the issue
        user_id: Optional user ID for tracking
        
    Returns:
        Issue analysis with classification, resolution steps, and recommendations
    """
    try:
        result = concierge.analyze_issue(request.description, request.user_id)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error analyzing issue: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-documentation")
async def search_documentation(request: DocumentationSearchRequest):
    """
    Search documentation by keyword
    
    Args:
        query: Search query
        limit: Maximum number of results
        
    Returns:
        List of relevant documentation files with previews
    """
    try:
        results = concierge.doc_index.search(request.query, request.limit)
        return {
            "status": "success",
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Error searching documentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/find-similar-issues")
async def find_similar_issues(request: SimilarIssuesRequest):
    """
    Find similar issues from the knowledge base
    
    Args:
        description: Issue description
        tags: Relevant tags/components
        limit: Maximum number of results
        
    Returns:
        List of similar historical issues with solutions
    """
    try:
        tags = request.tags or []
        results = concierge.kb.find_similar_issues(request.description, tags, request.limit)
        return {
            "status": "success",
            "similar_count": len(results),
            "issues": results
        }
    except Exception as e:
        logger.error(f"Error finding similar issues: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/record-resolution")
async def record_resolution(request: ResolutionRecordRequest):
    """
    Record a resolution for ML learning
    
    Args:
        issue_id: Issue identifier
        severity: Issue severity (CRITICAL, MODERATE, LOW)
        description: Issue description
        solution: Resolution provided
        resolution_time: Time taken to resolve in seconds
        tags: List of related tags
        success: Whether resolution was successful
        
    Returns:
        Confirmation of recorded resolution
    """
    try:
        concierge.record_resolution(
            request.issue_id,
            request.severity,
            request.description,
            request.solution,
            request.resolution_time,
            request.tags,
            request.success
        )
        return {
            "status": "success",
            "message": "Resolution recorded successfully",
            "issue_id": request.issue_id
        }
    except Exception as e:
        logger.error(f"Error recording resolution: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics")
async def get_statistics():
    """
    Get support system statistics and learning metrics
    
    Returns:
        Statistics including total issues, success rates, and top patterns
    """
    try:
        stats = concierge.get_statistics()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def support_health():
    """
    Health check endpoint for the support concierge
    
    Returns:
        Health status with documentation and KB stats
    """
    try:
        stats = concierge.get_statistics()
        return {
            "status": "healthy",
            "service": "AI Support Concierge",
            "documentation_indexed": stats["documentation_indexed"],
            "total_issues_recorded": stats["statistics"]["total_issues_resolved"]
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-analyze")
async def batch_analyze_issues(issues: List[IssueRequest]):
    """
    Analyze multiple issues in batch
    
    Args:
        issues: List of issue requests
        
    Returns:
        List of analyses for each issue
    """
    try:
        results = []
        for issue in issues:
            analysis = concierge.analyze_issue(issue.description, issue.user_id)
            results.append(analysis)
        
        return {
            "status": "success",
            "count": len(results),
            "analyses": results
        }
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patterns")
async def get_learning_patterns():
    """
    Get learning patterns discovered by the ML system
    
    Returns:
        Patterns with statistics about issue resolution
    """
    try:
        patterns = concierge.kb.data["patterns"]
        return {
            "status": "success",
            "patterns": patterns,
            "total_patterns": len(patterns)
        }
    except Exception as e:
        logger.error(f"Error getting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learning-logs")
async def get_learning_logs(limit: Optional[int] = 20):
    """
    Get recent learning logs from the system
    
    Args:
        limit: Maximum number of logs to return
        
    Returns:
        Recent learning events
    """
    try:
        logs = concierge.kb.data["learning_logs"]
        return {
            "status": "success",
            "logs": logs[-limit:] if limit else logs,
            "total_logs": len(logs)
        }
    except Exception as e:
        logger.error(f"Error getting learning logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
