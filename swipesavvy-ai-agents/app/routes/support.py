"""
Support System Routes

Handles all support ticket operations, customer verification, escalation,
and ticket management for the support system.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/support", tags=["support"])

# Database connection configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}


def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection failed")


# Pydantic Models
class CustomerInfo(BaseModel):
    """Customer information"""
    customer_id: str
    email: str
    phone: str
    full_name: str


class TicketMessage(BaseModel):
    """Message in a support ticket"""
    message_id: str
    sender_id: str
    sender_type: str  # 'customer', 'agent', 'system'
    message_content: str
    attachments: Optional[List[str]] = None
    created_at: datetime


class CreateTicketRequest(BaseModel):
    """Request to create a new support ticket"""
    customer_id: str
    category: str  # 'billing', 'technical', 'general', 'complaint', 'feature_request'
    subject: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10, max_length=5000)
    priority: str = "medium"  # 'low', 'medium', 'high', 'critical'
    attachments: Optional[List[str]] = None


class UpdateTicketRequest(BaseModel):
    """Request to update a ticket"""
    status: Optional[str] = None  # 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None


class EscalateTicketRequest(BaseModel):
    """Request to escalate a ticket"""
    reason: str
    escalation_level: str  # 'level_2', 'level_3', 'manager'
    notes: Optional[str] = None


class AddMessageRequest(BaseModel):
    """Request to add a message to a ticket"""
    message_content: str = Field(..., min_length=1, max_length=5000)
    attachments: Optional[List[str]] = None
    sender_type: str = "customer"


class CustomerVerificationRequest(BaseModel):
    """Request to verify customer identity"""
    customer_id: str
    email: str
    phone: str
    security_answers: Optional[dict] = None


# Support Ticket Routes
@router.post("/tickets")
async def create_support_ticket(
    request: CreateTicketRequest,
    conn=Depends(get_db_connection)
):
    """
    Create a new support ticket
    
    Returns: Ticket details with ticket_id
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Create the ticket
        query = """
        INSERT INTO support_tickets 
        (customer_id, category, subject, description, priority, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING ticket_id, customer_id, category, subject, status, priority, created_at
        """
        
        cursor.execute(query, (
            request.customer_id,
            request.category,
            request.subject,
            request.description,
            request.priority,
            'open',
            datetime.utcnow()
        ))
        
        ticket = cursor.fetchone()
        conn.commit()
        
        # If there are attachments, save them
        if request.attachments:
            for attachment in request.attachments:
                attach_query = """
                INSERT INTO ticket_attachments (ticket_id, attachment_url)
                VALUES (%s, %s)
                """
                cursor.execute(attach_query, (ticket['ticket_id'], attachment))
            conn.commit()
        
        return {
            "status": "success",
            "ticket_id": ticket['ticket_id'],
            "ticket": dict(ticket)
        }
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    finally:
        cursor.close()
        conn.close()


@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    conn=Depends(get_db_connection)
):
    """
    Get ticket details with all messages and attachments
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get ticket
        query = """
        SELECT * FROM support_tickets WHERE ticket_id = %s
        """
        cursor.execute(query, (ticket_id,))
        ticket = cursor.fetchone()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        # Get messages
        messages_query = """
        SELECT * FROM ticket_messages 
        WHERE ticket_id = %s
        ORDER BY created_at ASC
        """
        cursor.execute(messages_query, (ticket_id,))
        messages = cursor.fetchall()
        
        # Get attachments
        attachments_query = """
        SELECT * FROM ticket_attachments WHERE ticket_id = %s
        """
        cursor.execute(attachments_query, (ticket_id,))
        attachments = cursor.fetchall()
        
        return {
            "status": "success",
            "ticket": dict(ticket),
            "messages": [dict(m) for m in messages],
            "attachments": [dict(a) for a in attachments]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ticket")
    finally:
        cursor.close()
        conn.close()


@router.get("/tickets")
async def list_tickets(
    customer_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    conn=Depends(get_db_connection)
):
    """
    List support tickets with optional filtering
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build query
        query = "SELECT * FROM support_tickets WHERE 1=1"
        params = []
        
        if customer_id:
            query += " AND customer_id = %s"
            params.append(customer_id)
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, skip])
        
        cursor.execute(query, params)
        tickets = cursor.fetchall()
        
        # Get count
        count_query = "SELECT COUNT(*) as total FROM support_tickets WHERE 1=1"
        if customer_id:
            count_query += " AND customer_id = %s"
        if status:
            count_query += " AND status = %s"
        
        count_params = []
        if customer_id:
            count_params.append(customer_id)
        if status:
            count_params.append(status)
        
        cursor.execute(count_query, count_params)
        total = cursor.fetchone()['total']
        
        return {
            "status": "success",
            "tickets": [dict(t) for t in tickets],
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    except Exception as e:
        logger.error(f"Error listing tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list tickets")
    finally:
        cursor.close()
        conn.close()


@router.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    request: UpdateTicketRequest,
    conn=Depends(get_db_connection)
):
    """
    Update ticket status, priority, assignment, or resolution notes
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build update query
        updates = []
        params = []
        
        if request.status:
            updates.append("status = %s")
            params.append(request.status)
        
        if request.priority:
            updates.append("priority = %s")
            params.append(request.priority)
        
        if request.assigned_to:
            updates.append("assigned_to = %s")
            params.append(request.assigned_to)
        
        if request.resolution_notes:
            updates.append("resolution_notes = %s")
            params.append(request.resolution_notes)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        updates.append("updated_at = %s")
        params.append(datetime.utcnow())
        params.append(ticket_id)
        
        query = f"UPDATE support_tickets SET {', '.join(updates)} WHERE ticket_id = %s RETURNING *"
        cursor.execute(query, params)
        updated_ticket = cursor.fetchone()
        
        if not updated_ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        conn.commit()
        
        return {
            "status": "success",
            "ticket": dict(updated_ticket)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")
    finally:
        cursor.close()
        conn.close()


@router.post("/tickets/{ticket_id}/escalate")
async def escalate_ticket(
    ticket_id: str,
    request: EscalateTicketRequest,
    conn=Depends(get_db_connection)
):
    """
    Escalate a support ticket to higher level
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Record escalation
        escalation_query = """
        INSERT INTO escalation_rules (ticket_id, escalation_level, reason, created_at)
        VALUES (%s, %s, %s, %s)
        RETURNING *
        """
        
        cursor.execute(escalation_query, (
            ticket_id,
            request.escalation_level,
            request.reason,
            datetime.utcnow()
        ))
        
        escalation = cursor.fetchone()
        
        # Update ticket status
        update_query = """
        UPDATE support_tickets 
        SET status = %s, escalation_level = %s, updated_at = %s
        WHERE ticket_id = %s
        RETURNING *
        """
        
        cursor.execute(update_query, (
            'escalated',
            request.escalation_level,
            datetime.utcnow(),
            ticket_id
        ))
        
        updated_ticket = cursor.fetchone()
        conn.commit()
        
        return {
            "status": "success",
            "escalation": dict(escalation),
            "ticket": dict(updated_ticket)
        }
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Error escalating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to escalate ticket")
    finally:
        cursor.close()
        conn.close()


