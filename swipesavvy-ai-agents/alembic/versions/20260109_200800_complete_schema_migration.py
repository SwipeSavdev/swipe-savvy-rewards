"""Complete schema migration with all tables

Revision ID: a1b2c3d4e5f6
Revises: 27dafa983136
Create Date: 2026-01-09 20:08:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '27dafa983136'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all tables for SwipeSavvy."""

    # ==========================================
    # Core Tables
    # ==========================================

    # Users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('role', sa.String(50), nullable=False, server_default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive', 'suspended', 'deleted')"),
        sa.CheckConstraint("role IN ('admin', 'support', 'user', 'merchant')"),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_status', 'users', ['status'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])

    # Admin Users table
    op.create_table('admin_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(100), nullable=False, server_default='admin'),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('permissions', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("role IN ('super_admin', 'admin', 'support_manager', 'analyst', 'viewer', 'operator')"),
        sa.CheckConstraint("status IN ('active', 'inactive', 'suspended')"),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_admin_users_email', 'admin_users', ['email'], unique=True)
    op.create_index('ix_admin_users_role', 'admin_users', ['role'])

    # Merchants table
    op.create_table('merchants',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('business_type', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('transaction_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('success_rate', sa.Numeric(5, 2), nullable=True, server_default='100.00'),
        sa.Column('monthly_volume', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('join_date', sa.DateTime(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive', 'suspended', 'pending')"),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_merchants_email', 'merchants', ['email'], unique=True)
    op.create_index('ix_merchants_status', 'merchants', ['status'])

    # Support Tickets table
    op.create_table('support_tickets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('customer_name', sa.String(255), nullable=False),
        sa.Column('customer_email', sa.String(255), nullable=False),
        sa.Column('category', sa.String(100), nullable=False, server_default='general'),
        sa.Column('status', sa.String(50), nullable=False, server_default='open'),
        sa.Column('priority', sa.String(50), nullable=False, server_default='medium'),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('open', 'in_progress', 'closed', 'reopened')"),
        sa.CheckConstraint("priority IN ('low', 'medium', 'high', 'critical')"),
        sa.ForeignKeyConstraint(['assigned_to'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_support_tickets_customer_email', 'support_tickets', ['customer_email'])
    op.create_index('ix_support_tickets_status', 'support_tickets', ['status'])
    op.create_index('ix_support_tickets_assigned_to', 'support_tickets', ['assigned_to'])

    # Feature Flags table
    op.create_table('feature_flags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('rollout_percentage', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('owner_email', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(255), nullable=True),
        sa.Column('updated_by', sa.String(255), nullable=True),
        sa.CheckConstraint("category IN ('UI', 'Advanced', 'Experimental', 'Rollout')"),
        sa.CheckConstraint("rollout_percentage >= 0 AND rollout_percentage <= 100"),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_feature_flags_key', 'feature_flags', ['key'], unique=True)
    op.create_index('ix_feature_flags_category', 'feature_flags', ['category'])
    op.create_index('ix_feature_flags_enabled', 'feature_flags', ['enabled'])
    op.create_index('ix_feature_flags_created_at', 'feature_flags', ['created_at'])

    # AI Campaigns table
    op.create_table('ai_campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(100), nullable=False, server_default='email'),
        sa.Column('status', sa.String(50), nullable=False, server_default='draft'),
        sa.Column('budget', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('spent', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('roi', sa.Numeric(6, 2), nullable=True, server_default='0.00'),
        sa.Column('conversions', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('engagement', sa.Numeric(5, 2), nullable=True, server_default='0.00'),
        sa.Column('audience_size', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("status IN ('draft', 'active', 'paused', 'completed', 'archived')"),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('ix_ai_campaigns_status', 'ai_campaigns', ['status'])

    # Audit Logs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.String(255), nullable=False),
        sa.Column('action_type', sa.String(100), nullable=False, server_default='create'),
        sa.Column('resource_type', sa.String(100), nullable=True),
        sa.Column('resource_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_email', sa.String(255), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('changes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='success'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('success', 'failure')"),
        sa.CheckConstraint("action_type IN ('create', 'read', 'update', 'delete', 'authentication', 'system')"),
        sa.ForeignKeyConstraint(['user_id'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])

    # Settings table
    op.create_table('settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('key', sa.String(255), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('data_type', sa.String(50), nullable=False, server_default='string'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("data_type IN ('string', 'integer', 'float', 'boolean', 'json')"),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_settings_category', 'settings', ['category'])

    # AI Models table
    op.create_table('ai_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('model_type', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('accuracy', sa.Float(), nullable=True),
        sa.Column('deployment_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Dashboard Analytics table
    op.create_table('dashboard_analytics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('total_users', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('active_users', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('new_users', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('total_transactions', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('transaction_volume', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('success_rate', sa.Float(), nullable=True, server_default='0.00'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('date')
    )

    # Campaign Performance table
    op.create_table('campaign_performance',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('impressions', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('clicks', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('conversions', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('spend', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('revenue', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('ctr', sa.Float(), nullable=True, server_default='0.00'),
        sa.Column('conversion_rate', sa.Float(), nullable=True, server_default='0.00'),
        sa.Column('roas', sa.Float(), nullable=True, server_default='0.00'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['ai_campaigns.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # ==========================================
    # Wallet Tables
    # ==========================================

    # Wallets table
    op.create_table('wallets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('balance', sa.Numeric(15, 2), nullable=True, server_default='0.00'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('active', 'frozen', 'inactive')"),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_wallets_user_id', 'wallets', ['user_id'])
    op.create_index('ix_wallets_status', 'wallets', ['status'])

    # Wallet Transactions table
    op.create_table('wallet_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_type', sa.String(50), nullable=False, server_default='transfer'),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('payment_method', sa.String(100), nullable=True),
        sa.Column('reference_number', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("transaction_type IN ('deposit', 'withdrawal', 'transfer', 'refund', 'payment')"),
        sa.CheckConstraint("status IN ('pending', 'completed', 'failed', 'cancelled')"),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_wallet_transactions_user_id', 'wallet_transactions', ['user_id'])

    # Payment Methods table
    op.create_table('payment_methods',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(50), nullable=False, server_default='card'),
        sa.Column('token', sa.String(255), nullable=True),
        sa.Column('last_four', sa.String(4), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("type IN ('card', 'bank_account', 'mobile_wallet', 'crypto')"),
        sa.CheckConstraint("status IN ('active', 'expired', 'inactive')"),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_payment_methods_user_id', 'payment_methods', ['user_id'])
    op.create_index('ix_payment_methods_type', 'payment_methods', ['type'])

    # Payments table
    op.create_table('payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('merchant_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True),
        sa.Column('stripe_payment_id', sa.String(255), nullable=True),
        sa.Column('stripe_charge_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('meta_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('receipt_url', sa.String(500), nullable=True),
        sa.Column('refund_amount', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('refund_reason', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled')"),
        sa.CheckConstraint("amount > 0"),
        sa.CheckConstraint("refund_amount >= 0"),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['merchant_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_payments_user_id', 'payments', ['user_id'])
    op.create_index('ix_payments_merchant_id', 'payments', ['merchant_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])
    op.create_index('ix_payments_stripe_payment_intent_id', 'payments', ['stripe_payment_intent_id'], unique=True)
    op.create_index('ix_payments_stripe_payment_id', 'payments', ['stripe_payment_id'], unique=True)
    op.create_index('ix_payments_created_at', 'payments', ['created_at'])

    # Subscriptions table
    op.create_table('subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan', sa.String(50), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),
        sa.Column('stripe_customer_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('billing_cycle_start', sa.DateTime(), nullable=True),
        sa.Column('billing_cycle_end', sa.DateTime(), nullable=True),
        sa.Column('current_period_start', sa.DateTime(), nullable=True),
        sa.Column('current_period_end', sa.DateTime(), nullable=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('auto_renew', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('trial_start', sa.DateTime(), nullable=True),
        sa.Column('trial_end', sa.DateTime(), nullable=True),
        sa.Column('canceled_at', sa.DateTime(), nullable=True),
        sa.Column('cancel_reason', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("plan IN ('free', 'starter', 'pro', 'enterprise')"),
        sa.CheckConstraint("status IN ('active', 'inactive', 'canceled', 'suspended', 'past_due')"),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_subscriptions_user_id', 'subscriptions', ['user_id'])
    op.create_index('ix_subscriptions_status', 'subscriptions', ['status'])
    op.create_index('ix_subscriptions_stripe_subscription_id', 'subscriptions', ['stripe_subscription_id'], unique=True)
    op.create_index('ix_subscriptions_created_at', 'subscriptions', ['created_at'])

    # Analytics Events table
    op.create_table('analytics_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('merchant_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('event_name', sa.String(255), nullable=False),
        sa.Column('event_category', sa.String(100), nullable=True),
        sa.Column('event_action', sa.String(100), nullable=True),
        sa.Column('event_label', sa.String(255), nullable=True),
        sa.Column('event_value', sa.Numeric(10, 2), nullable=True),
        sa.Column('event_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('session_id', sa.String(255), nullable=True),
        sa.Column('device_id', sa.String(255), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('page_url', sa.String(500), nullable=True),
        sa.Column('referrer_url', sa.String(500), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['merchant_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_analytics_events_user_id', 'analytics_events', ['user_id'])
    op.create_index('ix_analytics_events_merchant_id', 'analytics_events', ['merchant_id'])
    op.create_index('ix_analytics_events_event_type', 'analytics_events', ['event_type'])
    op.create_index('ix_analytics_events_session_id', 'analytics_events', ['session_id'])
    op.create_index('ix_analytics_events_timestamp', 'analytics_events', ['timestamp'])

    # ==========================================
    # RBAC Tables
    # ==========================================

    # Roles table
    op.create_table('roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('permissions', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('is_system', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('user_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive')"),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_roles_name', 'roles', ['name'], unique=True)

    # Policies table
    op.create_table('policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('resource', sa.String(100), nullable=False),
        sa.Column('actions', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('effect', sa.String(10), nullable=False, server_default='allow'),
        sa.Column('priority', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('is_system', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("status IN ('active', 'inactive')"),
        sa.CheckConstraint("effect IN ('allow', 'deny')"),
        sa.ForeignKeyConstraint(['created_by'], ['admin_users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_policies_name', 'policies', ['name'], unique=True)

    # Permissions table
    op.create_table('permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('display_name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('resource', sa.String(100), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('is_system', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_permissions_name', 'permissions', ['name'], unique=True)

    # ==========================================
    # Onboarding Tables
    # ==========================================

    # Charities table
    op.create_table('charities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('registration_number', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=True, server_default='United States'),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('documents_submitted', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('status', sa.String(50), nullable=False, server_default='incomplete'),
        sa.Column('completion_percentage', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'approved', 'rejected', 'incomplete')"),
        sa.CheckConstraint("completion_percentage >= 0 AND completion_percentage <= 100"),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_charities_email', 'charities', ['email'], unique=True)
    op.create_index('ix_charities_status', 'charities', ['status'])

    # Merchant Onboardings table
    op.create_table('merchant_onboardings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('merchant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ext_ref_id', sa.String(50), nullable=False),
        sa.Column('mpa_id', sa.String(50), nullable=True),
        sa.Column('north_number', sa.String(50), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='draft'),
        sa.Column('fiserv_status', sa.String(100), nullable=True),
        sa.Column('fiserv_status_message', sa.Text(), nullable=True),
        sa.Column('step', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('completion_percentage', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('legal_name', sa.String(255), nullable=True),
        sa.Column('dba_name', sa.String(255), nullable=True),
        sa.Column('tax_id', sa.String(20), nullable=True),
        sa.Column('business_type', sa.String(100), nullable=True),
        sa.Column('mcc_code', sa.String(10), nullable=True),
        sa.Column('business_street', sa.String(255), nullable=True),
        sa.Column('business_city', sa.String(100), nullable=True),
        sa.Column('business_state', sa.String(50), nullable=True),
        sa.Column('business_zip', sa.String(20), nullable=True),
        sa.Column('business_country', sa.String(100), nullable=True, server_default='US'),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('customer_service_phone', sa.String(20), nullable=True),
        sa.Column('owner_name', sa.String(255), nullable=True),
        sa.Column('owner_ssn_last4', sa.String(4), nullable=True),
        sa.Column('owner_dob', sa.Date(), nullable=True),
        sa.Column('owner_phone', sa.String(20), nullable=True),
        sa.Column('owner_email', sa.String(255), nullable=True),
        sa.Column('owner_street', sa.String(255), nullable=True),
        sa.Column('owner_city', sa.String(100), nullable=True),
        sa.Column('owner_state', sa.String(50), nullable=True),
        sa.Column('owner_zip', sa.String(20), nullable=True),
        sa.Column('owner_country', sa.String(100), nullable=True, server_default='US'),
        sa.Column('bank_name', sa.String(255), nullable=True),
        sa.Column('routing_number', sa.String(9), nullable=True),
        sa.Column('account_number_encrypted', sa.String(255), nullable=True),
        sa.Column('monthly_volume', sa.Numeric(15, 2), nullable=True),
        sa.Column('avg_ticket', sa.Numeric(10, 2), nullable=True),
        sa.Column('high_ticket', sa.Numeric(10, 2), nullable=True),
        sa.Column('documents', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(), nullable=True),
        sa.Column('last_status_check', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.CheckConstraint("status IN ('draft', 'submitted', 'pending_credit', 'pending_bos', 'approved', 'rejected')"),
        sa.CheckConstraint("step >= 1 AND step <= 6"),
        sa.CheckConstraint("completion_percentage >= 0 AND completion_percentage <= 100"),
        sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_merchant_onboardings_merchant_id', 'merchant_onboardings', ['merchant_id'])
    op.create_index('ix_merchant_onboardings_ext_ref_id', 'merchant_onboardings', ['ext_ref_id'], unique=True)
    op.create_index('ix_merchant_onboardings_mpa_id', 'merchant_onboardings', ['mpa_id'])
    op.create_index('ix_merchant_onboardings_status', 'merchant_onboardings', ['status'])

    # ==========================================
    # Notification Tables
    # ==========================================

    # Device Tokens table
    op.create_table('device_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_token', sa.String(255), nullable=False),
        sa.Column('device_type', sa.String(50), nullable=False),
        sa.Column('device_name', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('firebase_device_id', sa.String(255), nullable=True),
        sa.Column('registered_at', sa.DateTime(), nullable=False),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('unregistered_at', sa.DateTime(), nullable=True),
        sa.Column('device_os', sa.String(100), nullable=True),
        sa.Column('app_version', sa.String(20), nullable=True),
        sa.Column('notifications_sent', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('notifications_failed', sa.Integer(), nullable=True, server_default='0'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_device_tokens_user_id', 'device_tokens', ['user_id'])
    op.create_index('ix_device_tokens_device_token', 'device_tokens', ['device_token'], unique=True)
    op.create_index('ix_device_tokens_is_active', 'device_tokens', ['is_active'])

    # Notification History table
    op.create_table('notification_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(50), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=True),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(50), nullable=True, server_default='pending'),
        sa.Column('message_id', sa.String(255), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('clicked', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('clicked_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('failed_at', sa.DateTime(), nullable=True),
        sa.Column('failure_reason', sa.String(255), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('last_retry_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['device_tokens.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notification_history_user_id', 'notification_history', ['user_id'])
    op.create_index('ix_notification_history_notification_type', 'notification_history', ['notification_type'])
    op.create_index('ix_notification_history_status', 'notification_history', ['status'])
    op.create_index('ix_notification_history_created_at', 'notification_history', ['created_at'])
    op.create_index('ix_notification_history_message_id', 'notification_history', ['message_id'], unique=True)

    # Notification Preferences table
    op.create_table('notification_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('payment_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('campaign_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('support_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('security_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('feature_notifications', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('quiet_hours_enabled', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('quiet_hours_start', sa.String(5), nullable=True),
        sa.Column('quiet_hours_end', sa.String(5), nullable=True),
        sa.Column('quiet_hours_timezone', sa.String(50), nullable=True),
        sa.Column('email_digest_enabled', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('email_digest_frequency', sa.String(50), nullable=True, server_default='daily'),
        sa.Column('allow_analytics', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('allow_marketing', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notification_preferences_user_id', 'notification_preferences', ['user_id'], unique=True)

    # Notification Templates table
    op.create_table('notification_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('template_type', sa.String(50), nullable=False),
        sa.Column('title_template', sa.String(255), nullable=False),
        sa.Column('body_template', sa.Text(), nullable=False),
        sa.Column('icon_url', sa.String(255), nullable=True),
        sa.Column('image_url', sa.String(255), nullable=True),
        sa.Column('action_url', sa.String(255), nullable=True),
        sa.Column('variables', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notification_templates_name', 'notification_templates', ['name'], unique=True)

    # ==========================================
    # Chat Tables (from chat.py)
    # ==========================================

    # Chat Sessions table
    op.create_table('chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('session_type', sa.String(50), nullable=True, server_default='support'),
        sa.Column('status', sa.String(50), nullable=True, server_default='active'),
        sa.Column('last_message_at', sa.DateTime(), nullable=True),
        sa.Column('message_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('context', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chat_sessions_user_id', 'chat_sessions', ['user_id'])
    op.create_index('ix_chat_sessions_status', 'chat_sessions', ['status'])

    # Chat Messages table
    op.create_table('chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chat_messages_session_id', 'chat_messages', ['session_id'])
    op.create_index('ix_chat_messages_created_at', 'chat_messages', ['created_at'])


def downgrade() -> None:
    """Drop all tables in reverse order."""
    # Chat tables
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')

    # Notification tables
    op.drop_table('notification_templates')
    op.drop_table('notification_preferences')
    op.drop_table('notification_history')
    op.drop_table('device_tokens')

    # Onboarding tables
    op.drop_table('merchant_onboardings')
    op.drop_table('charities')

    # RBAC tables
    op.drop_table('permissions')
    op.drop_table('policies')
    op.drop_table('roles')

    # Analytics table
    op.drop_table('analytics_events')

    # Subscription and payment tables
    op.drop_table('subscriptions')
    op.drop_table('payments')
    op.drop_table('payment_methods')
    op.drop_table('wallet_transactions')
    op.drop_table('wallets')

    # Campaign tables
    op.drop_table('campaign_performance')
    op.drop_table('dashboard_analytics')
    op.drop_table('ai_models')
    op.drop_table('settings')
    op.drop_table('audit_logs')
    op.drop_table('ai_campaigns')
    op.drop_table('feature_flags')
    op.drop_table('support_tickets')
    op.drop_table('merchants')
    op.drop_table('admin_users')
    op.drop_table('users')
