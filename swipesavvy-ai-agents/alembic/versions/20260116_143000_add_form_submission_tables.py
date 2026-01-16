"""add_form_submission_tables

Revision ID: f9g8h7i6j5k4
Revises: add_kyc_tables_and_user_fields
Create Date: 2026-01-16 14:30:00.000000

Adds tables for contact form and demo request submissions.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f9g8h7i6j5k4'
down_revision = 'add_kyc_tables_and_user_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create contact_form_submissions table
    op.create_table(
        'contact_form_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('subject', sa.String(255), nullable=True),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('referrer', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending', index=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('contacted_at', sa.DateTime, nullable=True),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
    )

    # Create demo_request_submissions table
    op.create_table(
        'demo_request_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('company', sa.String(200), nullable=False),
        sa.Column('phone', sa.String(20), nullable=False),
        sa.Column('message', sa.Text, nullable=True),
        sa.Column('company_size', sa.String(50), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('referrer', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending', index=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('demo_scheduled_at', sa.DateTime, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('contacted_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table('demo_request_submissions')
    op.drop_table('contact_form_submissions')
