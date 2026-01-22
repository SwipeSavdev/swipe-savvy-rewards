"""Add FIS Global Payment One card management tables

Revision ID: 9a3c5d7e8f12
Revises: 20260116_143000_add_form_submission_tables
Create Date: 2026-01-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9a3c5d7e8f12'
down_revision = '20260116_143000_add_form_submission_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ==========================================================================
    # FIS Cards Table
    # ==========================================================================
    op.create_table(
        'fis_cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fis_card_token', sa.String(255), nullable=True, unique=True),
        sa.Column('card_type', sa.String(50), nullable=False),  # virtual, physical
        sa.Column('status', sa.String(50), nullable=False, default='pending'),  # pending, active, locked, frozen, cancelled, expired
        sa.Column('last_four', sa.String(4), nullable=True),
        sa.Column('expiry_month', sa.Integer(), nullable=True),
        sa.Column('expiry_year', sa.Integer(), nullable=True),
        sa.Column('card_network', sa.String(50), nullable=False, default='visa'),
        sa.Column('cardholder_name', sa.String(255), nullable=False),
        sa.Column('nickname', sa.String(100), nullable=True),
        sa.Column('is_primary', sa.Boolean(), default=False),
        sa.Column('pin_set', sa.Boolean(), default=False),
        sa.Column('pin_locked', sa.Boolean(), default=False),
        sa.Column('pin_failed_attempts', sa.Integer(), default=0),
        # Shipping info for physical cards
        sa.Column('shipping_status', sa.String(50), nullable=True),
        sa.Column('tracking_number', sa.String(100), nullable=True),
        sa.Column('shipping_carrier', sa.String(50), nullable=True),
        sa.Column('shipped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('activated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Indexes for fis_cards
    op.create_index('ix_fis_cards_user_id', 'fis_cards', ['user_id'])
    op.create_index('ix_fis_cards_status', 'fis_cards', ['status'])
    op.create_index('ix_fis_cards_fis_card_token', 'fis_cards', ['fis_card_token'])

    # ==========================================================================
    # FIS Card Controls Table
    # ==========================================================================
    op.create_table(
        'fis_card_controls',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_cards.id', ondelete='CASCADE'), nullable=False, unique=True),
        # Spending limits
        sa.Column('daily_limit', sa.Numeric(12, 2), nullable=True),
        sa.Column('weekly_limit', sa.Numeric(12, 2), nullable=True),
        sa.Column('monthly_limit', sa.Numeric(12, 2), nullable=True),
        sa.Column('per_transaction_limit', sa.Numeric(12, 2), nullable=True),
        # Channel controls
        sa.Column('atm_enabled', sa.Boolean(), default=True),
        sa.Column('pos_enabled', sa.Boolean(), default=True),
        sa.Column('ecommerce_enabled', sa.Boolean(), default=True),
        sa.Column('contactless_enabled', sa.Boolean(), default=True),
        sa.Column('international_enabled', sa.Boolean(), default=False),
        # Merchant controls (JSON arrays)
        sa.Column('blocked_mcc_codes', postgresql.JSONB, default=list),
        sa.Column('allowed_mcc_codes', postgresql.JSONB, nullable=True),
        # Geographic controls (JSON arrays)
        sa.Column('allowed_countries', postgresql.JSONB, default=['US']),
        sa.Column('blocked_countries', postgresql.JSONB, default=list),
        # Time controls
        sa.Column('allowed_hours_start', sa.Integer(), nullable=True),
        sa.Column('allowed_hours_end', sa.Integer(), nullable=True),
        sa.Column('allowed_days', postgresql.JSONB, default=[0, 1, 2, 3, 4, 5, 6]),
        # Alert preferences
        sa.Column('alert_on_transaction', sa.Boolean(), default=True),
        sa.Column('alert_on_decline', sa.Boolean(), default=True),
        sa.Column('alert_on_international', sa.Boolean(), default=True),
        sa.Column('alert_threshold', sa.Numeric(12, 2), nullable=True),
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Index for fis_card_controls
    op.create_index('ix_fis_card_controls_card_id', 'fis_card_controls', ['card_id'])

    # ==========================================================================
    # FIS PIN Requests Table (Audit Trail)
    # ==========================================================================
    op.create_table(
        'fis_pin_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_cards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('request_type', sa.String(50), nullable=False),  # set, change, reset, unlock
        sa.Column('status', sa.String(50), nullable=False),  # pending, completed, failed
        sa.Column('verification_method', sa.String(50), nullable=True),  # otp, security_questions, biometric
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('failure_reason', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Index for fis_pin_requests
    op.create_index('ix_fis_pin_requests_card_id', 'fis_pin_requests', ['card_id'])
    op.create_index('ix_fis_pin_requests_created_at', 'fis_pin_requests', ['created_at'])

    # ==========================================================================
    # FIS Transactions Table
    # ==========================================================================
    op.create_table(
        'fis_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_cards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fis_transaction_id', sa.String(255), nullable=True, unique=True),
        sa.Column('transaction_type', sa.String(50), nullable=False),  # purchase, refund, atm_withdrawal, etc.
        sa.Column('status', sa.String(50), nullable=False),  # pending, posted, declined, reversed
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD'),
        sa.Column('merchant_name', sa.String(255), nullable=True),
        sa.Column('merchant_id', sa.String(100), nullable=True),
        sa.Column('mcc_code', sa.String(4), nullable=True),
        sa.Column('mcc_description', sa.String(255), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('channel', sa.String(50), nullable=True),  # pos, atm, ecommerce, contactless
        sa.Column('authorization_code', sa.String(50), nullable=True),
        sa.Column('decline_reason', sa.String(255), nullable=True),
        # Location
        sa.Column('merchant_city', sa.String(100), nullable=True),
        sa.Column('merchant_state', sa.String(50), nullable=True),
        sa.Column('merchant_country', sa.String(2), nullable=True),
        sa.Column('is_international', sa.Boolean(), default=False),
        # Rewards
        sa.Column('rewards_earned', sa.Numeric(12, 2), nullable=True),
        # User notes
        sa.Column('notes', sa.Text(), nullable=True),
        # Timestamps
        sa.Column('transaction_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('posted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Indexes for fis_transactions
    op.create_index('ix_fis_transactions_card_id', 'fis_transactions', ['card_id'])
    op.create_index('ix_fis_transactions_fis_transaction_id', 'fis_transactions', ['fis_transaction_id'])
    op.create_index('ix_fis_transactions_status', 'fis_transactions', ['status'])
    op.create_index('ix_fis_transactions_timestamp', 'fis_transactions', ['transaction_timestamp'])
    op.create_index('ix_fis_transactions_merchant_name', 'fis_transactions', ['merchant_name'])
    op.create_index('ix_fis_transactions_category', 'fis_transactions', ['category'])

    # ==========================================================================
    # FIS Wallet Tokens Table
    # ==========================================================================
    op.create_table(
        'fis_wallet_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_cards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fis_token_id', sa.String(255), nullable=True, unique=True),
        sa.Column('wallet_type', sa.String(50), nullable=False),  # apple_pay, google_pay, samsung_pay
        sa.Column('status', sa.String(50), nullable=False),  # requested, active, suspended, deleted
        sa.Column('device_id', sa.String(255), nullable=True),
        sa.Column('device_type', sa.String(50), nullable=True),  # phone, watch, tablet
        sa.Column('device_name', sa.String(255), nullable=True),
        sa.Column('token_suffix', sa.String(4), nullable=True),  # Last 4 of token PAN
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Indexes for fis_wallet_tokens
    op.create_index('ix_fis_wallet_tokens_card_id', 'fis_wallet_tokens', ['card_id'])
    op.create_index('ix_fis_wallet_tokens_wallet_type', 'fis_wallet_tokens', ['wallet_type'])
    op.create_index('ix_fis_wallet_tokens_status', 'fis_wallet_tokens', ['status'])

    # ==========================================================================
    # FIS KYC Verifications Table
    # ==========================================================================
    op.create_table(
        'fis_kyc_verifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fis_verification_id', sa.String(255), nullable=True, unique=True),
        sa.Column('verification_type', sa.String(50), nullable=False),  # identity, document, ofac, address
        sa.Column('status', sa.String(50), nullable=False),  # pending, approved, rejected, needs_review
        sa.Column('result_code', sa.String(50), nullable=True),
        sa.Column('result_message', sa.String(500), nullable=True),
        sa.Column('risk_score', sa.Integer(), nullable=True),
        sa.Column('verification_data', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Indexes for fis_kyc_verifications
    op.create_index('ix_fis_kyc_verifications_user_id', 'fis_kyc_verifications', ['user_id'])
    op.create_index('ix_fis_kyc_verifications_status', 'fis_kyc_verifications', ['status'])

    # ==========================================================================
    # FIS Fraud Alerts Table
    # ==========================================================================
    op.create_table(
        'fis_fraud_alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_cards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('fis_transactions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('fis_alert_id', sa.String(255), nullable=True, unique=True),
        sa.Column('alert_type', sa.String(50), nullable=False),  # suspicious_activity, large_transaction, etc.
        sa.Column('severity', sa.String(20), nullable=False),  # low, medium, high, critical
        sa.Column('status', sa.String(50), nullable=False),  # new, acknowledged, investigating, resolved, false_positive
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('merchant_name', sa.String(255), nullable=True),
        sa.Column('location_city', sa.String(100), nullable=True),
        sa.Column('location_country', sa.String(2), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Indexes for fis_fraud_alerts
    op.create_index('ix_fis_fraud_alerts_card_id', 'fis_fraud_alerts', ['card_id'])
    op.create_index('ix_fis_fraud_alerts_transaction_id', 'fis_fraud_alerts', ['transaction_id'])
    op.create_index('ix_fis_fraud_alerts_status', 'fis_fraud_alerts', ['status'])
    op.create_index('ix_fis_fraud_alerts_severity', 'fis_fraud_alerts', ['severity'])
    op.create_index('ix_fis_fraud_alerts_created_at', 'fis_fraud_alerts', ['created_at'])


def downgrade() -> None:
    # Drop tables in reverse order due to foreign key dependencies
    op.drop_table('fis_fraud_alerts')
    op.drop_table('fis_kyc_verifications')
    op.drop_table('fis_wallet_tokens')
    op.drop_table('fis_transactions')
    op.drop_table('fis_pin_requests')
    op.drop_table('fis_card_controls')
    op.drop_table('fis_cards')
