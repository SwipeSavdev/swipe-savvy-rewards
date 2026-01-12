"""
KYC Service - Identity Verification and Document Processing

Handles:
- Document upload and verification
- Identity verification via Plaid IDV
- OFAC/Sanctions screening
- KYC tier management
"""

import os
import re
import boto3
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlalchemy.orm import Session

from app.models import User, UserKYCDocument, UserKYCHistory, OFACScreeningResult


class KYCTier(str, Enum):
    TIER1 = "tier1"  # Basic - Email/Phone verified, $500 daily limit
    TIER2 = "tier2"  # Standard - ID verified, $2,000 daily limit
    TIER3 = "tier3"  # Premium - Full KYC, $10,000 daily limit


class KYCStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_INFO = "requires_info"
    EXPIRED = "expired"


class DocumentType(str, Enum):
    DRIVERS_LICENSE = "drivers_license"
    PASSPORT = "passport"
    STATE_ID = "state_id"
    SSN_CARD = "ssn_card"
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    SELFIE = "selfie"


# Transaction limits by tier
TIER_LIMITS = {
    KYCTier.TIER1: {
        "daily_limit": 500.00,
        "monthly_limit": 2000.00,
        "single_transaction_limit": 200.00
    },
    KYCTier.TIER2: {
        "daily_limit": 2000.00,
        "monthly_limit": 10000.00,
        "single_transaction_limit": 1000.00
    },
    KYCTier.TIER3: {
        "daily_limit": 10000.00,
        "monthly_limit": 50000.00,
        "single_transaction_limit": 5000.00
    }
}


