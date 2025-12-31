"""
SQLAlchemy ORM Models for SwipeSavvy Database

Defines all database table models for the three databases:
- swipesavvy_dev: Admin portal & core business data
- swipesavvy_ai: AI campaigns & machine learning
- swipesavvy_wallet: Wallet & payment transactions
- swipesavvy_chat: Real-time chat and messaging
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, UUID, ForeignKey, CheckConstraint, ARRAY, Date, Numeric, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from uuid import uuid4
from datetime import datetime

# Constants for foreign key references
ADMIN_USERS_ID = 'admin_users.id'
USERS_ID = 'users.id'
CHAT_SESSIONS_ID = 'chat_sessions.id'

# Import chat models to register them with the database Base
# Note: Don't import specific chat classes here as they may conflict with our own definitions
import app.models.chat

# ============================================
# swipesavvy_dev Models (Admin Portal)
# ============================================

class User(Base):
    """Regular app users and merchants"""
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    status = Column(String(50), default='active', nullable=False, index=True)
    role = Column(String(50), default='user', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Check constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'suspended', 'deleted')"),
        CheckConstraint("role IN ('admin', 'support', 'user', 'merchant')"),
    )


class AdminUser(Base):
    """Admin portal users with roles and permissions"""
    __tablename__ = "admin_users"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), default='admin', nullable=False, index=True)
    department = Column(String(100), nullable=True)
    permissions = Column(ARRAY(String), default=list, nullable=False)
    status = Column(String(50), default='active', nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    
    # Relationships
    audit_logs = relationship("AuditLog", foreign_keys="AuditLog.user_id")
    
    __table_args__ = (
        CheckConstraint("role IN ('admin', 'support_manager', 'analyst', 'viewer')"),
        CheckConstraint("status IN ('active', 'inactive', 'suspended')"),
    )


class Merchant(Base):
    """Merchant profiles and business data"""
    __tablename__ = "merchants"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    status = Column(String(50), default='active', nullable=False, index=True)
    transaction_count = Column(Integer, default=0)
    success_rate = Column(Numeric(5, 2), default=100.00)
    monthly_volume = Column(Numeric(15, 2), default=0.00)
    join_date = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'suspended', 'pending')"),
    )


class SupportTicket(Base):
    """Customer support tickets"""
    __tablename__ = "support_tickets"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    category = Column(String(100), default='general', nullable=False)
    status = Column(String(50), default='open', nullable=False, index=True)
    priority = Column(String(50), default='medium', nullable=False)
    assigned_to = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True, index=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        CheckConstraint("status IN ('open', 'in_progress', 'closed', 'reopened')"),
        CheckConstraint("priority IN ('low', 'medium', 'high', 'critical')"),
    )


class FeatureFlag(Base):
    """Feature rollout flags for A/B testing"""
    __tablename__ = "feature_flags"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=False, index=True)
    rollout_percentage = Column(Integer, default=0)
    environment = Column(String(50), default='development', index=True)
    targeted_users = Column(ARRAY(String), default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    
    __table_args__ = (
        CheckConstraint("environment IN ('development', 'staging', 'production')"),
    )


class AICampaign(Base):
    """AI marketing campaigns with budget tracking"""
    __tablename__ = "ai_campaigns"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    type = Column(String(100), default='email', nullable=False)
    status = Column(String(50), default='draft', nullable=False, index=True)
    budget = Column(Numeric(15, 2), default=0.00)
    spent = Column(Numeric(15, 2), default=0.00)
    roi = Column(Numeric(6, 2), default=0.00)
    conversions = Column(Integer, default=0)
    engagement = Column(Numeric(5, 2), default=0.00)
    audience_size = Column(Integer, default=0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'active', 'paused', 'completed', 'archived')"),
    )


class AuditLog(Base):
    """Action audit trail for compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    action = Column(String(255), nullable=False)
    action_type = Column(String(100), default='create', nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(UUID, nullable=True)
    user_id = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=False, index=True)
    user_email = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    changes = Column(JSONB, default=dict)
    status = Column(String(50), default='success', nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('success', 'failure')"),
        CheckConstraint("action_type IN ('create', 'read', 'update', 'delete', 'authentication', 'system')"),
    )


