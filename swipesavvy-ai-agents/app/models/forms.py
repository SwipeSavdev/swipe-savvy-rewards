"""
Database models for form submissions (contact forms and demo requests).
"""

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.database import Base


class ContactFormSubmission(Base):
    """
    Stores contact form submissions from the marketing website.
    """
    __tablename__ = "contact_form_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)

    # Metadata
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)

    # Status tracking
    status = Column(String(50), default='pending', index=True)  # pending, contacted, resolved, spam
    assigned_to = Column(UUID(as_uuid=True), nullable=True)  # Admin user who handled this
    notes = Column(Text, nullable=True)  # Internal notes

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    contacted_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<ContactFormSubmission(email={self.email}, status={self.status})>"


class DemoRequestSubmission(Base):
    """
    Stores demo request submissions from potential customers.
    """
    __tablename__ = "demo_request_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=True)
    company_size = Column(String(50), nullable=True)  # 1-10, 11-50, 51-200, 201+
    industry = Column(String(100), nullable=True)

    # Metadata
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)

    # Status tracking
    status = Column(String(50), default='pending', index=True)  # pending, scheduled, completed, cancelled
    assigned_to = Column(UUID(as_uuid=True), nullable=True)  # Sales rep assigned
    demo_scheduled_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)  # Internal notes

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    contacted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<DemoRequestSubmission(company={self.company}, status={self.status})>"
