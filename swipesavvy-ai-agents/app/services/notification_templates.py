"""
SwipeSavvy Notification Templates

Comprehensive email and SMS templates for the entire system workflow including:
- User Authentication (signup, login, password reset, verification)
- User Invitations
- KYC Verification
- Transactions & Payments
- Rewards & Cashback
- Marketing Campaigns
- Security Alerts
- Account Management
"""

from datetime import datetime
from typing import Optional, Dict, Any


# ============================================================================
# EMAIL TEMPLATES
# ============================================================================

class EmailTemplates:
    """All email templates for SwipeSavvy"""

    # Brand colors and styling
    BRAND_PRIMARY = "#6366f1"
    BRAND_SECONDARY = "#8b5cf6"
    BRAND_SUCCESS = "#10b981"
    BRAND_WARNING = "#f59e0b"
    BRAND_DANGER = "#ef4444"

    @staticmethod
    def _base_template(content: str, footer_text: str = "") -> str:
        """Base HTML email template with SwipeSavvy branding"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwipeSavvy</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .card {{
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }}
        .header .logo {{
            font-size: 32px;
            margin-bottom: 10px;
        }}
        .content {{
            padding: 30px;
        }}
        .content h2 {{
            color: #1f2937;
            margin-top: 0;
        }}
        .content p {{
            color: #4b5563;
            margin-bottom: 16px;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .button:hover {{
            opacity: 0.9;
        }}
        .button-secondary {{
            background: #e5e7eb;
            color: #374151 !important;
        }}
        .code-box {{
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }}
        .code {{
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6366f1;
            font-family: monospace;
        }}
        .info-box {{
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .success-box {{
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .warning-box {{
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .danger-box {{
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .transaction-details {{
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}
        .transaction-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }}
        .transaction-row:last-child {{
            border-bottom: none;
        }}
        .amount {{
            font-size: 28px;
            font-weight: 700;
            color: #10b981;
        }}
        .amount.negative {{
            color: #ef4444;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-size: 12px;
        }}
        .footer a {{
            color: #6366f1;
            text-decoration: none;
        }}
        .social-links {{
            margin: 16px 0;
        }}
        .social-links a {{
            margin: 0 8px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            {content}
        </div>
        <div class="footer">
            <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
            <p>
                <a href="https://swipesavvy.com/privacy">Privacy Policy</a> |
                <a href="https://swipesavvy.com/terms">Terms of Service</a> |
                <a href="https://swipesavvy.com/unsubscribe">Unsubscribe</a>
            </p>
            {footer_text}
        </div>
    </div>
</body>
</html>
"""

    # ========================================================================
    # AUTHENTICATION EMAILS
    # ========================================================================

    @classmethod
    def email_verification(cls, name: str, verification_code: str, verification_link: str) -> Dict[str, str]:
        """Email verification for new signups"""
        content = f"""
            <div class="header">
                <div class="logo">💳</div>
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Welcome to SwipeSavvy! To complete your registration and start earning rewards, please verify your email address.</p>

                <div class="code-box">
                    <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code:</p>
                    <div class="code">{verification_code}</div>
                </div>

                <p style="text-align: center;">Or click the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </p>

                <div class="info-box">
                    <strong>Note:</strong> This code expires in 15 minutes for security reasons.
                </div>

                <p>If you didn't create a SwipeSavvy account, please ignore this email.</p>
            </div>
        """
        return {
            "subject": "Verify your SwipeSavvy email",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your SwipeSavvy verification code is: {verification_code}. Or visit: {verification_link}. This code expires in 15 minutes."
        }

    @classmethod
    def welcome_email(cls, name: str) -> Dict[str, str]:
        """Welcome email after successful verification"""
        content = f"""
            <div class="header">
                <div class="logo">🎉</div>
                <h1>Welcome to SwipeSavvy!</h1>
            </div>
            <div class="content">
                <h2>You're all set, {name}!</h2>
                <p>Congratulations on joining SwipeSavvy! You're now ready to start earning cashback and rewards on every purchase.</p>

                <div class="success-box">
                    <strong>What's next?</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Link your debit or credit cards</li>
                        <li>Shop at participating merchants</li>
                        <li>Earn automatic cashback rewards</li>
                        <li>Track your earnings in real-time</li>
                    </ul>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/cards" class="button">Link Your First Card</a>
                </p>

                <p>Have questions? Our support team is here to help 24/7.</p>
            </div>
        """
        return {
            "subject": "Welcome to SwipeSavvy - Let's start earning! 🎉",
            "html_body": cls._base_template(content),
            "text_body": f"Welcome to SwipeSavvy, {name}! You're all set to start earning cashback and rewards. Link your first card at https://app.swipesavvy.com/cards"
        }

    @classmethod
    def password_reset(cls, name: str, reset_code: str, reset_link: str) -> Dict[str, str]:
        """Password reset request"""
        content = f"""
            <div class="header">
                <div class="logo">🔐</div>
                <h1>Reset Your Password</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>We received a request to reset your SwipeSavvy password. Use the code below or click the button to create a new password.</p>

                <div class="code-box">
                    <p style="margin: 0 0 10px 0; color: #6b7280;">Your reset code:</p>
                    <div class="code">{reset_code}</div>
                </div>

                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>

                <div class="warning-box">
                    <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, please secure your account immediately.
                </div>

                <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
        """
        return {
            "subject": "Reset your SwipeSavvy password",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your SwipeSavvy password reset code is: {reset_code}. Or visit: {reset_link}. This code expires in 1 hour."
        }

    @classmethod
    def password_changed(cls, name: str) -> Dict[str, str]:
        """Password change confirmation"""
        content = f"""
            <div class="header">
                <div class="logo">✅</div>
                <h1>Password Changed</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Your SwipeSavvy password has been successfully changed.</p>

                <div class="success-box">
                    <strong>Change confirmed</strong> on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
                </div>

                <div class="danger-box">
                    <strong>Didn't make this change?</strong> If you didn't change your password, your account may be compromised. Please contact our support team immediately.
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/support" class="button">Contact Support</a>
                </p>
            </div>
        """
        return {
            "subject": "Your SwipeSavvy password was changed",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your SwipeSavvy password was successfully changed on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}. If you didn't make this change, contact support immediately."
        }

    @classmethod
    def user_invitation(cls, name: str, invite_link: str, inviter_name: str = "SwipeSavvy") -> Dict[str, str]:
        """User invitation email"""
        content = f"""
            <div class="header">
                <div class="logo">💌</div>
                <h1>You're Invited!</h1>
            </div>
            <div class="content">
                <h2>Hi {name},</h2>
                <p>You've been invited to join SwipeSavvy, the smartest way to earn cashback and rewards on your everyday purchases!</p>

                <div class="info-box">
                    <strong>What is SwipeSavvy?</strong>
                    <p style="margin: 10px 0 0 0;">SwipeSavvy automatically earns you cashback when you shop at your favorite stores. No coupons, no scanning receipts - just swipe and save!</p>
                </div>

                <p style="text-align: center;">
                    <a href="{invite_link}" class="button">Accept Invitation</a>
                </p>

                <p>This invitation link will expire in 7 days.</p>

                <p>Questions? Reply to this email or visit our <a href="https://swipesavvy.com/help">Help Center</a>.</p>
            </div>
        """
        return {
            "subject": "You're invited to join SwipeSavvy! 💳",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, You've been invited to join SwipeSavvy! Accept your invitation here: {invite_link}. This link expires in 7 days."
        }

    # ========================================================================
    # KYC VERIFICATION EMAILS
    # ========================================================================

    @classmethod
    def kyc_submitted(cls, name: str) -> Dict[str, str]:
        """KYC documents submitted confirmation"""
        content = f"""
            <div class="header">
                <div class="logo">📋</div>
                <h1>Verification Submitted</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Thank you for submitting your verification documents. We're reviewing them now.</p>

                <div class="info-box">
                    <strong>What happens next?</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Our team will review your documents within 1-2 business days</li>
                        <li>We'll notify you once verification is complete</li>
                        <li>You can continue using SwipeSavvy with your current limits</li>
                    </ul>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/verification" class="button">Check Status</a>
                </p>
            </div>
        """
        return {
            "subject": "Verification documents received",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, We received your verification documents. Our team will review them within 1-2 business days. Check your status at https://app.swipesavvy.com/verification"
        }

    @classmethod
    def kyc_approved(cls, name: str, tier: str = "Tier 2") -> Dict[str, str]:
        """KYC verification approved"""
        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #10b981, #059669);">
                <div class="logo">✅</div>
                <h1>Verification Approved!</h1>
            </div>
            <div class="content">
                <h2>Congratulations, {name}!</h2>
                <p>Your identity verification has been approved. You now have access to {tier} features.</p>

                <div class="success-box">
                    <strong>Your new benefits:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Higher transaction limits</li>
                        <li>Priority cashback processing</li>
                        <li>Access to premium rewards</li>
                        <li>Faster withdrawals</li>
                    </ul>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/rewards" class="button">Explore Premium Rewards</a>
                </p>
            </div>
        """
        return {
            "subject": "Your verification is approved! ✅",
            "html_body": cls._base_template(content),
            "text_body": f"Congratulations {name}! Your identity verification has been approved. You now have access to {tier} features including higher limits and premium rewards."
        }

    @classmethod
    def kyc_rejected(cls, name: str, reason: str, can_retry: bool = True) -> Dict[str, str]:
        """KYC verification rejected"""
        retry_content = """
                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/verification" class="button">Submit New Documents</a>
                </p>
        """ if can_retry else ""

        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                <div class="logo">⚠️</div>
                <h1>Verification Issue</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>We were unable to verify your identity with the documents provided.</p>

                <div class="danger-box">
                    <strong>Reason:</strong> {reason}
                </div>

                <div class="info-box">
                    <strong>Common issues:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Document is expired or damaged</li>
                        <li>Photo is blurry or unclear</li>
                        <li>Information doesn't match your profile</li>
                        <li>Document type not accepted</li>
                    </ul>
                </div>

                {retry_content}

                <p>Need help? Contact our <a href="https://app.swipesavvy.com/support">support team</a>.</p>
            </div>
        """
        return {
            "subject": "Action needed: Verification issue",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, We couldn't verify your identity. Reason: {reason}. Please submit new documents at https://app.swipesavvy.com/verification"
        }

    # ========================================================================
    # TRANSACTION & PAYMENT EMAILS
    # ========================================================================

    @classmethod
    def transaction_receipt(cls, name: str, merchant: str, amount: float,
                           cashback: float, date: str, transaction_id: str) -> Dict[str, str]:
        """Transaction receipt with cashback earned"""
        content = f"""
            <div class="header">
                <div class="logo">🧾</div>
                <h1>Transaction Receipt</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Here's your receipt for your recent purchase at <strong>{merchant}</strong>.</p>

                <div class="transaction-details">
                    <div class="transaction-row">
                        <span>Merchant</span>
                        <strong>{merchant}</strong>
                    </div>
                    <div class="transaction-row">
                        <span>Date</span>
                        <span>{date}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Amount</span>
                        <span class="amount negative">-${amount:.2f}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Cashback Earned</span>
                        <span class="amount">+${cashback:.2f}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Transaction ID</span>
                        <span style="font-family: monospace; font-size: 12px;">{transaction_id}</span>
                    </div>
                </div>

                <div class="success-box">
                    <strong>You earned ${cashback:.2f} cashback!</strong> Keep shopping to earn more.
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/transactions" class="button">View All Transactions</a>
                </p>
            </div>
        """
        return {
            "subject": f"Receipt: ${amount:.2f} at {merchant} (+${cashback:.2f} cashback)",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your purchase of ${amount:.2f} at {merchant} earned you ${cashback:.2f} cashback! Transaction ID: {transaction_id}"
        }

    @classmethod
    def cashback_earned(cls, name: str, amount: float, merchant: str, total_balance: float) -> Dict[str, str]:
        """Cashback earned notification"""
        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #10b981, #059669);">
                <div class="logo">💰</div>
                <h1>Cashback Earned!</h1>
            </div>
            <div class="content">
                <h2 style="text-align: center;">
                    <span class="amount">+${amount:.2f}</span>
                </h2>
                <p style="text-align: center;">earned at <strong>{merchant}</strong></p>

                <div class="success-box" style="text-align: center;">
                    <p style="margin: 0;">Your total cashback balance:</p>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0 0 0; color: #10b981;">${total_balance:.2f}</p>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/rewards" class="button">View Rewards</a>
                </p>
            </div>
        """
        return {
            "subject": f"You earned ${amount:.2f} cashback! 💰",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, You earned ${amount:.2f} cashback at {merchant}! Your total balance is now ${total_balance:.2f}."
        }

    @classmethod
    def withdrawal_initiated(cls, name: str, amount: float, method: str,
                            estimated_arrival: str) -> Dict[str, str]:
        """Withdrawal request initiated"""
        content = f"""
            <div class="header">
                <div class="logo">💸</div>
                <h1>Withdrawal Initiated</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Your withdrawal request has been initiated.</p>

                <div class="transaction-details">
                    <div class="transaction-row">
                        <span>Amount</span>
                        <span class="amount">${amount:.2f}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Method</span>
                        <span>{method}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Estimated Arrival</span>
                        <span>{estimated_arrival}</span>
                    </div>
                </div>

                <div class="info-box">
                    <strong>Processing time:</strong> Withdrawals typically arrive within 1-3 business days depending on your bank.
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/wallet" class="button">Track Withdrawal</a>
                </p>
            </div>
        """
        return {
            "subject": f"Withdrawal of ${amount:.2f} initiated",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your withdrawal of ${amount:.2f} via {method} has been initiated. Estimated arrival: {estimated_arrival}"
        }

    @classmethod
    def withdrawal_completed(cls, name: str, amount: float, method: str) -> Dict[str, str]:
        """Withdrawal completed"""
        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #10b981, #059669);">
                <div class="logo">✅</div>
                <h1>Withdrawal Complete!</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Great news! Your withdrawal has been completed.</p>

                <div class="success-box" style="text-align: center;">
                    <p style="font-size: 24px; font-weight: bold; margin: 0; color: #10b981;">${amount:.2f}</p>
                    <p style="margin: 10px 0 0 0;">has been sent to your {method}</p>
                </div>

                <p>The funds should appear in your account shortly. If you don't see them within 24 hours, please contact your bank.</p>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/wallet" class="button">View Wallet</a>
                </p>
            </div>
        """
        return {
            "subject": f"Withdrawal of ${amount:.2f} complete! ✅",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, Your withdrawal of ${amount:.2f} to your {method} has been completed. The funds should appear shortly."
        }

    # ========================================================================
    # SECURITY EMAILS
    # ========================================================================

    @classmethod
    def new_device_login(cls, name: str, device: str, location: str,
                        ip_address: str, timestamp: str) -> Dict[str, str]:
        """New device login alert"""
        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                <div class="logo">🔔</div>
                <h1>New Device Login</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>A new device just signed in to your SwipeSavvy account.</p>

                <div class="transaction-details">
                    <div class="transaction-row">
                        <span>Device</span>
                        <span>{device}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Location</span>
                        <span>{location}</span>
                    </div>
                    <div class="transaction-row">
                        <span>IP Address</span>
                        <span>{ip_address}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Time</span>
                        <span>{timestamp}</span>
                    </div>
                </div>

                <div class="warning-box">
                    <strong>Was this you?</strong> If you don't recognize this activity, please secure your account immediately.
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/security" class="button">Review Security</a>
                    <a href="https://app.swipesavvy.com/security/lock" class="button button-secondary" style="margin-left: 10px;">Lock Account</a>
                </p>
            </div>
        """
        return {
            "subject": "New device login to your SwipeSavvy account",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, A new device ({device}) signed in to your account from {location} at {timestamp}. If this wasn't you, secure your account at https://app.swipesavvy.com/security"
        }

    @classmethod
    def suspicious_activity(cls, name: str, activity: str, recommendation: str) -> Dict[str, str]:
        """Suspicious activity detected"""
        content = f"""
            <div class="header" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                <div class="logo">⚠️</div>
                <h1>Security Alert</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>We detected unusual activity on your SwipeSavvy account.</p>

                <div class="danger-box">
                    <strong>Detected Activity:</strong>
                    <p style="margin: 10px 0 0 0;">{activity}</p>
                </div>

                <div class="info-box">
                    <strong>Recommended Action:</strong>
                    <p style="margin: 10px 0 0 0;">{recommendation}</p>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/security" class="button">Secure My Account</a>
                </p>

                <p>If you recognize this activity, you can ignore this email. Otherwise, please take action immediately.</p>
            </div>
        """
        return {
            "subject": "⚠️ Security Alert: Unusual activity detected",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, We detected unusual activity on your account: {activity}. Recommendation: {recommendation}. Secure your account at https://app.swipesavvy.com/security"
        }

    # ========================================================================
    # MARKETING EMAILS
    # ========================================================================

    @classmethod
    def promotional_offer(cls, name: str, headline: str, description: str,
                         offer_value: str, cta_text: str, cta_link: str,
                         expires: Optional[str] = None) -> Dict[str, str]:
        """Promotional marketing email"""
        expiry_html = f'<p style="color: #ef4444; text-align: center;">Offer expires: {expires}</p>' if expires else ""

        content = f"""
            <div class="header">
                <div class="logo">🎁</div>
                <h1>{headline}</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>{description}</p>

                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">EXCLUSIVE OFFER</p>
                    <p style="margin: 10px 0; font-size: 36px; font-weight: bold;">{offer_value}</p>
                </div>

                {expiry_html}

                <p style="text-align: center;">
                    <a href="{cta_link}" class="button">{cta_text}</a>
                </p>

                <p style="text-align: center; color: #9ca3af; font-size: 12px;">Don't miss out on this exclusive opportunity!</p>
            </div>
        """
        return {
            "subject": f"🎁 {headline}",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, {headline}! {description} {offer_value}. {cta_text}: {cta_link}"
        }

    @classmethod
    def weekly_summary(cls, name: str, total_spent: float, cashback_earned: float,
                      transactions_count: int, top_merchant: str) -> Dict[str, str]:
        """Weekly activity summary"""
        content = f"""
            <div class="header">
                <div class="logo">📊</div>
                <h1>Your Weekly Summary</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Here's how you did this week with SwipeSavvy:</p>

                <div class="transaction-details">
                    <div class="transaction-row">
                        <span>Total Spent</span>
                        <span>${total_spent:.2f}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Cashback Earned</span>
                        <span class="amount">+${cashback_earned:.2f}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Transactions</span>
                        <span>{transactions_count}</span>
                    </div>
                    <div class="transaction-row">
                        <span>Top Merchant</span>
                        <span>{top_merchant}</span>
                    </div>
                </div>

                <div class="success-box" style="text-align: center;">
                    <p style="margin: 0;">Keep up the great work! 🎉</p>
                </div>

                <p style="text-align: center;">
                    <a href="https://app.swipesavvy.com/rewards" class="button">View Full Report</a>
                </p>
            </div>
        """
        return {
            "subject": f"Your week in review: ${cashback_earned:.2f} earned! 📊",
            "html_body": cls._base_template(content),
            "text_body": f"Hi {name}, This week you spent ${total_spent:.2f} and earned ${cashback_earned:.2f} cashback across {transactions_count} transactions. Top merchant: {top_merchant}."
        }


# ============================================================================
# SMS TEMPLATES
# ============================================================================

class SMSTemplates:
    """All SMS templates for SwipeSavvy (max 160 characters)"""

    # ========================================================================
    # AUTHENTICATION SMS
    # ========================================================================

    @staticmethod
    def verification_code(code: str) -> str:
        """Phone verification OTP"""
        return f"SwipeSavvy: Your verification code is {code}. Valid for 10 minutes. Don't share this code with anyone."

    @staticmethod
    def login_code(code: str) -> str:
        """2FA login code"""
        return f"SwipeSavvy: Your login code is {code}. Valid for 5 minutes. If you didn't request this, ignore it."

    @staticmethod
    def password_reset_code(code: str) -> str:
        """Password reset code"""
        return f"SwipeSavvy: Your password reset code is {code}. Valid for 15 minutes. Don't share this code."

    # ========================================================================
    # TRANSACTION SMS
    # ========================================================================

    @staticmethod
    def transaction_alert(merchant: str, amount: float, cashback: float) -> str:
        """Transaction notification"""
        return f"SwipeSavvy: ${amount:.2f} at {merchant[:20]}. You earned ${cashback:.2f} cashback!"

    @staticmethod
    def large_transaction_alert(merchant: str, amount: float) -> str:
        """Large transaction security alert"""
        return f"SwipeSavvy Alert: ${amount:.2f} charge at {merchant[:15]}. Not you? Reply STOP or call support."

    @staticmethod
    def cashback_milestone(amount: float) -> str:
        """Cashback milestone reached"""
        return f"SwipeSavvy: Congrats! You've earned ${amount:.2f} in total cashback! Keep shopping to earn more."

    @staticmethod
    def withdrawal_initiated(amount: float) -> str:
        """Withdrawal started"""
        return f"SwipeSavvy: Withdrawal of ${amount:.2f} initiated. Expect funds in 1-3 business days."

    @staticmethod
    def withdrawal_completed(amount: float) -> str:
        """Withdrawal complete"""
        return f"SwipeSavvy: ${amount:.2f} has been deposited to your bank account. Enjoy!"

    # ========================================================================
    # SECURITY SMS
    # ========================================================================

    @staticmethod
    def new_device_alert(device: str) -> str:
        """New device login"""
        return f"SwipeSavvy: New login from {device[:30]}. Not you? Secure your account now."

    @staticmethod
    def suspicious_activity_alert() -> str:
        """Suspicious activity detected"""
        return "SwipeSavvy Alert: Unusual activity detected on your account. Please verify at app.swipesavvy.com/security"

    @staticmethod
    def account_locked() -> str:
        """Account locked notification"""
        return "SwipeSavvy: Your account has been locked for security. Contact support to unlock."

    # ========================================================================
    # KYC SMS
    # ========================================================================

    @staticmethod
    def kyc_approved() -> str:
        """KYC verification approved"""
        return "SwipeSavvy: Your identity verification is approved! Enjoy higher limits and premium features."

    @staticmethod
    def kyc_action_required() -> str:
        """KYC needs attention"""
        return "SwipeSavvy: Action needed on your verification. Please check your email for details."

    # ========================================================================
    # PROMOTIONAL SMS
    # ========================================================================

    @staticmethod
    def promotional_offer(offer: str, code: Optional[str] = None) -> str:
        """Promotional message"""
        if code:
            return f"SwipeSavvy: {offer[:80]} Use code: {code}. Shop now!"
        return f"SwipeSavvy: {offer[:100]} Shop now at app.swipesavvy.com"

    @staticmethod
    def referral_bonus(amount: float, friend_name: str) -> str:
        """Referral bonus earned"""
        return f"SwipeSavvy: {friend_name[:15]} joined! You earned ${amount:.2f} referral bonus. Keep sharing!"

    @staticmethod
    def limited_time_offer(offer: str, expires: str) -> str:
        """Time-sensitive offer"""
        return f"SwipeSavvy: {offer[:70]} Expires {expires}. Don't miss out!"


# ============================================================================
# NOTIFICATION SERVICE
# ============================================================================

class NotificationService:
    """Unified notification service using templates"""

    def __init__(self):
        self.email_templates = EmailTemplates()
        self.sms_templates = SMSTemplates()

    def get_email_template(self, template_name: str, **kwargs) -> Dict[str, str]:
        """Get an email template by name with parameters"""
        template_method = getattr(self.email_templates, template_name, None)
        if template_method and callable(template_method):
            return template_method(**kwargs)
        raise ValueError(f"Unknown email template: {template_name}")

    def get_sms_template(self, template_name: str, **kwargs) -> str:
        """Get an SMS template by name with parameters"""
        template_method = getattr(self.sms_templates, template_name, None)
        if template_method and callable(template_method):
            return template_method(**kwargs)
        raise ValueError(f"Unknown SMS template: {template_name}")


# Singleton instance
notification_service = NotificationService()
