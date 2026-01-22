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
FIS_CARDS_ID = 'fis_cards.id'
FIS_TRANSACTIONS_ID = 'fis_transactions.id'

# Import chat models to register them with the database Base
# Note: Don't import specific chat classes here as they may conflict with our own definitions
import app.models.chat

# Import notification models to register them with the database Base
from app.models.notifications import DeviceToken, NotificationHistory, NotificationPreferences, NotificationTemplate

# Import form models to register them with the database Base
from app.models.forms import ContactFormSubmission, DemoRequestSubmission

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
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    status = Column(String(50), default='pending', nullable=False, index=True)
    role = Column(String(50), default='user', nullable=False)

    # Address fields
    street_address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), default='US', nullable=True)

    # KYC fields
    kyc_tier = Column(String(20), default='tier1', nullable=False, index=True)
    kyc_status = Column(String(50), default='pending', nullable=False, index=True)
    kyc_verified_at = Column(DateTime, nullable=True)
    ssn_last4 = Column(String(4), nullable=True)  # Last 4 digits of SSN (encrypted)
    ssn_hash = Column(String(255), nullable=True)  # Full SSN hash for verification

    # Email/Phone verification
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime, nullable=True)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    phone_verified = Column(Boolean, default=False, nullable=False)
    phone_verified_at = Column(DateTime, nullable=True)
    phone_verification_code = Column(String(10), nullable=True)
    phone_verification_expires = Column(DateTime, nullable=True)

    # Password reset
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)

    # Identity verification
    identity_verification_id = Column(String(255), nullable=True)  # External IDV provider ID
    identity_verification_status = Column(String(50), nullable=True)

    # Security
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    kyc_documents = relationship("UserKYCDocument", back_populates="user", lazy="dynamic")
    kyc_history = relationship("UserKYCHistory", back_populates="user", lazy="dynamic")

    # Check constraints
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'suspended', 'deleted', 'pending')"),
        CheckConstraint("role IN ('admin', 'support', 'user', 'merchant')"),
        CheckConstraint("kyc_tier IN ('tier1', 'tier2', 'tier3')"),
        CheckConstraint("kyc_status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_info', 'expired')"),
    )


class UserKYCDocument(Base):
    """User KYC document uploads and verification"""
    __tablename__ = "user_kyc_documents"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    document_type = Column(String(50), nullable=False, index=True)
    document_subtype = Column(String(50), nullable=True)  # front, back, selfie
    file_path = Column(String(500), nullable=False)  # S3 path
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    status = Column(String(50), default='pending', nullable=False, index=True)
    verification_result = Column(JSONB, default=dict, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Document expiration
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="kyc_documents")

    __table_args__ = (
        CheckConstraint("document_type IN ('drivers_license', 'passport', 'state_id', 'ssn_card', 'utility_bill', 'bank_statement', 'selfie')"),
        CheckConstraint("status IN ('pending', 'verified', 'rejected', 'expired')"),
    )


class UserKYCHistory(Base):
    """KYC verification history and audit trail"""
    __tablename__ = "user_kyc_history"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    previous_tier = Column(String(20), nullable=True)
    new_tier = Column(String(20), nullable=True)
    verification_type = Column(String(50), nullable=True)  # email, phone, document, identity
    verification_provider = Column(String(100), nullable=True)  # plaid, twilio, sendgrid
    verification_result = Column(JSONB, default=dict, nullable=True)
    notes = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    performed_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)  # Admin who performed action
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="kyc_history")


