"""
Admin Charity Management Routes

Provides CRUD operations for charity onboarding management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from app.database import get_db
from app.models import Charity

router = APIRouter(tags=["Admin Charities"])


# ============================================
# Pydantic Models
# ============================================

class CharityCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    category: str
    registration_number: Optional[str] = None
    country: Optional[str] = "United States"
    website: Optional[str] = None
    notes: Optional[str] = None


class CharityUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    registration_number: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = None
    documents_submitted: Optional[int] = None
    completion_percentage: Optional[int] = None
    notes: Optional[str] = None


class CharityResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    category: str
    registrationNumber: Optional[str]
    country: str
    website: Optional[str]
    documentsSubmitted: int
    status: str
    completionPercentage: int
    notes: Optional[str]
    submittedAt: str
    approvedAt: Optional[str]

    class Config:
        from_attributes = True


def charity_to_response(charity: Charity) -> Dict[str, Any]:
    """Convert Charity model to response dict with camelCase keys."""
    return {
        "id": str(charity.id),
        "name": charity.name,
        "email": charity.email,
        "phone": charity.phone,
        "category": charity.category,
        "registrationNumber": charity.registration_number,
        "country": charity.country or "United States",
        "website": charity.website,
        "documentsSubmitted": charity.documents_submitted or 0,
        "status": charity.status or "incomplete",
        "completionPercentage": charity.completion_percentage or 0,
        "notes": charity.notes,
        "submittedAt": charity.submitted_at.strftime("%Y-%m-%d") if charity.submitted_at else datetime.utcnow().strftime("%Y-%m-%d"),
        "approvedAt": charity.approved_at.strftime("%Y-%m-%d") if charity.approved_at else None,
    }


# ============================================
# Routes
# ============================================

@router.get("/charities")
async def list_charities(
    q: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """List all charities with optional filtering."""
    query = db.query(Charity)

    # Apply search filter
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Charity.name.ilike(search),
                Charity.email.ilike(search),
                Charity.registration_number.ilike(search)
            )
        )

    # Apply status filter
    if status and status != "all":
        query = query.filter(Charity.status == status)

    # Apply category filter
    if category and category != "all":
        query = query.filter(Charity.category == category)

    # Order by created_at descending
    query = query.order_by(Charity.created_at.desc())

    # Apply pagination
    charities = query.offset(offset).limit(limit).all()

    return [charity_to_response(c) for c in charities]


@router.get("/charities/{charity_id}")
async def get_charity(
    charity_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a single charity by ID."""
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    return charity_to_response(charity)


@router.post("/charities")
async def create_charity(
    request: CharityCreate,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new charity."""
    # Check for duplicate email
    existing = db.query(Charity).filter(Charity.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A charity with this email already exists")

    # Check for duplicate registration number if provided
    if request.registration_number:
        existing_reg = db.query(Charity).filter(
            Charity.registration_number == request.registration_number
        ).first()
        if existing_reg:
            raise HTTPException(status_code=400, detail="A charity with this registration number already exists")

    charity = Charity(
        name=request.name,
        email=request.email,
        phone=request.phone,
        category=request.category,
        registration_number=request.registration_number,
        country=request.country or "United States",
        website=request.website,
        notes=request.notes,
        status="incomplete",
        documents_submitted=0,
        completion_percentage=0,
        submitted_at=datetime.utcnow(),
    )

    db.add(charity)
    db.commit()
    db.refresh(charity)

    return {
        "success": True,
        "message": f"Charity '{charity.name}' created successfully",
        "charity": charity_to_response(charity)
    }


@router.put("/charities/{charity_id}")
async def update_charity(
    charity_id: str,
    request: CharityUpdate,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update an existing charity."""
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")

    # Update fields if provided
    update_data = request.model_dump(exclude_unset=True)

    # Map camelCase to snake_case for certain fields
    field_mapping = {
        "registration_number": "registration_number",
        "documents_submitted": "documents_submitted",
        "completion_percentage": "completion_percentage",
    }

    for field, value in update_data.items():
        if hasattr(charity, field) and value is not None:
            setattr(charity, field, value)

    # Handle status change to approved
    if request.status == "approved" and charity.approved_at is None:
        charity.approved_at = datetime.utcnow()

    charity.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(charity)

    return {
        "success": True,
        "message": f"Charity '{charity.name}' updated successfully",
        "charity": charity_to_response(charity)
    }


@router.delete("/charities/{charity_id}")
async def delete_charity(
    charity_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete a charity."""
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")

    charity_name = charity.name
    db.delete(charity)
    db.commit()

    return {
        "success": True,
        "message": f"Charity '{charity_name}' deleted successfully"
    }


@router.post("/charities/{charity_id}/approve")
async def approve_charity(
    charity_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Approve a charity application."""
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")

    charity.status = "approved"
    charity.approved_at = datetime.utcnow()
    charity.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(charity)

    return {
        "success": True,
        "message": f"Charity '{charity.name}' approved successfully",
        "charity": charity_to_response(charity)
    }


@router.post("/charities/{charity_id}/reject")
async def reject_charity(
    charity_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Reject a charity application."""
    charity = db.query(Charity).filter(Charity.id == charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")

    charity.status = "rejected"
    if notes:
        charity.notes = notes
    charity.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(charity)

    return {
        "success": True,
        "message": f"Charity '{charity.name}' rejected",
        "charity": charity_to_response(charity)
    }
