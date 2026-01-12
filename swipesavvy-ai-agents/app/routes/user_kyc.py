"""
User KYC API Routes

Handles:
- Document upload
- KYC status retrieval
- Tier upgrade requests
- Identity verification flow
"""

import os
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserKYCDocument
from app.routes.user_auth import get_current_user
from app.services.kyc_service import KYCService, DocumentType

router = APIRouter(prefix="/api/v1/kyc", tags=["User KYC"])

kyc_service = KYCService()


# ============================================
# Pydantic Models
# ============================================

class TierUpgradeRequest(BaseModel):
    """Request for KYC tier upgrade"""
    target_tier: str


class IdentityVerificationStart(BaseModel):
    """Start identity verification flow"""
    pass


class IdentityVerificationComplete(BaseModel):
    """Complete identity verification"""
    session_id: str


class TransactionLimitCheck(BaseModel):
    """Check transaction against limits"""
    amount: float


# ============================================
# API Endpoints
# ============================================

@router.get("/status")
async def get_kyc_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current KYC status and verification progress"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    status = await kyc_service.get_kyc_status(db, current_user)
    return status


@router.get("/limits")
async def get_transaction_limits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current transaction limits based on KYC tier"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    limits = kyc_service.get_tier_limits(current_user.kyc_tier)
    return {
        "kyc_tier": current_user.kyc_tier,
        "limits": limits,
        "next_tier": kyc_service._get_next_tier(current_user.kyc_tier)
    }


@router.post("/check-limit")
async def check_transaction_limit(
    request: TransactionLimitCheck,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a transaction amount is within limits"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await kyc_service.check_transaction_limit(db, current_user, request.amount)
    return result


@router.post("/documents/upload")
async def upload_document(
    document_type: str = Form(...),
    document_subtype: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a KYC document.

    Document types:
    - drivers_license
    - passport
    - state_id
    - ssn_card
    - utility_bill
    - bank_statement
    - selfie

    Document subtypes (for IDs):
    - front
    - back
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate document type
    valid_types = [dt.value for dt in DocumentType]
    if document_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}"
        )

    # Validate file type
    allowed_content_types = [
        "image/jpeg", "image/png", "image/heic", "application/pdf"
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: JPEG, PNG, HEIC, PDF"
        )

    # Check file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB")

    # Check minimum size
    if len(content) < 10 * 1024:
        raise HTTPException(status_code=400, detail="File too small. Minimum 10KB for quality")

    try:
        document = await kyc_service.upload_document(
            db=db,
            user=current_user,
            document_type=document_type,
            file_content=content,
            file_name=file.filename,
            mime_type=file.content_type,
            document_subtype=document_subtype
        )

        return {
            "success": True,
            "document_id": str(document.id),
            "document_type": document.document_type,
            "status": document.status,
            "message": "Document uploaded successfully. It will be reviewed shortly."
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/documents")
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all uploaded KYC documents"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    documents = db.query(UserKYCDocument).filter(
        UserKYCDocument.user_id == current_user.id
    ).order_by(UserKYCDocument.created_at.desc()).all()

    return {
        "documents": [
            {
                "id": str(doc.id),
                "document_type": doc.document_type,
                "document_subtype": doc.document_subtype,
                "file_name": doc.file_name,
                "status": doc.status,
                "rejection_reason": doc.rejection_reason,
                "expires_at": doc.expires_at.isoformat() if doc.expires_at else None,
                "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
                "uploaded_at": doc.created_at.isoformat()
            }
            for doc in documents
        ]
    }


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an uploaded document (only if pending)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    document = db.query(UserKYCDocument).filter(
        UserKYCDocument.id == document_id,
        UserKYCDocument.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete document that has been reviewed"
        )

    db.delete(document)
    db.commit()

    return {"success": True, "message": "Document deleted"}


@router.post("/upgrade")
async def request_tier_upgrade(
    request: TierUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Request upgrade to a higher KYC tier.

    Returns requirements for the upgrade.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    valid_tiers = ["tier1", "tier2", "tier3"]
    if request.target_tier not in valid_tiers:
        raise HTTPException(status_code=400, detail="Invalid tier")

    result = await kyc_service.request_tier_upgrade(
        db, current_user, request.target_tier
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/identity/start")
async def start_identity_verification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start identity verification flow.

    Returns link token for Plaid IDV or similar provider.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user.identity_verification_status == "verified":
        return {
            "success": True,
            "already_verified": True,
            "message": "Identity already verified"
        }

    result = await kyc_service.initiate_identity_verification(db, current_user)

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result


@router.post("/identity/complete")
async def complete_identity_verification(
    request: IdentityVerificationComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Complete identity verification after Plaid IDV flow.

    Called after user completes the Plaid IDV UI.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await kyc_service.complete_identity_verification(
        db, current_user, request.session_id
    )

    return result


@router.post("/screening/ofac")
async def run_ofac_screening(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run OFAC/Sanctions screening.

    Typically run automatically during signup, but can be requested manually.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await kyc_service.run_ofac_screening(db, current_user)

    return {
        "success": True,
        "screening_id": str(result.id),
        "status": result.status,
        "screened_at": result.created_at.isoformat()
    }


@router.get("/requirements/{tier}")
async def get_tier_requirements(
    tier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get requirements for a specific KYC tier"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    valid_tiers = ["tier1", "tier2", "tier3"]
    if tier not in valid_tiers:
        raise HTTPException(status_code=400, detail="Invalid tier")

    result = await kyc_service.request_tier_upgrade(db, current_user, tier)

    if not result.get("success") and "Cannot downgrade" not in result.get("error", ""):
        raise HTTPException(status_code=400, detail=result.get("error"))

    return {
        "tier": tier,
        "limits": kyc_service.get_tier_limits(tier),
        "requirements": result.get("requirements", {})
    }
