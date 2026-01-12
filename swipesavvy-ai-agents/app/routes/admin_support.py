"""
Admin Portal - Support Tickets Management Routes

Endpoints for managing support tickets in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models import SupportTicket as SupportTicketModel, AdminUser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-support"])

# Error message constants
SUPPORT_TICKET_NOT_FOUND = "Support ticket not found"

class SupportTicketResponse(BaseModel):
    id: str
    subject: str
    description: Optional[str]
    status: str
    priority: str
    customerName: str
    customerEmail: str
    category: Optional[str]
    createdAt: Optional[str]
    updatedAt: Optional[str]
    assignedTo: Optional[str]

class TicketsListResponse(BaseModel):
    tickets: List[SupportTicketResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CreateTicketRequest(BaseModel):
    subject: str
    description: Optional[str] = None
    customer_name: str
    customer_email: str
    priority: str = "medium"
    category: str = "general"
    status: str = "open"


@router.post("/support/tickets")
async def create_support_ticket(
    request: CreateTicketRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new support ticket"""
    try:
        # Validate priority
        valid_priorities = ['low', 'medium', 'high', 'critical']
        priority = request.priority if request.priority in valid_priorities else 'medium'

        # Validate status
        valid_statuses = ['open', 'in_progress', 'closed', 'reopened']
        status = request.status if request.status in valid_statuses else 'open'

        # Create ticket
        ticket = SupportTicketModel(
            subject=request.subject,
            description=request.description,
            customer_name=request.customer_name,
            customer_email=request.customer_email,
            priority=priority,
            category=request.category,
            status=status,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(f"Created support ticket: {ticket.id}")

        return {
            "success": True,
            "message": "Ticket created successfully",
            "ticket": SupportTicketResponse(
                id=str(ticket.id),
                subject=ticket.subject,
                description=ticket.description,
                status=ticket.status,
                priority=ticket.priority,
                customerName=ticket.customer_name,
                customerEmail=ticket.customer_email,
                category=ticket.category,
                createdAt=ticket.created_at.isoformat() if ticket.created_at else None,
                updatedAt=ticket.updated_at.isoformat() if ticket.updated_at else None,
                assignedTo=None
            )
        }
    except Exception as e:
        logger.error(f"Error creating support ticket: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create support ticket: {str(e)}")


@router.get("/support/tickets")
async def list_support_tickets(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all support tickets with pagination and filtering
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 100)
    - status: Filter by status (open, in_progress, closed)
    - priority: Filter by priority (low, medium, high, critical)
    - search: Search by title or customer name
    """
    try:
        query = db.query(SupportTicketModel)
        
        if status:
            query = query.filter(SupportTicketModel.status == status)
        
        if priority:
            query = query.filter(SupportTicketModel.priority == priority)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (SupportTicketModel.subject.ilike(search_pattern)) |
                (SupportTicketModel.customer_name.ilike(search_pattern))
            )
        
        total = query.count()
        total_pages = (total + per_page - 1) // per_page
        
        tickets = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "tickets": [
                SupportTicketResponse(
                    id=str(t.id),
                    subject=t.subject,
                    description=t.description,
                    status=t.status,
                    priority=t.priority,
                    customerName=t.customer_name,
                    customerEmail=t.customer_email,
                    category=t.category,
                    createdAt=t.created_at.isoformat() if t.created_at else None,
                    updatedAt=t.updated_at.isoformat() if t.updated_at else None,
                    assignedTo=str(t.assigned_to) if t.assigned_to else None
                )
                for t in tickets
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing support tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list support tickets")


@router.get("/support/tickets/{ticket_id}")
async def get_support_ticket(ticket_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get a specific support ticket by ID"""
    try:
        ticket = db.query(SupportTicketModel).filter(SupportTicketModel.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail=SUPPORT_TICKET_NOT_FOUND)
        
        return {
            "success": True,
            "ticket": SupportTicketResponse(
                id=str(ticket.id),
                subject=ticket.subject,
                description=ticket.description,
                status=ticket.status,
                priority=ticket.priority,
                customerName=ticket.customer_name,
                customerEmail=ticket.customer_email,
                category=ticket.category,
                createdAt=ticket.created_at.isoformat() if ticket.created_at else None,
                updatedAt=ticket.updated_at.isoformat() if ticket.updated_at else None,
                assignedTo=str(ticket.assigned_to) if ticket.assigned_to else None
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting support ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get support ticket")


@router.put("/support/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update support ticket status"""
    try:
        ticket = db.query(SupportTicketModel).filter(SupportTicketModel.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail=SUPPORT_TICKET_NOT_FOUND)
        
        valid_statuses = ['open', 'in_progress', 'closed', 'reopened']
        if status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        ticket.status = status
        ticket.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(ticket)
        
        return {
            "success": True,
            "message": f"Ticket status updated to {status}",
            "ticket": SupportTicketResponse(
                id=str(ticket.id),
                subject=ticket.subject,
                description=ticket.description,
                status=ticket.status,
                priority=ticket.priority,
                customerName=ticket.customer_name,
                customerEmail=ticket.customer_email,
                category=ticket.category,
                createdAt=ticket.created_at.isoformat() if ticket.created_at else None,
                updatedAt=ticket.updated_at.isoformat() if ticket.updated_at else None,
                assignedTo=str(ticket.assigned_to) if ticket.assigned_to else None
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating ticket status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update ticket status")


@router.post("/support/tickets/{ticket_id}/assign")
async def assign_ticket(ticket_id: str, agent_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Assign ticket to an agent"""
    try:
        ticket = db.query(SupportTicketModel).filter(SupportTicketModel.id == ticket_id).first()
        if not ticket:
            raise HTTPException(status_code=404, detail=SUPPORT_TICKET_NOT_FOUND)
        
        # Verify agent exists
        agent = db.query(AdminUser).filter(AdminUser.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        ticket.assigned_to = agent_id
        ticket.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(ticket)
        
        return {
            "success": True,
            "message": f"Ticket assigned to agent {agent.full_name}",
            "ticket": SupportTicketResponse(
                id=str(ticket.id),
                subject=ticket.subject,
                description=ticket.description,
                status=ticket.status,
                priority=ticket.priority,
                customerName=ticket.customer_name,
                customerEmail=ticket.customer_email,
                category=ticket.category,
                createdAt=ticket.created_at.isoformat() if ticket.created_at else None,
                updatedAt=ticket.updated_at.isoformat() if ticket.updated_at else None,
                assignedTo=str(ticket.assigned_to) if ticket.assigned_to else None
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to assign ticket")


@router.get("/support/stats")
async def get_support_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get support statistics"""
    try:
        tickets = db.query(SupportTicketModel).all()
        
        open_tickets = sum(1 for t in tickets if t.status == 'open')
        in_progress = sum(1 for t in tickets if t.status == 'in_progress')
        closed_tickets = sum(1 for t in tickets if t.status == 'closed')
        critical = sum(1 for t in tickets if t.priority == 'critical')
        
        return {
            "total_tickets": len(tickets),
            "open_tickets": open_tickets,
            "in_progress_tickets": in_progress,
            "closed_tickets": closed_tickets,
            "critical_tickets": critical,
            "avg_response_time": "2.5 hours",
            "avg_resolution_time": "24 hours"
        }
    except Exception as e:
        logger.error(f"Error getting support stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get support stats")