class KYCService:
    """KYC verification and management service"""

    def __init__(self):
        self.s3_bucket = os.getenv("S3_KYC_BUCKET", "swipesavvy-kyc-documents")
        self.s3_region = os.getenv("AWS_REGION", "us-east-1")
        self.plaid_client_id = os.getenv("PLAID_CLIENT_ID")
        self.plaid_secret = os.getenv("PLAID_SECRET")
        self.plaid_env = os.getenv("PLAID_ENV", "sandbox")

        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            region_name=self.s3_region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        ) if os.getenv("AWS_ACCESS_KEY_ID") else None

    def get_tier_limits(self, tier: str) -> Dict[str, float]:
        """Get transaction limits for a KYC tier"""
        return TIER_LIMITS.get(KYCTier(tier), TIER_LIMITS[KYCTier.TIER1])

    async def check_transaction_limit(
        self,
        db: Session,
        user: User,
        amount: float
    ) -> Dict[str, Any]:
        """
        Check if a transaction is within user's KYC limits.

        Returns dict with:
        - allowed: bool
        - reason: str (if not allowed)
        - remaining_daily: float
        - remaining_monthly: float
        """
        limits = self.get_tier_limits(user.kyc_tier)

        # Get today's transactions
        today = datetime.utcnow().date()
        # This would query actual transactions - simplified for now
        daily_spent = 0.00  # TODO: Sum from transactions table

        # Get this month's transactions
        month_start = today.replace(day=1)
        monthly_spent = 0.00  # TODO: Sum from transactions table

        remaining_daily = limits["daily_limit"] - daily_spent
        remaining_monthly = limits["monthly_limit"] - monthly_spent

        if amount > limits["single_transaction_limit"]:
            return {
                "allowed": False,
                "reason": f"Amount exceeds single transaction limit of ${limits['single_transaction_limit']:.2f}",
                "remaining_daily": remaining_daily,
                "remaining_monthly": remaining_monthly,
                "upgrade_tier": self._get_next_tier(user.kyc_tier)
            }

        if amount > remaining_daily:
            return {
                "allowed": False,
                "reason": f"Amount exceeds remaining daily limit of ${remaining_daily:.2f}",
                "remaining_daily": remaining_daily,
                "remaining_monthly": remaining_monthly,
                "upgrade_tier": self._get_next_tier(user.kyc_tier)
            }

        if amount > remaining_monthly:
            return {
                "allowed": False,
                "reason": f"Amount exceeds remaining monthly limit of ${remaining_monthly:.2f}",
                "remaining_daily": remaining_daily,
                "remaining_monthly": remaining_monthly,
                "upgrade_tier": self._get_next_tier(user.kyc_tier)
            }

        return {
            "allowed": True,
            "remaining_daily": remaining_daily - amount,
            "remaining_monthly": remaining_monthly - amount
        }

    def _get_next_tier(self, current_tier: str) -> Optional[str]:
        """Get the next KYC tier for upgrade"""
        tiers = [KYCTier.TIER1, KYCTier.TIER2, KYCTier.TIER3]
        try:
            current_idx = tiers.index(KYCTier(current_tier))
            if current_idx < len(tiers) - 1:
                return tiers[current_idx + 1].value
        except (ValueError, IndexError):
            pass
        return None

    async def upload_document(
        self,
        db: Session,
        user: User,
        document_type: str,
        file_content: bytes,
        file_name: str,
        mime_type: str,
        document_subtype: Optional[str] = None
    ) -> UserKYCDocument:
        """
        Upload and store KYC document.

        Args:
            db: Database session
            user: User uploading document
            document_type: Type of document (drivers_license, passport, etc.)
            file_content: Raw file bytes
            file_name: Original filename
            mime_type: MIME type (image/jpeg, image/png, application/pdf)
            document_subtype: front, back, or selfie

        Returns:
            UserKYCDocument record
        """
        # Validate document type
        if document_type not in [dt.value for dt in DocumentType]:
            raise ValueError(f"Invalid document type: {document_type}")

        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/heic", "application/pdf"]
        if mime_type not in allowed_types:
            raise ValueError(f"Invalid file type: {mime_type}")

        # Generate unique file path
        file_hash = hashlib.sha256(file_content).hexdigest()[:16]
        ext = self._get_extension(mime_type)
        s3_key = f"users/{user.id}/{document_type}/{file_hash}{ext}"

        # Upload to S3
        if self.s3_client:
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=s3_key,
                Body=file_content,
                ContentType=mime_type,
                ServerSideEncryption='aws:kms',
                Metadata={
                    'user_id': str(user.id),
                    'document_type': document_type,
                    'original_filename': file_name
                }
            )
        else:
            # Development mode - store locally or skip
            print(f"[DEV] Would upload to S3: {s3_key}")

        # Create document record
        document = UserKYCDocument(
            id=uuid4(),
            user_id=user.id,
            document_type=document_type,
            document_subtype=document_subtype,
            file_path=s3_key,
            file_name=file_name,
            file_size=len(file_content),
            mime_type=mime_type,
            status="pending"
        )

        db.add(document)

        # Log KYC history
        history = UserKYCHistory(
            user_id=user.id,
            action="document_uploaded",
            verification_type="document",
            notes=f"Uploaded {document_type} document"
        )
        db.add(history)

        # Update user KYC status if needed
        if user.kyc_status == "pending":
            user.kyc_status = "in_review"

        db.commit()

        return document

    def _get_extension(self, mime_type: str) -> str:
        """Get file extension from MIME type"""
        extensions = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/heic": ".heic",
            "application/pdf": ".pdf"
        }
        return extensions.get(mime_type, ".bin")

    async def verify_document(
        self,
        db: Session,
        document: UserKYCDocument,
        admin_user_id: Optional[UUID] = None,
        auto_verify: bool = False
    ) -> Dict[str, Any]:
        """
        Verify a KYC document.

        For production, this would integrate with an IDV provider.
        For now, implements basic validation.
        """
        verification_result = {
            "verified": False,
            "checks": [],
            "warnings": [],
            "errors": []
        }

        # Basic validation checks
        if document.file_size < 10000:  # Less than 10KB
            verification_result["errors"].append("Document image quality too low")
        elif document.file_size > 10000000:  # More than 10MB
            verification_result["errors"].append("Document file too large")
        else:
            verification_result["checks"].append("file_size_valid")

        # In production, call IDV provider here
        # For now, simulate successful verification
        if auto_verify or not verification_result["errors"]:
            verification_result["verified"] = True
            document.status = "verified"
            document.verified_at = datetime.utcnow()
            document.verified_by = admin_user_id
        else:
            document.status = "rejected"
            document.rejection_reason = "; ".join(verification_result["errors"])

        document.verification_result = verification_result
        db.commit()

        return verification_result

    async def initiate_identity_verification(
        self,
        db: Session,
        user: User
    ) -> Dict[str, Any]:
        """
        Initiate identity verification flow using Plaid IDV.

        Returns link token for Plaid IDV UI.
        """
        if not self.plaid_client_id or not self.plaid_secret:
            # Development mode - simulate
            return {
                "success": True,
                "link_token": "simulated-link-token",
                "simulated": True
            }

        # In production, call Plaid IDV API
        # https://plaid.com/docs/api/identity-verification/
        try:
            # TODO: Implement actual Plaid IDV integration
            # plaid_client.identity_verification_create(...)

            return {
                "success": True,
                "link_token": "plaid-link-token-here",
                "expiration": (datetime.utcnow() + timedelta(hours=1)).isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def complete_identity_verification(
        self,
        db: Session,
        user: User,
        idv_session_id: str
    ) -> Dict[str, Any]:
        """
        Complete identity verification after Plaid IDV flow.

        Retrieves results from Plaid and updates user KYC status.
        """
        # In production, retrieve results from Plaid
        # For now, simulate successful verification
        verification_result = {
            "verified": True,
            "status": "success",
            "checks": {
                "selfie_check": "passed",
                "document_check": "passed",
                "watchlist_screening": "clear"
            }
        }

        # Update user
        user.identity_verification_id = idv_session_id
        user.identity_verification_status = "verified"
        user.kyc_status = KYCStatus.APPROVED.value
        user.kyc_verified_at = datetime.utcnow()
        user.kyc_tier = KYCTier.TIER2.value  # Upgrade to tier 2

        # Log history
        history = UserKYCHistory(
            user_id=user.id,
            action="identity_verified",
            verification_type="identity",
            verification_provider="plaid",
            previous_tier=KYCTier.TIER1.value,
            new_tier=KYCTier.TIER2.value,
            previous_status="in_review",
            new_status=KYCStatus.APPROVED.value,
            verification_result=verification_result
        )
        db.add(history)
        db.commit()

        return {
            "success": True,
            "kyc_status": user.kyc_status,
            "kyc_tier": user.kyc_tier,
            "limits": self.get_tier_limits(user.kyc_tier)
        }

    async def run_ofac_screening(
        self,
        db: Session,
        user: User
    ) -> OFACScreeningResult:
        """
        Run OFAC/Sanctions screening on user.

        In production, this would call an OFAC screening API.
        """
        # Check if recent screening exists
        recent = db.query(OFACScreeningResult).filter(
            OFACScreeningResult.user_id == user.id,
            OFACScreeningResult.created_at > datetime.utcnow() - timedelta(days=30),
            OFACScreeningResult.status == "clear"
        ).first()

        if recent:
            return recent

        # Run new screening
        # In production, call OFAC API (e.g., ComplyAdvantage, Dow Jones, etc.)
        screening = OFACScreeningResult(
            id=uuid4(),
            user_id=user.id,
            screening_type="ofac",
            provider="internal",  # Would be actual provider in production
            status="clear",
            match_score=0.0,
            matches=[],
            raw_response={
                "screened_at": datetime.utcnow().isoformat(),
                "name_checked": user.name,
                "result": "no_match"
            }
        )

        db.add(screening)

        # Log history
        history = UserKYCHistory(
            user_id=user.id,
            action="ofac_screening",
            verification_type="sanctions",
            verification_provider="ofac",
            verification_result={"status": "clear"}
        )
        db.add(history)

        db.commit()

        return screening

    async def request_tier_upgrade(
        self,
        db: Session,
        user: User,
        target_tier: str
    ) -> Dict[str, Any]:
        """
        Request KYC tier upgrade.

        Returns requirements for the upgrade.
        """
        current_tier = KYCTier(user.kyc_tier)
        target = KYCTier(target_tier)

        # Validate upgrade path
        tier_order = [KYCTier.TIER1, KYCTier.TIER2, KYCTier.TIER3]
        if tier_order.index(target) <= tier_order.index(current_tier):
            return {
                "success": False,
                "error": "Cannot downgrade tier or already at requested tier"
            }

        # Define requirements per tier
        requirements = {
            KYCTier.TIER2: {
                "description": "Standard verification with ID",
                "steps": [
                    {"id": "document", "name": "Upload Government ID", "completed": False},
                    {"id": "selfie", "name": "Take Selfie for Verification", "completed": False},
                    {"id": "identity", "name": "Complete Identity Verification", "completed": False}
                ]
            },
            KYCTier.TIER3: {
                "description": "Premium verification with enhanced KYC",
                "steps": [
                    {"id": "address_proof", "name": "Upload Proof of Address", "completed": False},
                    {"id": "income_proof", "name": "Upload Proof of Income", "completed": False},
                    {"id": "enhanced_review", "name": "Complete Enhanced Review", "completed": False}
                ]
            }
        }

        # Check existing documents
        existing_docs = db.query(UserKYCDocument).filter(
            UserKYCDocument.user_id == user.id,
            UserKYCDocument.status == "verified"
        ).all()

        doc_types = {doc.document_type for doc in existing_docs}

        # Mark completed steps
        tier_reqs = requirements.get(target, {})
        for step in tier_reqs.get("steps", []):
            if step["id"] == "document" and any(dt in doc_types for dt in ["drivers_license", "passport", "state_id"]):
                step["completed"] = True
            elif step["id"] == "selfie" and "selfie" in doc_types:
                step["completed"] = True
            elif step["id"] == "identity" and user.identity_verification_status == "verified":
                step["completed"] = True
            elif step["id"] == "address_proof" and any(dt in doc_types for dt in ["utility_bill", "bank_statement"]):
                step["completed"] = True

        return {
            "success": True,
            "current_tier": current_tier.value,
            "target_tier": target.value,
            "current_limits": self.get_tier_limits(current_tier.value),
            "target_limits": self.get_tier_limits(target.value),
            "requirements": tier_reqs
        }

    async def get_kyc_status(
        self,
        db: Session,
        user: User
    ) -> Dict[str, Any]:
        """Get comprehensive KYC status for user"""
        # Get documents
        documents = db.query(UserKYCDocument).filter(
            UserKYCDocument.user_id == user.id
        ).all()

        # Get latest OFAC screening
        ofac_result = db.query(OFACScreeningResult).filter(
            OFACScreeningResult.user_id == user.id
        ).order_by(OFACScreeningResult.created_at.desc()).first()

        # Get history
        history = db.query(UserKYCHistory).filter(
            UserKYCHistory.user_id == user.id
        ).order_by(UserKYCHistory.created_at.desc()).limit(10).all()

        return {
            "user_id": str(user.id),
            "kyc_tier": user.kyc_tier,
            "kyc_status": user.kyc_status,
            "kyc_verified_at": user.kyc_verified_at.isoformat() if user.kyc_verified_at else None,
            "limits": self.get_tier_limits(user.kyc_tier),
            "verification": {
                "email_verified": user.email_verified,
                "phone_verified": user.phone_verified,
                "identity_verified": user.identity_verification_status == "verified"
            },
            "documents": [
                {
                    "id": str(doc.id),
                    "type": doc.document_type,
                    "status": doc.status,
                    "uploaded_at": doc.created_at.isoformat()
                }
                for doc in documents
            ],
            "ofac_status": ofac_result.status if ofac_result else "pending",
            "next_tier": self._get_next_tier(user.kyc_tier),
            "history": [
                {
                    "action": h.action,
                    "type": h.verification_type,
                    "created_at": h.created_at.isoformat()
                }
                for h in history
            ]
        }