class OFACScreeningResult(Base):
    """OFAC/Sanctions screening results"""
    __tablename__ = "ofac_screening_results"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    screening_type = Column(String(50), nullable=False)  # ofac, pep, adverse_media
    provider = Column(String(100), nullable=True)
    status = Column(String(50), default='pending', nullable=False, index=True)
    match_score = Column(Float, nullable=True)
    matches = Column(JSONB, default=list, nullable=True)
    raw_response = Column(JSONB, default=dict, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        CheckConstraint("screening_type IN ('ofac', 'pep', 'adverse_media', 'sanctions')"),
        CheckConstraint("status IN ('pending', 'clear', 'potential_match', 'confirmed_match', 'false_positive')"),
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
        CheckConstraint("role IN ('super_admin', 'admin', 'support_manager', 'analyst', 'viewer', 'operator')"),
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

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)
    enabled = Column(Boolean, default=False, index=True)
    rollout_percentage = Column(Integer, default=0)
    owner_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255), nullable=True)
    updated_by = Column(String(255), nullable=True)

    __table_args__ = (
        CheckConstraint("category IN ('UI', 'Advanced', 'Experimental', 'Rollout')"),
        CheckConstraint("rollout_percentage >= 0 AND rollout_percentage <= 100"),
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


# ============================================
# Role-Based Access Control (RBAC) Models
# ============================================

class Role(Base):
    """Admin roles with permissions"""
    __tablename__ = "roles"

    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(ARRAY(String), default=list, nullable=False)
    is_system = Column(Boolean, default=False)  # System roles cannot be deleted
    status = Column(String(50), default='active', nullable=False)
    user_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive')"),
    )


class Policy(Base):
    """Access control policies"""
    __tablename__ = "policies"

    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource = Column(String(100), nullable=False)  # e.g., 'merchants', 'users', 'transactions'
    actions = Column(ARRAY(String), default=list, nullable=False)  # e.g., ['read', 'write', 'delete']
    conditions = Column(JSONB, default=dict, nullable=True)  # Optional conditions for the policy
    effect = Column(String(10), default='allow', nullable=False)  # 'allow' or 'deny'
    priority = Column(Integer, default=0)  # Higher priority policies evaluated first
    is_system = Column(Boolean, default=False)
    status = Column(String(50), default='active', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive')"),
        CheckConstraint("effect IN ('allow', 'deny')"),
    )


class Permission(Base):
    """Available permissions in the system"""
    __tablename__ = "permissions"

    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # e.g., 'merchants', 'users', 'analytics'
    resource = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)  # e.g., 'read', 'write', 'delete', 'manage'
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================
# Charity Onboarding Models
# ============================================

class Charity(Base):
    """Charity organizations for donation management"""
    __tablename__ = "charities"

    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    category = Column(String(100), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=True)
    country = Column(String(100), default='United States')
    website = Column(String(255), nullable=True)
    documents_submitted = Column(Integer, default=0)
    status = Column(String(50), default='incomplete', nullable=False, index=True)
    completion_percentage = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected', 'incomplete')"),
        CheckConstraint("completion_percentage >= 0 AND completion_percentage <= 100"),
    )


# ============================================
# Merchant Subscriptions & Preferred Merchants
# ============================================

