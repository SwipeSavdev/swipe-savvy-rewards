# App initialization
# Re-export all models for backwards compatibility with routes
# Using lazy import to avoid circular dependency issues
def __getattr__(name):
    """Lazy import models to avoid circular imports."""
    from app.models import (
        AdminUser,
        AICampaign,
        AIModel,
        AnalyticsEvent,
        AuditLog,
        CampaignPerformance,
        Charity,
        DashboardAnalytic,
        FeatureFlag,
        Merchant,
        Payment,
        PaymentMethod,
        Permission,
        Policy,
        Role,
        Setting,
        Subscription,
        SupportTicket,
        User,
        Wallet,
        WalletTransaction,
    )

    models_map = {
        "User": User,
        "AdminUser": AdminUser,
        "Merchant": Merchant,
        "SupportTicket": SupportTicket,
        "FeatureFlag": FeatureFlag,
        "AICampaign": AICampaign,
        "AuditLog": AuditLog,
        "Setting": Setting,
        "AIModel": AIModel,
        "DashboardAnalytic": DashboardAnalytic,
        "CampaignPerformance": CampaignPerformance,
        "Wallet": Wallet,
        "WalletTransaction": WalletTransaction,
        "PaymentMethod": PaymentMethod,
        "Payment": Payment,
        "Subscription": Subscription,
        "AnalyticsEvent": AnalyticsEvent,
        "Role": Role,
        "Policy": Policy,
        "Permission": Permission,
        "Charity": Charity,
    }
    if name in models_map:
        return models_map[name]
    raise AttributeError(f"module 'app' has no attribute '{name}'")
