"""
AWS SES Email Service for SwipeSavvy

Handles all email communications using AWS Simple Email Service (SES):
- Email verification
- Password reset
- Welcome emails
- KYC status updates
- Transaction notifications
- User invitations
- Security alerts
- Marketing campaigns

Replaces SendGrid with AWS SES for cost-effective, scalable email delivery.
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

from app.services.notification_templates import EmailTemplates, NotificationService, notification_service

logger = logging.getLogger(__name__)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
FROM_EMAIL = os.getenv("SES_FROM_EMAIL", "noreply@swipesavvy.com")
FROM_NAME = os.getenv("SES_FROM_NAME", "SwipeSavvy")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# For development/testing, enable mock mode
# In production (ECS), use IAM role - no access keys needed
# Set MOCK_EMAIL=true explicitly to enable mock mode
MOCK_EMAIL = os.getenv("MOCK_EMAIL", "true" if ENVIRONMENT == "development" else "false").lower() == "true"


class AWSSESService:
    """Email service using AWS Simple Email Service"""

    def __init__(self):
        self.from_email = FROM_EMAIL
        self.from_name = FROM_NAME
        self.mock_mode = MOCK_EMAIL
        self.client = None

        if not self.mock_mode:
            try:
                # Use explicit credentials if provided (local dev), otherwise use IAM role (ECS)
                if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
                    self.client = boto3.client(
                        'ses',
                        region_name=AWS_REGION,
                        aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                    )
                    logger.info(f"AWS SES service initialized with explicit credentials in region: {AWS_REGION}")
                else:
                    # ECS/Lambda: Use IAM role credentials automatically
                    self.client = boto3.client('ses', region_name=AWS_REGION)
                    logger.info(f"AWS SES service initialized with IAM role in region: {AWS_REGION}")
            except Exception as e:
                logger.error(f"Failed to initialize AWS SES client: {e}")
                self.mock_mode = True
        else:
            logger.info("AWS SES service running in MOCK mode - emails will be logged only")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email using AWS SES

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML content
            text_body: Plain text content (optional)

        Returns:
            True if sent successfully, False otherwise
        """
        if self.mock_mode:
            logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
            logger.debug(f"[MOCK EMAIL] Body: {html_body[:200]}...")
            return True

        try:
            # Build message body
            body = {'Html': {'Charset': 'UTF-8', 'Data': html_body}}
            if text_body:
                body['Text'] = {'Charset': 'UTF-8', 'Data': text_body}

            response = self.client.send_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destination={'ToAddresses': [to_email]},
                Message={
                    'Subject': {'Charset': 'UTF-8', 'Data': subject},
                    'Body': body
                }
            )

            message_id = response.get('MessageId')
            logger.info(f"Email sent successfully to {to_email}, MessageId: {message_id}")
            return True

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"AWS SES error ({error_code}): {error_message}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    async def send_raw_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        attachments: Optional[list] = None
    ) -> bool:
        """
        Send a raw email with attachments using AWS SES

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML content
            text_body: Plain text content
            attachments: List of attachment dicts with 'filename' and 'data' keys

        Returns:
            True if sent successfully, False otherwise
        """
        if self.mock_mode:
            logger.info(f"[MOCK RAW EMAIL] To: {to_email}, Subject: {subject}")
            return True

        try:
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            from email.mime.application import MIMEApplication

            msg = MIMEMultipart('mixed')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            # Create message body
            msg_body = MIMEMultipart('alternative')
            if text_body:
                msg_body.attach(MIMEText(text_body, 'plain', 'utf-8'))
            msg_body.attach(MIMEText(html_body, 'html', 'utf-8'))
            msg.attach(msg_body)

            # Add attachments
            if attachments:
                for attachment in attachments:
                    part = MIMEApplication(attachment['data'])
                    part.add_header(
                        'Content-Disposition',
                        'attachment',
                        filename=attachment['filename']
                    )
                    msg.attach(part)

            response = self.client.send_raw_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destinations=[to_email],
                RawMessage={'Data': msg.as_string()}
            )

            message_id = response.get('MessageId')
            logger.info(f"Raw email sent successfully to {to_email}, MessageId: {message_id}")
            return True

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"AWS SES raw email error ({error_code}): {error_message}")
            return False
        except Exception as e:
            logger.error(f"Failed to send raw email to {to_email}: {str(e)}")
            return False

    async def send_verification_email(
        self,
        to_email: str,
        verification_token: str,
        user_name: str = "User"
    ) -> bool:
        """Send email verification link"""
        base_url = os.getenv("APP_BASE_URL", "https://app.swipesavvy.com")
        verification_link = f"{base_url}/verify-email?token={verification_token}"

        subject = "Verify your SwipeSavvy account"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to SwipeSavvy!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Thank you for signing up for SwipeSavvy. Please verify your email address to complete your registration.</p>
                    <p style="text-align: center;">
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6366f1;">{verification_link}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {user_name},

        Thank you for signing up for SwipeSavvy. Please verify your email address by visiting:
        {verification_link}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.

        - The SwipeSavvy Team
        """

        return await self.send_email(to_email, subject, html_body, text_body)

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_token: str,
        user_name: str = "User"
    ) -> bool:
        """Send password reset link"""
        base_url = os.getenv("APP_BASE_URL", "https://app.swipesavvy.com")
        reset_link = f"{base_url}/reset-password?token={reset_token}"

        subject = "Reset your SwipeSavvy password"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6366f1;">{reset_link}</p>
                    <p>This link will expire in 1 hour.</p>
                    <div class="warning">
                        <strong>Didn't request this?</strong>
                        <p style="margin: 5px 0 0 0;">If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {user_name},

        We received a request to reset your password. Visit the link below to create a new password:
        {reset_link}

        This link will expire in 1 hour.

        If you didn't request this, please ignore this email.

        - The SwipeSavvy Team
        """

        return await self.send_email(to_email, subject, html_body, text_body)

    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str = "User"
    ) -> bool:
        """Send welcome email after account verification"""
        subject = "Welcome to SwipeSavvy - Your account is ready!"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #6366f1; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to SwipeSavvy!</h1>
                    <p>Your financial journey starts here</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your account is now verified and ready to use! Here's what you can do:</p>

                    <div class="feature">
                        <strong>Send & Receive Money</strong>
                        <p style="margin: 5px 0 0 0;">Transfer funds instantly to friends and family</p>
                    </div>

                    <div class="feature">
                        <strong>Earn Rewards</strong>
                        <p style="margin: 5px 0 0 0;">Get cashback on purchases at partner merchants</p>
                    </div>

                    <div class="feature">
                        <strong>Track Spending</strong>
                        <p style="margin: 5px 0 0 0;">View analytics and manage your finances</p>
                    </div>

                    <p style="text-align: center;">
                        <a href="https://app.swipesavvy.com" class="button">Open SwipeSavvy</a>
                    </p>

                    <p>Need help? Our support team is here 24/7.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(to_email, subject, html_body)

    async def send_kyc_status_email(
        self,
        to_email: str,
        status: str,
        user_name: str = "User",
        rejection_reason: Optional[str] = None
    ) -> bool:
        """Send KYC status update email"""
        if status == "approved":
            subject = "Your identity has been verified!"
            status_color = "#10b981"
            status_text = "Approved"
            message = "Great news! Your identity verification is complete. You now have full access to all SwipeSavvy features."
        elif status == "rejected":
            subject = "Identity verification needs attention"
            status_color = "#ef4444"
            status_text = "Action Required"
            message = f"Unfortunately, we couldn't verify your identity. {rejection_reason or 'Please review your documents and try again.'}"
        else:
            subject = "Your identity verification is in progress"
            status_color = "#f59e0b"
            status_text = "In Review"
            message = "We're currently reviewing your documents. This usually takes 1-2 business days."

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .status-badge {{ display: inline-block; background: {status_color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Identity Verification Update</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <span class="status-badge">{status_text}</span>
                    </p>
                    <p>{message}</p>
                    <p style="text-align: center;">
                        <a href="https://app.swipesavvy.com/settings/kyc" class="button">View Details</a>
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(to_email, subject, html_body)

    async def send_template_email(
        self,
        to_email: str,
        template_name: str,
        template_data: dict
    ) -> bool:
        """
        Send templated email using AWS SES templates.
        Falls back to inline templates if SES template not found.
        """
        if self.mock_mode:
            logger.info(f"[MOCK TEMPLATE EMAIL] To: {to_email}, Template: {template_name}")
            return True

        # Map template names to methods
        template_handlers = {
            'verification': lambda: self.send_verification_email(
                to_email,
                template_data.get('verification_token', ''),
                template_data.get('user_name', 'User')
            ),
            'password_reset': lambda: self.send_password_reset_email(
                to_email,
                template_data.get('reset_token', ''),
                template_data.get('user_name', 'User')
            ),
            'welcome': lambda: self.send_welcome_email(
                to_email,
                template_data.get('user_name', 'User')
            ),
            'kyc_status': lambda: self.send_kyc_status_email(
                to_email,
                template_data.get('status', 'pending'),
                template_data.get('user_name', 'User'),
                template_data.get('rejection_reason')
            )
        }

        handler = template_handlers.get(template_name)
        if handler:
            return await handler()

        logger.warning(f"Unknown template: {template_name}, sending generic email")
        return await self.send_email(
            to_email,
            template_data.get('subject', 'SwipeSavvy Notification'),
            template_data.get('html_body', '<p>You have a new notification from SwipeSavvy.</p>'),
            template_data.get('text_body')
        )

    # ========================================================================
    # NEW TEMPLATE-BASED EMAIL METHODS
    # ========================================================================

    async def send_user_invitation(
        self,
        to_email: str,
        name: str,
        invite_link: str,
        inviter_name: str = "SwipeSavvy"
    ) -> bool:
        """Send user invitation email using template"""
        template = EmailTemplates.user_invitation(name, invite_link, inviter_name)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_email_verification_with_code(
        self,
        to_email: str,
        name: str,
        verification_code: str,
        verification_link: str
    ) -> bool:
        """Send email verification with code using template"""
        template = EmailTemplates.email_verification(name, verification_code, verification_link)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_welcome_email_v2(self, to_email: str, name: str) -> bool:
        """Send welcome email using new template"""
        template = EmailTemplates.welcome_email(name)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_password_reset_with_code(
        self,
        to_email: str,
        name: str,
        reset_code: str,
        reset_link: str
    ) -> bool:
        """Send password reset email with code using template"""
        template = EmailTemplates.password_reset(name, reset_code, reset_link)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_password_changed_notification(self, to_email: str, name: str) -> bool:
        """Send password changed confirmation email"""
        template = EmailTemplates.password_changed(name)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_kyc_submitted_email(self, to_email: str, name: str) -> bool:
        """Send KYC submission confirmation email"""
        template = EmailTemplates.kyc_submitted(name)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_kyc_approved_email(
        self,
        to_email: str,
        name: str,
        tier: str = "Tier 2"
    ) -> bool:
        """Send KYC approval email"""
        template = EmailTemplates.kyc_approved(name, tier)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_kyc_rejected_email(
        self,
        to_email: str,
        name: str,
        reason: str,
        can_retry: bool = True
    ) -> bool:
        """Send KYC rejection email"""
        template = EmailTemplates.kyc_rejected(name, reason, can_retry)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_transaction_receipt_email(
        self,
        to_email: str,
        name: str,
        merchant: str,
        amount: float,
        cashback: float,
        date: str,
        transaction_id: str
    ) -> bool:
        """Send transaction receipt email with cashback earned"""
        template = EmailTemplates.transaction_receipt(
            name, merchant, amount, cashback, date, transaction_id
        )
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_cashback_earned_email(
        self,
        to_email: str,
        name: str,
        amount: float,
        merchant: str,
        total_balance: float
    ) -> bool:
        """Send cashback earned notification email"""
        template = EmailTemplates.cashback_earned(name, amount, merchant, total_balance)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_withdrawal_initiated_email(
        self,
        to_email: str,
        name: str,
        amount: float,
        method: str,
        estimated_arrival: str
    ) -> bool:
        """Send withdrawal initiated notification email"""
        template = EmailTemplates.withdrawal_initiated(name, amount, method, estimated_arrival)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_withdrawal_completed_email(
        self,
        to_email: str,
        name: str,
        amount: float,
        method: str
    ) -> bool:
        """Send withdrawal completed notification email"""
        template = EmailTemplates.withdrawal_completed(name, amount, method)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_new_device_login_email(
        self,
        to_email: str,
        name: str,
        device: str,
        location: str,
        ip_address: str,
        timestamp: str
    ) -> bool:
        """Send new device login alert email"""
        template = EmailTemplates.new_device_login(name, device, location, ip_address, timestamp)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_suspicious_activity_email(
        self,
        to_email: str,
        name: str,
        activity: str,
        recommendation: str
    ) -> bool:
        """Send suspicious activity alert email"""
        template = EmailTemplates.suspicious_activity(name, activity, recommendation)
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_promotional_offer_email(
        self,
        to_email: str,
        name: str,
        headline: str,
        description: str,
        offer_value: str,
        cta_text: str,
        cta_link: str,
        expires: Optional[str] = None
    ) -> bool:
        """Send promotional offer email"""
        template = EmailTemplates.promotional_offer(
            name, headline, description, offer_value, cta_text, cta_link, expires
        )
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    async def send_weekly_summary_email(
        self,
        to_email: str,
        name: str,
        total_spent: float,
        cashback_earned: float,
        transactions_count: int,
        top_merchant: str
    ) -> bool:
        """Send weekly activity summary email"""
        template = EmailTemplates.weekly_summary(
            name, total_spent, cashback_earned, transactions_count, top_merchant
        )
        return await self.send_email(
            to_email,
            template["subject"],
            template["html_body"],
            template["text_body"]
        )

    def verify_email_identity(self, email: str) -> bool:
        """
        Verify an email identity with AWS SES.
        Required before sending from a new email address in sandbox mode.
        """
        if self.mock_mode:
            logger.info(f"[MOCK] Would verify email identity: {email}")
            return True

        try:
            self.client.verify_email_identity(EmailAddress=email)
            logger.info(f"Verification email sent to {email}")
            return True
        except ClientError as e:
            logger.error(f"Failed to verify email identity: {e}")
            return False

    def get_send_quota(self) -> dict:
        """Get current SES sending quota and statistics"""
        if self.mock_mode:
            return {
                "max_24_hour_send": 200,
                "max_send_rate": 1,
                "sent_last_24_hours": 0,
                "mock_mode": True
            }

        try:
            response = self.client.get_send_quota()
            return {
                "max_24_hour_send": response.get('Max24HourSend', 0),
                "max_send_rate": response.get('MaxSendRate', 0),
                "sent_last_24_hours": response.get('SentLast24Hours', 0)
            }
        except ClientError as e:
            logger.error(f"Failed to get SES quota: {e}")
            return {}


# Singleton instance
aws_ses_service = AWSSESService()


# Convenience functions for backward compatibility
async def send_verification_email(to_email: str, token: str, name: str = "User") -> bool:
    """Convenience function to send verification email"""
    return await aws_ses_service.send_verification_email(to_email, token, name)


async def send_password_reset_email(to_email: str, token: str, name: str = "User") -> bool:
    """Convenience function to send password reset email"""
    return await aws_ses_service.send_password_reset_email(to_email, token, name)


async def send_welcome_email(to_email: str, name: str = "User") -> bool:
    """Convenience function to send welcome email"""
    return await aws_ses_service.send_welcome_email(to_email, name)


async def send_kyc_status_email(
    to_email: str,
    status: str,
    name: str = "User",
    rejection_reason: Optional[str] = None
) -> bool:
    """Convenience function to send KYC status email"""
    return await aws_ses_service.send_kyc_status_email(to_email, status, name, rejection_reason)