class MerchantSubscription(Base):
    """
    Merchant subscription plans that determine placement priority.
    Selected during merchant onboarding process.

    Tier Benefits:
    - platinum: Top placement (score 100), featured banner, unlimited deals, priority support, analytics
    - gold: High placement (score 75), featured deals, up to 10 active deals, analytics
    - silver: Standard placement (score 50), up to 5 active deals
    - bronze: Basic placement (score 25), up to 2 active deals
    - free: Minimal placement (score 0), 1 active deal
    """
    __tablename__ = "merchant_subscriptions"

    id = Column(UUID, primary_key=True, default=uuid4)
    merchant_id = Column(UUID, ForeignKey('merchants.id'), unique=True, nullable=False, index=True)

    # Subscription tier determines placement priority
    tier = Column(String(50), default='free', nullable=False, index=True)

    # Pricing
    monthly_fee = Column(Numeric(10, 2), default=0.00)
    annual_fee = Column(Numeric(10, 2), nullable=True)
    billing_cycle = Column(String(20), default='monthly')  # monthly, annual

    # Stripe billing
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)

    # Plan limits based on tier
    max_active_deals = Column(Integer, default=1)
    featured_placement = Column(Boolean, default=False)
    banner_enabled = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    analytics_access = Column(Boolean, default=False)
    custom_branding = Column(Boolean, default=False)

    # Placement score (calculated from tier)
    # platinum=100, gold=75, silver=50, bronze=25, free=0
    placement_score = Column(Integer, default=0)

    # Status
    status = Column(String(50), default='active', nullable=False, index=True)
    trial_ends_at = Column(DateTime, nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)

    # Link to onboarding (subscription selected during onboarding)
    onboarding_id = Column(UUID, ForeignKey('merchant_onboardings.id'), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    merchant = relationship("Merchant", backref="subscription")

    __table_args__ = (
        CheckConstraint("tier IN ('platinum', 'gold', 'silver', 'bronze', 'free')"),
        CheckConstraint("status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')"),
        CheckConstraint("billing_cycle IN ('monthly', 'annual')"),
    )


class PreferredMerchant(Base):
    """Preferred merchants displayed to consumers with special deals"""
    __tablename__ = "preferred_merchants"

    id = Column(UUID, primary_key=True, default=uuid4)
    merchant_id = Column(UUID, ForeignKey('merchants.id'), nullable=False, index=True)

    # Display configuration
    display_name = Column(String(255), nullable=True)  # Override merchant name for display
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=False, index=True)

    # Location info
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)

    # Cashback/Rewards
    cashback_percentage = Column(Numeric(5, 2), default=0.00)
    bonus_points_multiplier = Column(Numeric(3, 1), default=1.0)

    # Display priority and status (final priority = base_priority + subscription placement_score)
    priority = Column(Integer, default=0)  # Base priority set by admin
    is_featured = Column(Boolean, default=False)  # Requires gold+ subscription
    show_banner = Column(Boolean, default=False)  # Requires platinum subscription
    status = Column(String(50), default='active', nullable=False, index=True)

    # Validity period
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    # Extra data
    tags = Column(ARRAY(String), default=list)
    extra_data = Column(JSONB, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)

    # Relationships
    merchant = relationship("Merchant", backref="preferred_config")
    deals = relationship("MerchantDeal", back_populates="preferred_merchant", lazy="dynamic")

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'scheduled')"),
        CheckConstraint("cashback_percentage >= 0 AND cashback_percentage <= 100"),
        CheckConstraint("bonus_points_multiplier >= 1"),
    )


class MerchantDeal(Base):
    """Special deals and offers from preferred merchants"""
    __tablename__ = "merchant_deals"

    id = Column(UUID, primary_key=True, default=uuid4)
    preferred_merchant_id = Column(UUID, ForeignKey('preferred_merchants.id'), nullable=False, index=True)

    # Deal details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    deal_type = Column(String(50), nullable=False)  # percentage_off, fixed_amount, bogo, cashback_boost, points_multiplier

    # Deal value
    discount_value = Column(Numeric(10, 2), nullable=True)  # Amount or percentage
    min_purchase = Column(Numeric(10, 2), nullable=True)  # Minimum purchase to qualify
    max_discount = Column(Numeric(10, 2), nullable=True)  # Cap on discount

    # Terms
    terms_and_conditions = Column(Text, nullable=True)
    promo_code = Column(String(50), nullable=True)
    redemption_limit = Column(Integer, nullable=True)  # Max redemptions total
    per_user_limit = Column(Integer, default=1)  # Max redemptions per user

    # Display
    image_url = Column(String(500), nullable=True)
    priority = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    status = Column(String(50), default='active', nullable=False, index=True)

    # Validity
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    # Tracking
    redemption_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID, ForeignKey(ADMIN_USERS_ID), nullable=True)

    # Relationships
    preferred_merchant = relationship("PreferredMerchant", back_populates="deals")

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'expired', 'scheduled')"),
        CheckConstraint("deal_type IN ('percentage_off', 'fixed_amount', 'bogo', 'cashback_boost', 'points_multiplier', 'free_item')"),
    )


