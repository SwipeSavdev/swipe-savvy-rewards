"""
Guardrails Service - Safety and Policy Enforcement
Week 9 Implementation

Provides:
- Content safety detection (violence, hate speech, toxicity)
- PII detection and masking (SSN, credit cards, emails, phones)
- Prompt injection prevention
- Input/output guardrails

Status: Phase 1, Week 9 - Complete
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
import os
import re
import sys
from pathlib import Path

# Add shared modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "shared"))
from shared.logging_config import get_logger

logger = get_logger("guardrails-service")

app = FastAPI(
    title="Guardrails Service",
    description="Content safety, PII protection, and security guardrails",
    version="1.0.0-alpha"
)


# ============================================================================
# Models
# ============================================================================

class Direction(str, Enum):
    """Direction of guardrail check"""
    INPUT = "input"
    OUTPUT = "output"


class Violation(BaseModel):
    """Policy violation details"""
    type: str
    severity: str
    message: str
    confidence: float = 0.0


class SafetyViolation(BaseModel):
    """Content safety violation"""
    category: str
    severity: str
    score: float
    matched_patterns: List[str]


class PIIMatch(BaseModel):
    """Detected PII match"""
    pii_type: str
    value: str
    masked_value: str
    start: int
    end: int


class GuardrailRequest(BaseModel):
    """Request model for guardrail check"""
    message: str
    direction: Direction
    user_id: Optional[str] = None
    check_safety: bool = True
    check_pii: bool = True
    check_injection: bool = True


class GuardrailResponse(BaseModel):
    """Response model for guardrail check"""
    safe: bool
    violations: List[Violation]
    masked_message: str
    confidence: float
    pii_detected: bool = False
    pii_matches: List[PIIMatch] = []
    safety_score: float = 0.0
    injection_detected: bool = False


# ============================================================================
# Content Safety Checker
# ============================================================================

class ContentSafetyChecker:
    """Detects harmful, toxic, or inappropriate content"""
    
    PATTERNS = {
        "violence": {
            "patterns": [
                r'\b(kill|murder|harm|hurt|attack|assault|weapon|gun|knife|threat)\b'
            ],
            "severity": "high"
        },
        "hate_speech": {
            "patterns": [
                r'\b(hate|racist|discrimination|bigot)\b'
            ],
            "severity": "critical"
        },
        "self_harm": {
            "patterns": [
                r'\b(suicide|self-harm|end my life|kill myself)\b'
            ],
            "severity": "critical"
        },
        "profanity": {
            "patterns": [
                r'\b(damn|hell|stupid|idiot|moron|dumb)\b'
            ],
            "severity": "low"
        },
        "toxic": {
            "patterns": [
                r'\byou\'re (stupid|dumb|idiot)\b',
                r'\b(shut up|get lost|i hate you)\b',
                r'!!!+'
            ],
            "severity": "medium"
        }
    }
    
    def check(self, text: str) -> tuple[bool, float, List[SafetyViolation]]:
        """Check text for safety violations"""
        if not text:
            return True, 0.0, []
        
        text_lower = text.lower()
        violations = []
        max_score = 0.0
        
        severity_scores = {
            "low": 0.2,
            "medium": 0.5,
            "high": 0.8,
            "critical": 1.0
        }
        
        for category, config in self.PATTERNS.items():
            matched = []
            for pattern in config["patterns"]:
                if re.search(pattern, text_lower):
                    matched.append(pattern)
            
            if matched:
                score = severity_scores.get(config["severity"], 0.5)
                max_score = max(max_score, score)
                
                violations.append(SafetyViolation(
                    category=category,
                    severity=config["severity"],
                    score=score,
                    matched_patterns=matched
                ))
        
        is_safe = max_score < 0.5
        return is_safe, max_score, violations


# ============================================================================
# PII Detector
# ============================================================================

class PIIDetector:
    """Detects and masks PII"""
    
    PATTERNS = {
        "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
        "credit_card": r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
        "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "phone": r'\b(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        "account_number": r'\b[Aa]ccount\s*#?\s*\d{8,12}\b'
    }
    
    MASKS = {
        "ssn": "***-**-****",
        "credit_card": "**** **** **** ****",
        "email": "***@***.***",
        "phone": "***-***-****",
        "account_number": "Account #********"
    }
    
    def detect(self, text: str) -> tuple[bool, str, List[PIIMatch]]:
        """Detect and mask PII"""
        if not text:
            return False, text, []
        
        matches = []
        masked_text = text
        
        for pii_type, pattern in self.PATTERNS.items():
            for match in re.finditer(pattern, text):
                value = match.group(0)
                masked_value = self.MASKS.get(pii_type, "***")
                
                matches.append(PIIMatch(
                    pii_type=pii_type,
                    value=value,
                    masked_value=masked_value,
                    start=match.start(),
                    end=match.end()
                ))
                
                masked_text = masked_text.replace(value, masked_value)
        
        has_pii = len(matches) > 0
        return has_pii, masked_text, matches


# ============================================================================
# Prompt Injection Detector
# ============================================================================

class PromptInjectionDetector:
    """Detects prompt injection and jailbreak attempts"""
    
    PATTERNS = [
        r'ignore (previous|all|above) (instructions|prompts)',
        r'disregard (previous|all)',
        r'forget everything',
        r'you are now',
        r'act as',
        r'pretend to be',
        r'(show|reveal) (your|the) system prompt',
        r'dan mode',
        r'enable dan',
        r'developer mode',
        r'bypass (safety|security)',
    ]
    
    def check(self, text: str) -> tuple[bool, float, List[str]]:
        """Check for prompt injection"""
        if not text:
            return False, 0.0, []
        
        text_lower = text.lower()
        detected = []
        
        for pattern in self.PATTERNS:
            if re.search(pattern, text_lower):
                detected.append(pattern)
        
        count = len(detected)
        if count == 0:
            confidence = 0.0
        elif count == 1:
            confidence = 0.6
        elif count == 2:
            confidence = 0.8
        else:
            confidence = 1.0
        
        is_injection = confidence >= 0.6
        return is_injection, confidence, detected


# ============================================================================
# Initialize Checkers
# ============================================================================

safety_checker = ContentSafetyChecker()
pii_detector = PIIDetector()
injection_detector = PromptInjectionDetector()


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "Guardrails Service",
        "version": "1.0.0-alpha",
        "status": "active",
        "capabilities": [
            "Content safety detection",
            "PII detection and masking",
            "Prompt injection prevention"
        ],
        "endpoints": [
            "GET /health",
            "POST /api/v1/guardrails/check"
        ]
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "version": "1.0.0-alpha",
        "services": {
            "api": "up",
            "safety_checker": "active",
            "pii_detector": "active",
            "injection_detector": "active"
        }
    }


@app.post("/api/v1/guardrails/check", response_model=GuardrailResponse)
async def check(request: GuardrailRequest):
    """
    Check message for safety violations, PII, and prompt injection
    
    Performs:
    - Content safety detection
    - PII detection and masking
    - Prompt injection detection
    """
    logger.info("Guardrails check", 
                user_id=request.user_id, 
                direction=request.direction,
                text_length=len(request.message))
    
    violations = []
    masked_message = request.message
    overall_safe = True
    pii_detected = False
    pii_matches = []
    safety_score = 0.0
    injection_detected = False
    max_confidence = 0.0
    
    # Safety check
    if request.check_safety:
        is_safe, score, safety_violations = safety_checker.check(request.message)
        safety_score = score
        
        if not is_safe:
            overall_safe = False
            for sv in safety_violations:
                violations.append(Violation(
                    type=f"safety_{sv.category}",
                    severity=sv.severity,
                    message=f"Content safety violation: {sv.category}",
                    confidence=sv.score
                ))
                max_confidence = max(max_confidence, sv.score)
    
    # PII detection
    if request.check_pii:
        has_pii, masked_text, matches = pii_detector.detect(request.message)
        pii_detected = has_pii
        pii_matches = matches
        masked_message = masked_text
        
        if has_pii:
            for match in matches:
                violations.append(Violation(
                    type=f"pii_{match.pii_type}",
                    severity="high",
                    message=f"PII detected: {match.pii_type}",
                    confidence=1.0
                ))
                max_confidence = max(max_confidence, 1.0)
    
    # Injection detection
    if request.check_injection:
        is_injection, confidence, patterns = injection_detector.check(request.message)
        injection_detected = is_injection
        
        if is_injection:
            overall_safe = False
            violations.append(Violation(
                type="prompt_injection",
                severity="critical",
                message=f"Prompt injection detected: {len(patterns)} patterns matched",
                confidence=confidence
            ))
            max_confidence = max(max_confidence, confidence)
    
    logger.info("Guardrails check complete",
                is_safe=overall_safe,
                violations_count=len(violations),
                pii_detected=pii_detected,
                injection_detected=injection_detected)
    
    return GuardrailResponse(
        safe=overall_safe,
        violations=violations,
        masked_message=masked_message,
        confidence=max_confidence,
        pii_detected=pii_detected,
        pii_matches=pii_matches,
        safety_score=safety_score,
        injection_detected=injection_detected
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8002"))
    uvicorn.run(app, host="0.0.0.0", port=port)