@router.post("/tickets/{ticket_id}/messages")
async def add_ticket_message(
    ticket_id: str,
    request: AddMessageRequest,
    conn=Depends(get_db_connection)
):
    """
    Add a message to a support ticket
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Add message
        query = """
        INSERT INTO ticket_messages 
        (ticket_id, sender_id, sender_type, message_content, created_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """
        
        cursor.execute(query, (
            ticket_id,
            'system',  # Will be replaced with actual sender_id from auth
            request.sender_type,
            request.message_content,
            datetime.utcnow()
        ))
        
        message = cursor.fetchone()
        
        # Update ticket's updated_at
        update_query = "UPDATE support_tickets SET updated_at = %s WHERE ticket_id = %s"
        cursor.execute(update_query, (datetime.utcnow(), ticket_id))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": dict(message)
        }
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Error adding message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add message")
    finally:
        cursor.close()
        conn.close()


@router.post("/verify-customer")
async def verify_customer(
    request: CustomerVerificationRequest,
    conn=Depends(get_db_connection)
):
    """
    Verify customer identity for account access
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Fetch customer
        query = "SELECT * FROM customers WHERE customer_id = %s"
        cursor.execute(query, (request.customer_id,))
        customer = cursor.fetchone()
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Verify email and phone match
        if customer['email'].lower() != request.email.lower():
            raise HTTPException(status_code=401, detail="Email verification failed")
        
        if customer['phone'] != request.phone:
            raise HTTPException(status_code=401, detail="Phone verification failed")
        
        # Generate verification token (in production, use JWT)
        verification_query = """
        INSERT INTO verification_codes (customer_id, verification_code, expires_at, created_at)
        VALUES (%s, %s, %s, %s)
        RETURNING verification_code
        """
        
        verification_code = os.urandom(16).hex()[:8].upper()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        cursor.execute(verification_query, (
            request.customer_id,
            verification_code,
            expires_at,
            datetime.utcnow()
        ))
        
        conn.commit()
        
        return {
            "status": "success",
            "verified": True,
            "customer_id": request.customer_id,
            "verification_code": verification_code,
            "message": "Customer verified successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error verifying customer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify customer")
    finally:
        cursor.close()
        conn.close()


@router.get("/dashboard/metrics")
async def get_dashboard_metrics(
    conn=Depends(get_db_connection)
):
    """
    Get support dashboard metrics
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Total tickets
        cursor.execute("SELECT COUNT(*) as total FROM support_tickets")
        total_tickets = cursor.fetchone()['total']
        
        # Open tickets
        cursor.execute("SELECT COUNT(*) as total FROM support_tickets WHERE status = 'open'")
        open_tickets = cursor.fetchone()['total']
        
        # In progress
        cursor.execute("SELECT COUNT(*) as total FROM support_tickets WHERE status = 'in_progress'")
        in_progress = cursor.fetchone()['total']
        
        # Resolved
        cursor.execute("SELECT COUNT(*) as total FROM support_tickets WHERE status = 'resolved'")
        resolved = cursor.fetchone()['total']
        
        # Average response time (in hours)
        cursor.execute("""
        SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
        FROM support_tickets
        WHERE updated_at IS NOT NULL
        """)
        avg_response_time = cursor.fetchone()['avg_hours'] or 0
        
        # Critical/High priority open
        cursor.execute("""
        SELECT COUNT(*) as total FROM support_tickets 
        WHERE status IN ('open', 'in_progress') AND priority IN ('critical', 'high')
        """)
        high_priority_open = cursor.fetchone()['total']
        
        return {
            "status": "success",
            "metrics": {
                "total_tickets": total_tickets,
                "open_tickets": open_tickets,
                "in_progress": in_progress,
                "resolved": resolved,
                "average_response_time_hours": round(avg_response_time, 2),
                "high_priority_open": high_priority_open
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch metrics")
    finally:
        cursor.close()
        conn.close()