class MerchantOnboarding(Base):
    """Merchant onboarding for Fiserv AccessOne North Boarding API"""
    __tablename__ = "merchant_onboardings"

    id = Column(UUID, primary_key=True, default=uuid4)
    merchant_id = Column(UUID, ForeignKey('merchants.id'), nullable=False, index=True)

    # Fiserv Reference IDs
    ext_ref_id = Column(String(50), unique=True, nullable=False, index=True)  # Our reference
    mpa_id = Column(String(50), nullable=True, index=True)  # Fiserv's MPA ID
    north_number = Column(String(50), nullable=True)  # Fiserv North Number

    # Status tracking
    status = Column(String(50), default='draft', nullable=False, index=True)
    fiserv_status = Column(String(100), nullable=True)
    fiserv_status_message = Column(Text, nullable=True)
    step = Column(Integer, default=1)  # Current onboarding step (1-6)
    completion_percentage = Column(Integer, default=0)

    # Business Information (Step 1)
    legal_name = Column(String(255), nullable=True)
    dba_name = Column(String(255), nullable=True)
    tax_id = Column(String(20), nullable=True)
    business_type = Column(String(100), nullable=True)
    mcc_code = Column(String(10), nullable=True)
    business_street = Column(String(255), nullable=True)
    business_city = Column(String(100), nullable=True)
    business_state = Column(String(50), nullable=True)
    business_zip = Column(String(20), nullable=True)
    business_country = Column(String(100), default='US')
    website = Column(String(255), nullable=True)
    customer_service_phone = Column(String(20), nullable=True)

    # Owner/Principal Information (Step 2)
    owner_name = Column(String(255), nullable=True)
    owner_ssn_last4 = Column(String(4), nullable=True)
    owner_dob = Column(Date, nullable=True)
    owner_phone = Column(String(20), nullable=True)
    owner_email = Column(String(255), nullable=True)
    owner_street = Column(String(255), nullable=True)
    owner_city = Column(String(100), nullable=True)
    owner_state = Column(String(50), nullable=True)
    owner_zip = Column(String(20), nullable=True)
    owner_country = Column(String(100), default='US')

    # Bank Account Information (Step 3)
    bank_name = Column(String(255), nullable=True)
    routing_number = Column(String(9), nullable=True)
    account_number_encrypted = Column(String(255), nullable=True)  # Encrypted for security

    # Processing Information (Step 4)
    monthly_volume = Column(Numeric(15, 2), nullable=True)
    avg_ticket = Column(Numeric(10, 2), nullable=True)
    high_ticket = Column(Numeric(10, 2), nullable=True)

    # Document tracking (Step 5)
    documents = Column(JSONB, default=list)  # List of uploaded document references

    # Timestamps
    submitted_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    last_status_check = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to merchant
    merchant = relationship("Merchant", backref="onboarding")

    __table_args__ = (
        CheckConstraint("status IN ('draft', 'submitted', 'pending_credit', 'pending_bos', 'approved', 'rejected')"),
        CheckConstraint("step >= 1 AND step <= 6"),
        CheckConstraint("completion_percentage >= 0 AND completion_percentage <= 100"),
    )


# ============================================
# FIS Global Card Management Models
# ============================================