class Setting(Base):
    """System settings and configuration"""
    __tablename__ = "settings"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    category = Column(String(100), nullable=False, index=True)
    key = Column(String(255), nullable=False)
    value = Column(Text, nullable=False)
    data_type = Column(String(50), default='string', nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    
    __table_args__ = (
        CheckConstraint("data_type IN ('string', 'integer', 'float', 'boolean', 'json')"),
    )


# Placeholder tables for schema consistency (empty for now)
class AIModel(Base):
    """AI model metadata and versions"""
    __tablename__ = "ai_models"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    model_type = Column(String(100), nullable=False)
    status = Column(String(50), default='active', nullable=False)
    accuracy = Column(Float, nullable=True)
    deployment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DashboardAnalytic(Base):
    """Daily dashboard metrics"""
    __tablename__ = "dashboard_analytics"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    date = Column(Date, nullable=False, unique=True)
    total_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_transactions = Column(Integer, default=0)
    transaction_volume = Column(Numeric(15, 2), default=0.00)
    success_rate = Column(Float, default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)


class CampaignPerformance(Base):
    """Campaign performance metrics"""
    __tablename__ = "campaign_performance"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    campaign_id = Column(UUID, ForeignKey('ai_campaigns.id'), nullable=False)
    date = Column(Date, nullable=False)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    spend = Column(Numeric(15, 2), default=0.00)
    revenue = Column(Numeric(15, 2), default=0.00)
    ctr = Column(Float, default=0.00)
    conversion_rate = Column(Float, default=0.00)
    roas = Column(Float, default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)


# ============================================
# swipesavvy_wallet Models (Payments)
# ============================================

class Wallet(Base):
    """User wallet accounts"""
    __tablename__ = "wallets"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), unique=True, nullable=False, index=True)
    balance = Column(Numeric(15, 2), default=0.00)
    currency = Column(String(3), default='USD', nullable=False)
    status = Column(String(50), default='active', nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('active', 'frozen', 'inactive')"),
    )


class WalletTransaction(Base):
    """Wallet transaction history"""
    __tablename__ = "wallet_transactions"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    transaction_type = Column(String(50), default='transfer', nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default='USD', nullable=False)
    status = Column(String(50), default='pending', nullable=False)
    description = Column(Text, nullable=True)
    recipient_id = Column(UUID, ForeignKey(USERS_ID), nullable=True)
    payment_method = Column(String(100), nullable=True)
    reference_number = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        CheckConstraint("transaction_type IN ('deposit', 'withdrawal', 'transfer', 'refund', 'payment')"),
        CheckConstraint("status IN ('pending', 'completed', 'failed', 'cancelled')"),
    )


class PaymentMethod(Base):
    """Saved payment methods"""
    __tablename__ = "payment_methods"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    type = Column(String(50), default='card', nullable=False, index=True)
    token = Column(String(255), nullable=True)
    last_four = Column(String(4), nullable=True)
    expiry_date = Column(Date, nullable=True)
    is_default = Column(Boolean, default=False)
    status = Column(String(50), default='active', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("type IN ('card', 'bank_account', 'mobile_wallet', 'crypto')"),
        CheckConstraint("status IN ('active', 'expired', 'inactive')"),
    )


# ============================================
# Phase 10: Advanced Features Models
# ============================================

class Payment(Base):
    """Payment transactions via Stripe"""
    __tablename__ = "payments"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    merchant_id = Column(UUID, ForeignKey(USERS_ID), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default='USD', nullable=False)
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_payment_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_charge_id = Column(String(255), unique=True, nullable=True)
    status = Column(String(50), default='pending', nullable=False, index=True)
    payment_method = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    meta_data = Column(JSONB, default={}, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    refund_amount = Column(Numeric(10, 2), default=0, nullable=False)
    refund_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled')"),
        CheckConstraint("amount > 0"),
        CheckConstraint("refund_amount >= 0"),
    )


class Subscription(Base):
    """Subscription management with Stripe"""
    __tablename__ = "subscriptions"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, unique=True, index=True)
    plan = Column(String(50), nullable=False)  # 'free', 'starter', 'pro', 'enterprise'
    stripe_subscription_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_customer_id = Column(String(255), unique=True, nullable=True)
    status = Column(String(50), default='active', nullable=False, index=True)
    billing_cycle_start = Column(DateTime, nullable=True)
    billing_cycle_end = Column(DateTime, nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default='USD', nullable=False)
    auto_renew = Column(Boolean, default=True)
    trial_start = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("plan IN ('free', 'starter', 'pro', 'enterprise')"),
        CheckConstraint("status IN ('active', 'inactive', 'canceled', 'suspended', 'past_due')"),
    )


class AnalyticsEvent(Base):
    """Analytics event tracking for user behavior and conversions"""
    __tablename__ = "analytics_events"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=True, index=True)
    merchant_id = Column(UUID, ForeignKey(USERS_ID), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)  # 'page_view', 'button_click', 'payment_completed', etc
    event_name = Column(String(255), nullable=False)
    event_category = Column(String(100), nullable=True)
    event_action = Column(String(100), nullable=True)
    event_label = Column(String(255), nullable=True)
    event_value = Column(Numeric(10, 2), nullable=True)
    event_data = Column(JSONB, default={}, nullable=True)
    session_id = Column(String(255), nullable=True, index=True)
    device_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    page_url = Column(String(500), nullable=True)
    referrer_url = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        CheckConstraint("event_type IN ('page_view', 'button_click', 'payment_completed', 'signup', 'login', 'form_submit', 'search', 'error', 'video_play', 'download', 'share', 'add_to_cart', 'checkout', 'purchase', 'refund', 'subscription_start', 'subscription_cancel')"),
    )


# Export all models
__all__ = [
    "User",
    "AdminUser",
    "Merchant",
    "SupportTicket",
    "FeatureFlag",
    "AICampaign",
    "AuditLog",
    "Setting",
    "AIModel",
    "DashboardAnalytic",
    "CampaignPerformance",
    "Wallet",
    "WalletTransaction",
    "PaymentMethod",
    "Payment",
    "Subscription",
    "AnalyticsEvent",
]
