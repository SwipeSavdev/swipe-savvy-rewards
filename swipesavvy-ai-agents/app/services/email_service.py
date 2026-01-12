"""
Email Service for SwipeSavvy

Handles all email communications including:
- Email verification
- Password reset
- Welcome emails
- KYC status updates
- Transaction notifications

Uses AWS SES for email delivery (migrated from SMTP/SendGrid).
This module provides backward compatibility with existing code.
"""

import os
import logging
from typing import Optional
from datetime import datetime

from app.services.aws_ses_service import AWSSESService, aws_ses_service

logger = logging.getLogger(__name__)

# Email configuration - now using AWS SES
FROM_EMAIL = os.getenv("SES_FROM_EMAIL", os.getenv("FROM_EMAIL", "noreply@swipesavvy.com"))
FROM_NAME = os.getenv("SES_FROM_NAME", os.getenv("FROM_NAME", "SwipeSavvy"))


class EmailService:
    """
    Email service for sending transactional emails.
    Now uses AWS SES as the backend (migrated from SMTP/SendGrid).
    """

    def __init__(self):
        self.from_email = FROM_EMAIL
        self.from_name = FROM_NAME
        self._ses_service = AWSSESService()
        self.mock_mode = self._ses_service.mock_mode

        if self.mock_mode:
            logger.info("Email service running in MOCK mode - emails will be logged only")
        else:
            logger.info("Email service initialized with AWS SES")

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
        return await self._ses_service.send_email(to_email, subject, html_body, text_body)

    async def send_verification_email(
        self,
        to_email: str,
        verification_token: str,
        user_name: str = "User"
    ) -> bool:
        """Send email verification link"""
        return await self._ses_service.send_verification_email(to_email, verification_token, user_name)

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_token: str,
        user_name: str = "User"
    ) -> bool:
        """Send password reset link"""
        return await self._ses_service.send_password_reset_email(to_email, reset_token, user_name)

    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str = "User"
    ) -> bool:
        """Send welcome email after account verification"""
        return await self._ses_service.send_welcome_email(to_email, user_name)

    async def send_kyc_status_email(
        self,
        to_email: str,
        status: str,
        user_name: str = "User",
        rejection_reason: Optional[str] = None
    ) -> bool:
        """Send KYC status update email"""
        return await self._ses_service.send_kyc_status_email(to_email, status, user_name, rejection_reason)

    async def send_template_email(
        self,
        to_email: str,
        template_name: str,
        template_data: dict
    ) -> bool:
        """
        Send templated email using AWS SES.
        Provides backward compatibility with existing code.
        """
        return await self._ses_service.send_template_email(to_email, template_name, template_data)


# Singleton instance
email_service = EmailService()


# Convenience functions for backward compatibility
async def send_verification_email(to_email: str, token: str, name: str = "User") -> bool:
    """Convenience function to send verification email"""
    return await email_service.send_verification_email(to_email, token, name)


async def send_password_reset_email(to_email: str, token: str, name: str = "User") -> bool:
    """Convenience function to send password reset email"""
    return await email_service.send_password_reset_email(to_email, token, name)


async def send_welcome_email(to_email: str, name: str = "User") -> bool:
    """Convenience function to send welcome email"""
    return await email_service.send_welcome_email(to_email, name)


async def send_kyc_status_email(
    to_email: str,
    status: str,
    name: str = "User",
    rejection_reason: Optional[str] = None
) -> bool:
    """Convenience function to send KYC status email"""
    return await email_service.send_kyc_status_email(to_email, status, name, rejection_reason)