class FISCard(Base):
    """
    FIS Global Payment One - Card records
    Stores card data for debit cards issued through FIS
    """
    __tablename__ = "fis_cards"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)

    # FIS Reference IDs
    fis_card_id = Column(String(100), unique=True, nullable=False, index=True)
    fis_card_token = Column(String(255), nullable=False)  # Tokenized card reference
    fis_program_id = Column(String(100), nullable=True)  # Card program identifier

    # Card Details
    card_type = Column(String(20), nullable=False, index=True)  # virtual, physical
    status = Column(String(50), default='pending_activation', nullable=False, index=True)
    last_four = Column(String(4), nullable=False)
    expiry_month = Column(Integer, nullable=False)
    expiry_year = Column(Integer, nullable=False)
    cardholder_name = Column(String(255), nullable=False)

    # Card Network
    card_network = Column(String(20), default='visa')  # visa, mastercard
    bin = Column(String(6), nullable=True)  # Bank Identification Number

    # Physical Card Details
    shipping_address_id = Column(UUID, nullable=True)  # Reference to user address
    shipping_status = Column(String(50), nullable=True)  # ordered, shipped, delivered
    shipping_tracking = Column(String(100), nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Activation
    activated_at = Column(DateTime, nullable=True)
    activation_code = Column(String(20), nullable=True)  # For physical card activation

    # Lifecycle
    locked_at = Column(DateTime, nullable=True)
    locked_reason = Column(String(255), nullable=True)
    frozen_at = Column(DateTime, nullable=True)
    frozen_reason = Column(String(255), nullable=True)
    closed_at = Column(DateTime, nullable=True)
    closed_reason = Column(String(255), nullable=True)
    replaced_by_id = Column(UUID, ForeignKey(FIS_CARDS_ID), nullable=True)

    # Metadata
    is_primary = Column(Boolean, default=False)
    nickname = Column(String(100), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="fis_cards")
    controls = relationship("FISCardControl", back_populates="card", uselist=False)
    wallet_tokens = relationship("FISWalletToken", back_populates="card")

    __table_args__ = (
        CheckConstraint("card_type IN ('virtual', 'physical')"),
        CheckConstraint("status IN ('pending_activation', 'active', 'inactive', 'locked', 'frozen', 'lost', 'stolen', 'expired', 'closed')"),
        CheckConstraint("card_network IN ('visa', 'mastercard', 'discover', 'amex')"),
    )


class FISCardControl(Base):
    """
    FIS Global Payment One - Card Controls
    Stores user-configurable card settings (spending limits, merchant controls, etc.)
    """
    __tablename__ = "fis_card_controls"

    id = Column(UUID, primary_key=True, default=uuid4)
    card_id = Column(UUID, ForeignKey(FIS_CARDS_ID), unique=True, nullable=False, index=True)

    # Spending Limits
    daily_limit = Column(Numeric(10, 2), nullable=True)
    weekly_limit = Column(Numeric(10, 2), nullable=True)
    monthly_limit = Column(Numeric(10, 2), nullable=True)
    per_transaction_limit = Column(Numeric(10, 2), nullable=True)

    # Daily Spend Tracking
    daily_spent = Column(Numeric(10, 2), default=0)
    daily_spent_reset_at = Column(DateTime, nullable=True)

    # Channel Controls
    atm_enabled = Column(Boolean, default=True)
    pos_enabled = Column(Boolean, default=True)
    ecommerce_enabled = Column(Boolean, default=True)
    contactless_enabled = Column(Boolean, default=True)
    international_enabled = Column(Boolean, default=False)

    # Merchant Category Controls (JSON array of blocked MCC codes)
    blocked_mcc_codes = Column(JSONB, default=list)  # e.g., ["7995"] for gambling

    # Geographic Controls
    allowed_countries = Column(JSONB, default=lambda: ["US"])  # ISO country codes
    blocked_countries = Column(JSONB, default=list)

    # Time-based Controls
    allowed_hours_start = Column(Integer, nullable=True)  # 0-23
    allowed_hours_end = Column(Integer, nullable=True)  # 0-23
    allowed_days = Column(JSONB, default=lambda: [0, 1, 2, 3, 4, 5, 6])  # 0=Monday

    # Alert Preferences
    alert_on_transaction = Column(Boolean, default=True)
    alert_on_decline = Column(Boolean, default=True)
    alert_on_international = Column(Boolean, default=True)
    alert_threshold = Column(Numeric(10, 2), nullable=True)  # Alert on transactions above this

    # FIS Sync
    last_synced_to_fis = Column(DateTime, nullable=True)
    fis_sync_status = Column(String(50), default='pending')

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    card = relationship("FISCard", back_populates="controls")


class FISPinRequest(Base):
    """
    FIS Global Payment One - PIN Management Audit Trail
    Tracks all PIN-related operations for security and compliance
    """
    __tablename__ = "fis_pin_requests"

    id = Column(UUID, primary_key=True, default=uuid4)
    card_id = Column(UUID, ForeignKey(FIS_CARDS_ID), nullable=False, index=True)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)

    # Operation Details
    operation = Column(String(50), nullable=False)  # set, change, reset, validate
    status = Column(String(50), default='pending', nullable=False)
    fis_request_id = Column(String(100), nullable=True)

    # Security
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    device_id = Column(String(255), nullable=True)

    # Verification
    verification_method = Column(String(50), nullable=True)  # otp, biometric, security_questions
    verified_at = Column(DateTime, nullable=True)

    # Error Tracking
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    attempts = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    card = relationship("FISCard", backref="pin_requests")
    user = relationship("User", backref="fis_pin_requests")

    __table_args__ = (
        CheckConstraint("operation IN ('set', 'change', 'reset', 'validate')"),
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed', 'expired')"),
    )


