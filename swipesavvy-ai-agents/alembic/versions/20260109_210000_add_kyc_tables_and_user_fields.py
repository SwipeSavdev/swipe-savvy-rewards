"""Add KYC tables and user fields

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2026-01-09 21:00:00.000000

This migration adds:
- KYC fields to the users table (first_name, last_name, DOB, address, SSN, etc.)
- Email and phone verification fields
- Password reset fields
- Security tracking fields
- user_kyc_documents table for document uploads
- user_kyc_history table for audit trail
- ofac_screening_results table for sanctions screening
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b7c8d9e0f1a2'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add KYC fields and tables."""

    # ==========================================
    # Add KYC columns to users table
    # ==========================================

    # Personal information
    op.add_column('users', sa.Column('first_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('date_of_birth', sa.Date(), nullable=True))

    # Address information
    op.add_column('users', sa.Column('address_line1', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('address_line2', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('postal_code', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(100), nullable=True, server_default='US'))

    # KYC tier and status
    op.add_column('users', sa.Column('kyc_tier', sa.String(20), nullable=False, server_default='tier1'))
    op.add_column('users', sa.Column('kyc_status', sa.String(50), nullable=False, server_default='pending'))
    op.add_column('users', sa.Column('kyc_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('kyc_expires_at', sa.DateTime(), nullable=True))

    # SSN (stored securely)
    op.add_column('users', sa.Column('ssn_last4', sa.String(4), nullable=True))
    op.add_column('users', sa.Column('ssn_hash', sa.String(255), nullable=True))

    # Email verification
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('email_verification_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True))

    # Phone verification
    op.add_column('users', sa.Column('phone_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('phone_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('phone_verification_code', sa.String(10), nullable=True))
    op.add_column('users', sa.Column('phone_verification_sent_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('phone_verification_attempts', sa.Integer(), nullable=False, server_default='0'))

    # Password reset
    op.add_column('users', sa.Column('password_reset_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('password_changed_at', sa.DateTime(), nullable=True))

    # Identity verification
    op.add_column('users', sa.Column('identity_verification_id', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('identity_verification_status', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('identity_verified_at', sa.DateTime(), nullable=True))

    # Security tracking
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('last_ip_address', sa.String(45), nullable=True))
    op.add_column('users', sa.Column('last_user_agent', sa.String(500), nullable=True))

    # Refresh token
    op.add_column('users', sa.Column('refresh_token', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('refresh_token_expires', sa.DateTime(), nullable=True))

    # Create indexes for new columns
    op.create_index('ix_users_kyc_tier', 'users', ['kyc_tier'])
    op.create_index('ix_users_kyc_status', 'users', ['kyc_status'])
    op.create_index('ix_users_phone', 'users', ['phone'])

    # ==========================================
    # Create user_kyc_documents table
    # ==========================================

    op.create_table('user_kyc_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', sa.String(50), nullable=False),
        sa.Column('document_subtype', sa.String(50), nullable=True),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('checksum', sa.String(64), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('extracted_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint(
            "document_type IN ('drivers_license', 'passport', 'state_id', 'ssn_card', 'utility_bill', 'bank_statement', 'selfie')",
            name='ck_kyc_documents_document_type'
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'expired')",
            name='ck_kyc_documents_status'
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_kyc_documents_user_id', 'user_kyc_documents', ['user_id'])
    op.create_index('ix_user_kyc_documents_document_type', 'user_kyc_documents', ['document_type'])
    op.create_index('ix_user_kyc_documents_status', 'user_kyc_documents', ['status'])
    op.create_index('ix_user_kyc_documents_created_at', 'user_kyc_documents', ['created_at'])

    # ==========================================
    # Create user_kyc_history table
    # ==========================================

    op.create_table('user_kyc_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('previous_tier', sa.String(20), nullable=True),
        sa.Column('new_tier', sa.String(20), nullable=True),
        sa.Column('previous_status', sa.String(50), nullable=True),
        sa.Column('new_status', sa.String(50), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('performed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['performed_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_kyc_history_user_id', 'user_kyc_history', ['user_id'])
    op.create_index('ix_user_kyc_history_action', 'user_kyc_history', ['action'])
    op.create_index('ix_user_kyc_history_created_at', 'user_kyc_history', ['created_at'])

    # ==========================================
    # Create ofac_screening_results table
    # ==========================================

    op.create_table('ofac_screening_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('screening_type', sa.String(50), nullable=False, server_default='ofac'),
        sa.Column('provider', sa.String(100), nullable=True),
        sa.Column('provider_reference', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('risk_level', sa.String(20), nullable=True),
        sa.Column('matches', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('screened_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('raw_response', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint(
            "screening_type IN ('ofac', 'pep', 'sanctions', 'adverse_media')",
            name='ck_ofac_screening_screening_type'
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'clear', 'match', 'false_positive', 'blocked')",
            name='ck_ofac_screening_status'
        ),
        sa.CheckConstraint(
            "risk_level IN ('low', 'medium', 'high', 'critical')",
            name='ck_ofac_screening_risk_level'
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ofac_screening_results_user_id', 'ofac_screening_results', ['user_id'])
    op.create_index('ix_ofac_screening_results_status', 'ofac_screening_results', ['status'])
    op.create_index('ix_ofac_screening_results_risk_level', 'ofac_screening_results', ['risk_level'])
    op.create_index('ix_ofac_screening_results_created_at', 'ofac_screening_results', ['created_at'])


def downgrade() -> None:
    """Remove KYC tables and user fields."""

    # Drop OFAC screening results table
    op.drop_table('ofac_screening_results')

    # Drop KYC history table
    op.drop_table('user_kyc_history')

    # Drop KYC documents table
    op.drop_table('user_kyc_documents')

    # Drop indexes from users table
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_index('ix_users_kyc_status', table_name='users')
    op.drop_index('ix_users_kyc_tier', table_name='users')

    # Drop columns from users table (in reverse order)
    op.drop_column('users', 'refresh_token_expires')
    op.drop_column('users', 'refresh_token')
    op.drop_column('users', 'last_user_agent')
    op.drop_column('users', 'last_ip_address')
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'identity_verified_at')
    op.drop_column('users', 'identity_verification_status')
    op.drop_column('users', 'identity_verification_id')
    op.drop_column('users', 'password_changed_at')
    op.drop_column('users', 'password_reset_expires')
    op.drop_column('users', 'password_reset_token')
    op.drop_column('users', 'phone_verification_attempts')
    op.drop_column('users', 'phone_verification_sent_at')
    op.drop_column('users', 'phone_verification_code')
    op.drop_column('users', 'phone_verified_at')
    op.drop_column('users', 'phone_verified')
    op.drop_column('users', 'email_verification_sent_at')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'ssn_hash')
    op.drop_column('users', 'ssn_last4')
    op.drop_column('users', 'kyc_expires_at')
    op.drop_column('users', 'kyc_verified_at')
    op.drop_column('users', 'kyc_status')
    op.drop_column('users', 'kyc_tier')
    op.drop_column('users', 'country')
    op.drop_column('users', 'postal_code')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address_line2')
    op.drop_column('users', 'address_line1')
    op.drop_column('users', 'date_of_birth')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
