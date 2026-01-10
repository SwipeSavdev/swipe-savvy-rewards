"""
Admin Portal - Merchant Onboarding Routes

Endpoints for merchant onboarding with Fiserv AccessOne North Boarding API integration.
Supports the refactored 4-step wizard with 26 essential fields and multiple owners.
"""

from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from uuid import uuid4
import logging
import base64
import os
import json

from app.database import get_db
from app.models import Merchant as MerchantModel, MerchantOnboarding as OnboardingModel
from app.services.fiserv_boarding_service import (
    create_fiserv_service,
    MPAXmlBuilder,
    FiservAttachment
)
from app.services.field_derivation_service import (
    FieldDerivationService,
    EssentialFields,
    OwnerInfo
)
from app.services.aba_lookup_service import lookup_routing_number, validate_routing_number

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin/merchants", tags=["admin-merchant-onboarding"])


# ============================================================================
# Pydantic Models - Updated for new 26-field structure
# ============================================================================

class AddressInfo(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    country: str = "US"


class OwnerRequest(BaseModel):
    """Single owner data"""
    id: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = ""
    last_name: str
    title: str = "Owner"
    ssn: str  # Full SSN (will be encrypted)
    dob: str  # YYYY-MM-DD format
    email: str
    phone: str
    street: str
    city: str
    state: str
    zip: str
    ownership_percent: float
    is_guarantor: bool = True


class EssentialFieldsRequest(BaseModel):
    """Request model matching frontend's 26 essential fields"""
    # Step 1: Business Info (8 fields)
    legal_name: str
    dba_name: str
    tax_id: str  # EIN (XX-XXXXXXX)
    business_type: str  # S, L, C, P, T, G
    mcc_code: str
    website: Optional[str] = None
    customer_service_phone: Optional[str] = None
    business_address: AddressInfo

    # Step 2: Owners (9 fields per owner - array)
    owners: List[OwnerRequest]

    # Step 3: Banking (4 fields)
    bank_name: str
    routing_number: str
    account_number: str  # Will be encrypted
    account_type: str = "C"  # C=Checking, S=Savings

    # Step 3: Processing (4 fields)
    monthly_volume: float
    avg_ticket: float
    high_ticket: float
    processing_type: str = "RETAIL"

    # Advanced Options (optional)
    card_descriptor: Optional[str] = None
    pricing_type: Optional[str] = "IC+"
    business_start_date: Optional[str] = None


class OnboardingSaveRequest(BaseModel):
    """Request for saving partial onboarding progress"""
    step: int
    essential_fields: Optional[EssentialFieldsRequest] = None
    # Individual sections for partial saves
    business_info: Optional[Dict[str, Any]] = None
    owners: Optional[List[Dict[str, Any]]] = None
    bank_info: Optional[Dict[str, Any]] = None
    processing_info: Optional[Dict[str, Any]] = None
    advanced_options: Optional[Dict[str, Any]] = None


class OnboardingResponse(BaseModel):
    id: str
    merchant_id: str
    ext_ref_id: str
    mpa_id: Optional[str]
    north_number: Optional[str]
    status: str
    fiserv_status: Optional[str]
    fiserv_status_message: Optional[str]
    step: int
    completion_percentage: int
    # Include all fields for form population
    legal_name: Optional[str]
    dba_name: Optional[str]
    tax_id: Optional[str]
    business_type: Optional[str]
    mcc_code: Optional[str]
    business_street: Optional[str]
    business_city: Optional[str]
    business_state: Optional[str]
    business_zip: Optional[str]
    website: Optional[str]
    customer_service_phone: Optional[str]
    owners: Optional[List[Dict[str, Any]]]
    bank_name: Optional[str]
    routing_number: Optional[str]
    account_type: Optional[str]
    monthly_volume: Optional[float]
    avg_ticket: Optional[float]
    high_ticket: Optional[float]
    processing_type: Optional[str]
    card_descriptor: Optional[str]
    pricing_type: Optional[str]
    business_start_date: Optional[str]
    documents: Optional[List[Dict[str, Any]]]
    submitted_at: Optional[str]
    approved_at: Optional[str]
    created_at: str


class ABALookupResponse(BaseModel):
    routing_number: str
    bank_name: str
    valid: bool
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


# ============================================================================
# Helper Functions
# ============================================================================

def _onboarding_to_response(onboarding: OnboardingModel) -> dict:
    """Convert onboarding model to response dict with all fields"""
    # Parse owners from JSON if stored as string
    owners_data = onboarding.owners
    if isinstance(owners_data, str):
        try:
            owners_data = json.loads(owners_data)
        except:
            owners_data = []

    return {
        "id": str(onboarding.id),
        "merchant_id": str(onboarding.merchant_id),
        "ext_ref_id": onboarding.ext_ref_id,
        "mpa_id": onboarding.mpa_id,
        "north_number": onboarding.north_number,
        "status": onboarding.status,
        "fiserv_status": onboarding.fiserv_status,
        "fiserv_status_message": onboarding.fiserv_status_message,
        "step": onboarding.step,
        "completion_percentage": onboarding.completion_percentage,
        "legal_name": onboarding.legal_name,
        "dba_name": onboarding.dba_name,
        "tax_id": onboarding.tax_id,
        "business_type": onboarding.business_type,
        "mcc_code": onboarding.mcc_code,
        "business_street": onboarding.business_street,
        "business_city": onboarding.business_city,
        "business_state": onboarding.business_state,
        "business_zip": onboarding.business_zip,
        "website": onboarding.website,
        "customer_service_phone": onboarding.customer_service_phone,
        "owners": owners_data or [],
        "bank_name": onboarding.bank_name,
        "routing_number": onboarding.routing_number,
        "account_type": getattr(onboarding, 'account_type', 'C'),
        "monthly_volume": onboarding.monthly_volume,
        "avg_ticket": onboarding.avg_ticket,
        "high_ticket": onboarding.high_ticket,
        "processing_type": getattr(onboarding, 'processing_type', 'RETAIL'),
        "card_descriptor": getattr(onboarding, 'card_descriptor', None),
        "pricing_type": getattr(onboarding, 'pricing_type', 'IC+'),
        "business_start_date": getattr(onboarding, 'business_start_date', None),
        "documents": onboarding.documents or [],
        "submitted_at": onboarding.submitted_at.isoformat() if onboarding.submitted_at else None,
        "approved_at": onboarding.approved_at.isoformat() if onboarding.approved_at else None,
        "created_at": onboarding.created_at.isoformat() if onboarding.created_at else ""
    }


def _calculate_completion(onboarding: OnboardingModel) -> int:
    """Calculate completion percentage based on new 4-step structure"""
    completion = 0

    # Step 1: Business Info (25%)
    step1_fields = ['legal_name', 'tax_id', 'business_type', 'mcc_code', 'business_street']
    step1_filled = sum(1 for f in step1_fields if getattr(onboarding, f, None))
    completion += int((step1_filled / len(step1_fields)) * 25)

    # Step 2: Owners (25%)
    owners = onboarding.owners
    if isinstance(owners, str):
        try:
            owners = json.loads(owners)
        except:
            owners = []

    if owners and len(owners) > 0:
        primary = owners[0]
        owner_fields = ['first_name', 'last_name', 'ssn', 'dob', 'email']
        owner_filled = sum(1 for f in owner_fields if primary.get(f))
        completion += int((owner_filled / len(owner_fields)) * 25)

    # Step 3: Banking & Processing (25%)
    step3_fields = ['bank_name', 'routing_number', 'account_number_encrypted', 'monthly_volume']
    step3_filled = sum(1 for f in step3_fields if getattr(onboarding, f, None))
    completion += int((step3_filled / len(step3_fields)) * 25)

    # Step 4: Documents (25%)
    docs = onboarding.documents or []
    has_govt_id = any(d.get('type') == 'government_id' for d in docs)
    has_voided_check = any(d.get('type') == 'voided_check' for d in docs)
    if has_govt_id and has_voided_check:
        completion += 25
    elif has_govt_id or has_voided_check:
        completion += 12

    return min(completion, 100)


# ============================================================================
# ABA Routing Number Lookup Endpoint
# ============================================================================

@router.get("/utils/aba-lookup/{routing_number}")
async def aba_lookup(routing_number: str) -> ABALookupResponse:
    """
    Look up bank information from ABA routing number.
    Used by frontend for auto-filling bank name.
    """
    try:
        result = await lookup_routing_number(routing_number)
        return ABALookupResponse(
            routing_number=result.routing_number,
            bank_name=result.bank_name,
            valid=result.valid,
            address=result.address,
            city=result.city,
            state=result.state
        )
    except Exception as e:
        logger.error(f"ABA lookup error: {str(e)}")
        # Return invalid response on error
        return ABALookupResponse(
            routing_number=routing_number,
            bank_name="",
            valid=False
        )


@router.get("/utils/aba-validate/{routing_number}")
async def aba_validate(routing_number: str) -> Dict[str, bool]:
    """Quick validation of routing number checksum"""
    return {"valid": validate_routing_number(routing_number)}


# ============================================================================
# Onboarding CRUD Endpoints
# ============================================================================

@router.get("/{merchant_id}/onboarding")
async def get_onboarding(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get onboarding status and data for a merchant"""
    try:
        # Verify merchant exists
        merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Get onboarding record
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            return {
                "success": True,
                "has_onboarding": False,
                "onboarding": None
            }

        return {
            "success": True,
            "has_onboarding": True,
            "onboarding": _onboarding_to_response(onboarding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get onboarding status")


@router.post("/{merchant_id}/onboarding")
async def start_onboarding(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Start onboarding process for a merchant"""
    try:
        # Verify merchant exists
        merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Check if onboarding already exists
        existing = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if existing:
            return {
                "success": True,
                "message": "Onboarding already exists",
                "onboarding": _onboarding_to_response(existing)
            }

        # Generate unique external reference ID
        ext_ref_id = f"SS-{uuid4().hex[:12].upper()}"

        # Create onboarding record with pre-filled merchant info
        onboarding = OnboardingModel(
            merchant_id=merchant_id,
            ext_ref_id=ext_ref_id,
            status='draft',
            step=1,
            completion_percentage=0,
            legal_name=merchant.name,
            dba_name=merchant.name,
            website=merchant.website,
            owners=json.dumps([]),  # Initialize empty owners array
            documents=[],
            created_at=datetime.utcnow()
        )

        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)

        return {
            "success": True,
            "message": "Onboarding started",
            "onboarding": _onboarding_to_response(onboarding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting onboarding: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to start onboarding")


@router.put("/{merchant_id}/onboarding")
async def save_onboarding(
    merchant_id: str,
    request: OnboardingSaveRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Save onboarding progress (partial or full)"""
    try:
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding not found")

        # Update step
        onboarding.step = request.step

        # Handle full essential fields update
        if request.essential_fields:
            ef = request.essential_fields

            # Business info
            onboarding.legal_name = ef.legal_name
            onboarding.dba_name = ef.dba_name
            onboarding.tax_id = ef.tax_id.replace('-', '')  # Store without dashes
            onboarding.business_type = ef.business_type
            onboarding.mcc_code = ef.mcc_code
            onboarding.website = ef.website
            onboarding.customer_service_phone = ef.customer_service_phone
            onboarding.business_street = ef.business_address.street
            onboarding.business_city = ef.business_address.city
            onboarding.business_state = ef.business_address.state
            onboarding.business_zip = ef.business_address.zip
            onboarding.business_country = ef.business_address.country

            # Owners - store as JSON
            owners_data = [
                {
                    "id": o.id or str(uuid4()),
                    "first_name": o.first_name,
                    "middle_name": o.middle_name,
                    "last_name": o.last_name,
                    "title": o.title,
                    "ssn": o.ssn,  # In production: encrypt this
                    "dob": o.dob,
                    "email": o.email,
                    "phone": o.phone,
                    "street": o.street,
                    "city": o.city,
                    "state": o.state,
                    "zip": o.zip,
                    "ownership_percent": o.ownership_percent,
                    "is_guarantor": o.is_guarantor,
                    "sequence_number": idx + 1
                }
                for idx, o in enumerate(ef.owners)
            ]
            onboarding.owners = json.dumps(owners_data)

            # Banking
            onboarding.bank_name = ef.bank_name
            onboarding.routing_number = ef.routing_number
            onboarding.account_number_encrypted = ef.account_number  # In production: encrypt
            # Store account type if column exists
            if hasattr(onboarding, 'account_type'):
                onboarding.account_type = ef.account_type

            # Processing
            onboarding.monthly_volume = ef.monthly_volume
            onboarding.avg_ticket = ef.avg_ticket
            onboarding.high_ticket = ef.high_ticket
            if hasattr(onboarding, 'processing_type'):
                onboarding.processing_type = ef.processing_type

            # Advanced options
            if ef.card_descriptor and hasattr(onboarding, 'card_descriptor'):
                onboarding.card_descriptor = ef.card_descriptor
            if ef.pricing_type and hasattr(onboarding, 'pricing_type'):
                onboarding.pricing_type = ef.pricing_type
            if ef.business_start_date and hasattr(onboarding, 'business_start_date'):
                onboarding.business_start_date = ef.business_start_date

        # Handle partial section updates
        if request.business_info:
            bi = request.business_info
            onboarding.legal_name = bi.get('legal_name', onboarding.legal_name)
            onboarding.dba_name = bi.get('dba_name', onboarding.dba_name)
            onboarding.tax_id = bi.get('tax_id', onboarding.tax_id).replace('-', '')
            onboarding.business_type = bi.get('business_type', onboarding.business_type)
            onboarding.mcc_code = bi.get('mcc_code', onboarding.mcc_code)
            onboarding.website = bi.get('website', onboarding.website)
            onboarding.customer_service_phone = bi.get('customer_service_phone', onboarding.customer_service_phone)
            if 'address' in bi:
                addr = bi['address']
                onboarding.business_street = addr.get('street', onboarding.business_street)
                onboarding.business_city = addr.get('city', onboarding.business_city)
                onboarding.business_state = addr.get('state', onboarding.business_state)
                onboarding.business_zip = addr.get('zip', onboarding.business_zip)

        if request.owners:
            onboarding.owners = json.dumps(request.owners)

        if request.bank_info:
            bi = request.bank_info
            onboarding.bank_name = bi.get('bank_name', onboarding.bank_name)
            onboarding.routing_number = bi.get('routing_number', onboarding.routing_number)
            if 'account_number' in bi:
                onboarding.account_number_encrypted = bi['account_number']
            if 'account_type' in bi and hasattr(onboarding, 'account_type'):
                onboarding.account_type = bi['account_type']

        if request.processing_info:
            pi = request.processing_info
            onboarding.monthly_volume = pi.get('monthly_volume', onboarding.monthly_volume)
            onboarding.avg_ticket = pi.get('avg_ticket', onboarding.avg_ticket)
            onboarding.high_ticket = pi.get('high_ticket', onboarding.high_ticket)
            if 'processing_type' in pi and hasattr(onboarding, 'processing_type'):
                onboarding.processing_type = pi['processing_type']

        if request.advanced_options:
            ao = request.advanced_options
            if 'card_descriptor' in ao and hasattr(onboarding, 'card_descriptor'):
                onboarding.card_descriptor = ao['card_descriptor']
            if 'pricing_type' in ao and hasattr(onboarding, 'pricing_type'):
                onboarding.pricing_type = ao['pricing_type']
            if 'business_start_date' in ao and hasattr(onboarding, 'business_start_date'):
                onboarding.business_start_date = ao['business_start_date']

        # Recalculate completion
        onboarding.completion_percentage = _calculate_completion(onboarding)
        onboarding.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(onboarding)

        return {
            "success": True,
            "message": "Onboarding saved",
            "onboarding": _onboarding_to_response(onboarding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving onboarding: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save onboarding")


@router.post("/{merchant_id}/onboarding/documents")
async def upload_document(
    merchant_id: str,
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Upload a document for onboarding"""
    try:
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding not found")

        # Read and encode file
        file_content = await file.read()
        file_base64 = base64.b64encode(file_content).decode('utf-8')

        # Add to documents list
        documents = onboarding.documents or []
        doc_id = str(uuid4())

        # Remove existing document of same type
        documents = [d for d in documents if d.get('type') != doc_type]

        documents.append({
            "id": doc_id,
            "type": doc_type,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(file_content),
            "uploaded_at": datetime.utcnow().isoformat()
        })

        onboarding.documents = documents
        onboarding.completion_percentage = _calculate_completion(onboarding)
        onboarding.updated_at = datetime.utcnow()

        # Save file to disk (in production, use S3)
        uploads_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads', 'onboarding', str(merchant_id))
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, f"{doc_id}_{file.filename}")

        with open(file_path, 'wb') as f:
            f.write(file_content)

        db.commit()
        db.refresh(onboarding)

        return {
            "success": True,
            "message": "Document uploaded",
            "document": {
                "id": doc_id,
                "type": doc_type,
                "filename": file.filename
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload document")


# ============================================================================
# Fiserv Submission Endpoints
# ============================================================================

@router.post("/{merchant_id}/onboarding/submit")
async def submit_to_fiserv(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Submit onboarding to Fiserv using field derivation service"""
    try:
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding not found")

        # Parse owners
        owners_data = onboarding.owners
        if isinstance(owners_data, str):
            owners_data = json.loads(owners_data)

        if not owners_data or len(owners_data) == 0:
            raise HTTPException(status_code=422, detail="At least one owner is required")

        # Validate required fields
        required = ['legal_name', 'tax_id', 'business_type', 'mcc_code',
                    'bank_name', 'routing_number', 'account_number_encrypted']
        missing = [f for f in required if not getattr(onboarding, f, None)]
        if missing:
            raise HTTPException(status_code=422, detail=f"Missing required fields: {', '.join(missing)}")

        # Build essential fields for derivation service
        essential = EssentialFields(
            legal_name=onboarding.legal_name,
            dba_name=onboarding.dba_name or onboarding.legal_name,
            tax_id=onboarding.tax_id,
            entity_type=onboarding.business_type,
            mcc_code=onboarding.mcc_code,
            website=onboarding.website or "",
            customer_service_phone=onboarding.customer_service_phone or "",
            business_street=onboarding.business_street or "",
            business_city=onboarding.business_city or "",
            business_state=onboarding.business_state or "",
            business_zip=onboarding.business_zip or "",
            owners=[
                OwnerInfo(
                    first_name=o['first_name'],
                    middle_name=o.get('middle_name', ''),
                    last_name=o['last_name'],
                    title=o.get('title', 'Owner'),
                    ssn=o['ssn'].replace('-', ''),
                    dob=o['dob'],
                    email=o['email'],
                    phone=o['phone'],
                    street=o.get('street', ''),
                    city=o.get('city', ''),
                    state=o.get('state', ''),
                    zip=o.get('zip', ''),
                    ownership_percent=float(o.get('ownership_percent', 100)),
                    is_guarantor=o.get('is_guarantor', True),
                    sequence_number=o.get('sequence_number', 1)
                )
                for o in owners_data
            ],
            bank_name=onboarding.bank_name,
            routing_number=onboarding.routing_number,
            account_number=onboarding.account_number_encrypted,
            account_type=getattr(onboarding, 'account_type', 'C'),
            monthly_volume=float(onboarding.monthly_volume or 0),
            avg_ticket=float(onboarding.avg_ticket or 0),
            high_ticket=float(onboarding.high_ticket or 0),
            processing_type=getattr(onboarding, 'processing_type', 'RETAIL'),
            card_descriptor=getattr(onboarding, 'card_descriptor', None),
            business_start_date=getattr(onboarding, 'business_start_date', None)
        )

        # Derive all fields
        derivation_service = FieldDerivationService()
        derived_fields = derivation_service.derive_all_fields(essential)

        # Create Fiserv service
        fiserv = create_fiserv_service()
        if not fiserv:
            # Mock response for development without Fiserv credentials
            onboarding.status = 'submitted'
            onboarding.fiserv_status = 'Submitted (Mock)'
            onboarding.mpa_id = f"MOCK-{uuid4().hex[:8].upper()}"
            onboarding.submitted_at = datetime.utcnow()
            db.commit()
            db.refresh(onboarding)

            return {
                "success": True,
                "message": "Submitted (mock mode - Fiserv credentials not configured)",
                "onboarding": _onboarding_to_response(onboarding)
            }

        # Build MPA XML using derived fields
        xml_content = MPAXmlBuilder.build_mpa_xml(derived_fields)

        # Submit to Fiserv
        result = await fiserv.submit_mpa(
            xml_content=xml_content,
            ext_ref_id=onboarding.ext_ref_id
        )

        if result.success:
            onboarding.status = 'submitted'
            onboarding.fiserv_status = result.status
            onboarding.mpa_id = result.mpa_id
            onboarding.north_number = result.north_number
            onboarding.submitted_at = datetime.utcnow()
        else:
            onboarding.fiserv_status = 'Error'
            onboarding.fiserv_status_message = result.error_message

        db.commit()
        db.refresh(onboarding)

        return {
            "success": result.success,
            "message": "Submission successful" if result.success else result.error_message,
            "onboarding": _onboarding_to_response(onboarding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting to Fiserv: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit to Fiserv: {str(e)}")


@router.get("/{merchant_id}/onboarding/status")
async def check_fiserv_status(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Check current status with Fiserv"""
    try:
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding not found")

        if not onboarding.mpa_id:
            return {
                "success": True,
                "message": "Onboarding not yet submitted",
                "status": onboarding.status
            }

        fiserv = create_fiserv_service()
        if not fiserv:
            return {
                "success": True,
                "message": "Fiserv service not configured",
                "status": onboarding.status,
                "fiserv_status": onboarding.fiserv_status
            }

        # Query Fiserv for status
        result = await fiserv.get_status_by_mpa_id(
            mpa_id=onboarding.mpa_id,
            ext_ref_id=onboarding.ext_ref_id
        )

        if result.success:
            # Update local status
            onboarding.fiserv_status = result.status
            onboarding.fiserv_status_message = result.status_message
            onboarding.last_status_check = datetime.utcnow()

            # Map Fiserv status to our status
            if result.status == 'Approved':
                onboarding.status = 'approved'
                onboarding.approved_at = datetime.utcnow()
            elif result.status == 'Rejected':
                onboarding.status = 'rejected'
                onboarding.rejected_at = datetime.utcnow()
            elif 'Credit' in (result.status or ''):
                onboarding.status = 'pending_credit'
            elif 'BOS' in (result.status or ''):
                onboarding.status = 'pending_bos'

            if result.north_number:
                onboarding.north_number = result.north_number

            db.commit()
            db.refresh(onboarding)

        return {
            "success": result.success,
            "status": onboarding.status,
            "fiserv_status": result.status if result.success else onboarding.fiserv_status,
            "fiserv_message": result.status_message if result.success else result.error_message,
            "onboarding": _onboarding_to_response(onboarding)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking Fiserv status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check status")


@router.delete("/{merchant_id}/onboarding")
async def delete_onboarding(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete onboarding record (only if in draft status)"""
    try:
        onboarding = db.query(OnboardingModel).filter(
            OnboardingModel.merchant_id == merchant_id
        ).first()

        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding not found")

        if onboarding.status != 'draft':
            raise HTTPException(
                status_code=422,
                detail="Cannot delete onboarding that has been submitted"
            )

        db.delete(onboarding)
        db.commit()

        return {
            "success": True,
            "message": "Onboarding deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting onboarding: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete onboarding")