class FISTransaction(Base):
    """
    FIS Global Payment One - Transaction Records
    Stores card transactions received from FIS (via webhooks or API polling)
    """
    __tablename__ = "fis_transactions"

    id = Column(UUID, primary_key=True, default=uuid4)
    card_id = Column(UUID, ForeignKey(FIS_CARDS_ID), nullable=False, index=True)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)

    # FIS Transaction Reference
    fis_transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    authorization_code = Column(String(50), nullable=True)

    # Transaction Details
    transaction_type = Column(String(50), nullable=False)  # purchase, atm_withdrawal, refund, etc.
    status = Column(String(50), default='pending', nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='USD')
    local_amount = Column(Numeric(12, 2), nullable=True)  # For international
    local_currency = Column(String(3), nullable=True)
    exchange_rate = Column(Numeric(10, 6), nullable=True)

    # Merchant Details
    merchant_name = Column(String(255), nullable=True)
    merchant_id = Column(String(100), nullable=True)
    merchant_category_code = Column(String(10), nullable=True)
    merchant_city = Column(String(100), nullable=True)
    merchant_state = Column(String(50), nullable=True)
    merchant_country = Column(String(3), nullable=True)
    merchant_postal = Column(String(20), nullable=True)

    # Transaction Metadata
    is_international = Column(Boolean, default=False)
    is_card_present = Column(Boolean, default=True)
    is_recurring = Column(Boolean, default=False)
    entry_mode = Column(String(50), nullable=True)  # chip, swipe, contactless, manual

    # Rewards (calculated locally)
    points_earned = Column(Integer, default=0)
    cashback_amount = Column(Numeric(10, 2), default=0)

    # Dispute Tracking
    is_disputed = Column(Boolean, default=False)
    dispute_id = Column(UUID, nullable=True)
    dispute_status = Column(String(50), nullable=True)

    # Timestamps
    transaction_at = Column(DateTime, nullable=False, index=True)  # FIS timestamp
    authorized_at = Column(DateTime, nullable=True)
    settled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    card = relationship("FISCard", backref="transactions")
    user = relationship("User", backref="fis_transactions")

    __table_args__ = (
        CheckConstraint("transaction_type IN ('purchase', 'atm_withdrawal', 'refund', 'transfer', 'fee', 'adjustment', 'reversal')"),
        CheckConstraint("status IN ('pending', 'authorized', 'completed', 'declined', 'reversed', 'disputed', 'settled')"),
    )


class FISWalletToken(Base):
    """
    FIS Global Payment One - Digital Wallet Tokens
    Tracks Apple Pay, Google Pay, and other digital wallet provisioning
    """
    __tablename__ = "fis_wallet_tokens"

    id = Column(UUID, primary_key=True, default=uuid4)
    card_id = Column(UUID, ForeignKey(FIS_CARDS_ID), nullable=False, index=True)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)

    # Token Details
    token_id = Column(String(100), unique=True, nullable=False, index=True)
    dpan_last_four = Column(String(4), nullable=True)  # Device PAN last 4
    wallet_type = Column(String(50), nullable=False)  # apple_pay, google_pay, samsung_pay
    token_status = Column(String(50), default='active', nullable=False)

    # Device Info
    device_id = Column(String(255), nullable=True)
    device_name = Column(String(255), nullable=True)
    device_type = Column(String(100), nullable=True)  # iPhone, Android, Watch

    # Lifecycle
    provisioned_at = Column(DateTime, nullable=False)
    suspended_at = Column(DateTime, nullable=True)
    resumed_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    card = relationship("FISCard", back_populates="wallet_tokens")
    user = relationship("User", backref="fis_wallet_tokens")

    __table_args__ = (
        CheckConstraint("wallet_type IN ('apple_pay', 'google_pay', 'samsung_pay', 'fitbit_pay', 'garmin_pay')"),
        CheckConstraint("token_status IN ('active', 'suspended', 'deleted', 'inactive')"),
    )


class FISKYCVerification(Base):
    """
    FIS Global - KYC Verification Records
    Tracks identity verification through FIS
    """
    __tablename__ = "fis_kyc_verifications"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)

    # FIS Reference
    fis_verification_id = Column(String(100), unique=True, nullable=False, index=True)

    # Verification Details
    verification_type = Column(String(50), nullable=False)  # identity, document, address, ofac
    status = Column(String(50), default='pending', nullable=False, index=True)
    risk_score = Column(Integer, nullable=True)  # 0-100

    # Results
    checks_passed = Column(JSONB, default=list)  # List of passed checks
    checks_failed = Column(JSONB, default=list)  # List of failed checks
    result_data = Column(JSONB, default=dict)  # Full verification result

    # Error Tracking
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)

    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="fis_kyc_verifications")

    __table_args__ = (
        CheckConstraint("verification_type IN ('identity', 'document', 'address', 'ofac', 'watchlist', 'credit')"),
        CheckConstraint("status IN ('pending', 'processing', 'approved', 'rejected', 'review_required', 'expired')"),
    )


class FISFraudAlert(Base):
    """
    FIS Global Payment One - Fraud Alerts
    Stores fraud alerts and suspicious activity notifications from FIS
    """
    __tablename__ = "fis_fraud_alerts"

    id = Column(UUID, primary_key=True, default=uuid4)
    card_id = Column(UUID, ForeignKey(FIS_CARDS_ID), nullable=True, index=True)
    user_id = Column(UUID, ForeignKey(USERS_ID), nullable=False, index=True)
    transaction_id = Column(UUID, ForeignKey(FIS_TRANSACTIONS_ID), nullable=True)

    # Alert Details
    fis_alert_id = Column(String(100), unique=True, nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), default='medium', nullable=False)
    status = Column(String(50), default='open', nullable=False, index=True)

    # Alert Data
    description = Column(Text, nullable=True)
    risk_score = Column(Integer, nullable=True)
    risk_factors = Column(JSONB, default=list)

    # Resolution
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(UUID, nullable=True)
    resolution_action = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Timestamps
    alerted_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    card = relationship("FISCard", backref="fraud_alerts")
    user = relationship("User", backref="fis_fraud_alerts")
    transaction = relationship("FISTransaction", backref="fraud_alerts")

    __table_args__ = (
        CheckConstraint("alert_type IN ('suspicious_transaction', 'velocity_breach', 'geo_anomaly', 'device_change', 'account_takeover', 'card_testing')"),
        CheckConstraint("severity IN ('low', 'medium', 'high', 'critical')"),
        CheckConstraint("status IN ('open', 'investigating', 'resolved', 'false_positive', 'escalated')"),
    )


# Export all models
__all__ = [
    # Core models
    "Base",
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
    # KYC models
    "UserKYCDocument",
    "UserKYCHistory",
    "OFACScreeningResult",
    # Wallet models
    "Wallet",
    "WalletTransaction",
    "PaymentMethod",
    "Payment",
    "Subscription",
    # Analytics
    "AnalyticsEvent",
    # RBAC models
    "Role",
    "Policy",
    "Permission",
    # Onboarding models
    "Charity",
    "MerchantOnboarding",
    # Preferred Merchants & Deals
    "MerchantSubscription",
    "PreferredMerchant",
    "MerchantDeal",
    # Notification models
    "DeviceToken",
    "NotificationHistory",
    "NotificationPreferences",
    "NotificationTemplate",
    # Form models
    "ContactFormSubmission",
    "DemoRequestSubmission",
    # FIS Global Card Management models
    "FISCard",
    "FISCardControl",
    "FISPinRequest",
    "FISTransaction",
    "FISWalletToken",
    "FISKYCVerification",
    "FISFraudAlert",
]
