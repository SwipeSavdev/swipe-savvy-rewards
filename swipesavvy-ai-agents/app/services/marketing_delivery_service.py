"""
Marketing Delivery Service using AWS SES and SNS

Handles delivery of marketing campaigns via:
- Email campaigns using AWS SES
- SMS campaigns using AWS SNS
- Promotional notifications

Integrates with AI Marketing service for automated campaign delivery.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from dataclasses import dataclass

from app.services.aws_ses_service import AWSSESService
from app.services.aws_sns_service import AWSSNSService

logger = logging.getLogger(__name__)


@dataclass
class CampaignRecipient:
    """Campaign recipient data"""
    user_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    name: str = "Valued Customer"
    preferences: Optional[Dict[str, Any]] = None


@dataclass
class CampaignContent:
    """Campaign content data"""
    campaign_id: str
    campaign_name: str
    subject: str
    headline: str
    description: str
    cta_text: str
    cta_link: str
    offer_value: Optional[str] = None
    offer_code: Optional[str] = None
    expires_at: Optional[datetime] = None


class MarketingDeliveryService:
    """
    Marketing campaign delivery service using AWS SES and SNS.
    Handles both email and SMS campaign delivery.
    """

    def __init__(self):
        self.ses_service = AWSSESService()
        self.sns_service = AWSSNSService()
        self.batch_size = int(os.getenv("MARKETING_BATCH_SIZE", "100"))
        self.rate_limit_delay = float(os.getenv("MARKETING_RATE_LIMIT_DELAY", "0.1"))

    async def send_email_campaign(
        self,
        content: CampaignContent,
        recipients: List[CampaignRecipient],
        track_opens: bool = True
    ) -> Dict[str, Any]:
        """
        Send email marketing campaign to multiple recipients.

        Args:
            content: Campaign content
            recipients: List of recipients
            track_opens: Whether to track email opens

        Returns:
            Delivery statistics
        """
        results = {
            "campaign_id": content.campaign_id,
            "total_recipients": len(recipients),
            "sent": 0,
            "failed": 0,
            "failed_emails": [],
            "started_at": datetime.utcnow().isoformat()
        }

        for i, recipient in enumerate(recipients):
            if not recipient.email:
                results["failed"] += 1
                continue

            try:
                html_body = self._build_email_html(content, recipient)
                text_body = self._build_email_text(content, recipient)

                success = await self.ses_service.send_email(
                    to_email=recipient.email,
                    subject=content.subject,
                    html_body=html_body,
                    text_body=text_body
                )

                if success:
                    results["sent"] += 1
                else:
                    results["failed"] += 1
                    results["failed_emails"].append(recipient.email)

                # Rate limiting
                if (i + 1) % self.batch_size == 0:
                    await asyncio.sleep(self.rate_limit_delay)

            except Exception as e:
                logger.error(f"Error sending email to {recipient.email}: {e}")
                results["failed"] += 1
                results["failed_emails"].append(recipient.email)

        results["completed_at"] = datetime.utcnow().isoformat()
        results["success_rate"] = (results["sent"] / results["total_recipients"] * 100) if results["total_recipients"] > 0 else 0

        logger.info(f"Email campaign {content.campaign_id} completed: {results['sent']}/{results['total_recipients']} sent")
        return results

    async def send_sms_campaign(
        self,
        content: CampaignContent,
        recipients: List[CampaignRecipient]
    ) -> Dict[str, Any]:
        """
        Send SMS marketing campaign to multiple recipients.

        Args:
            content: Campaign content
            recipients: List of recipients

        Returns:
            Delivery statistics
        """
        results = {
            "campaign_id": content.campaign_id,
            "total_recipients": len(recipients),
            "sent": 0,
            "failed": 0,
            "failed_phones": [],
            "started_at": datetime.utcnow().isoformat()
        }

        for i, recipient in enumerate(recipients):
            if not recipient.phone:
                results["failed"] += 1
                continue

            try:
                message = self._build_sms_message(content, recipient)

                result = await self.sns_service.send_promotional_sms(
                    to_phone=recipient.phone,
                    message=message
                )

                if result.get("success"):
                    results["sent"] += 1
                else:
                    results["failed"] += 1
                    results["failed_phones"].append(recipient.phone)

                # Rate limiting
                if (i + 1) % self.batch_size == 0:
                    await asyncio.sleep(self.rate_limit_delay)

            except Exception as e:
                logger.error(f"Error sending SMS to {recipient.phone}: {e}")
                results["failed"] += 1
                results["failed_phones"].append(recipient.phone)

        results["completed_at"] = datetime.utcnow().isoformat()
        results["success_rate"] = (results["sent"] / results["total_recipients"] * 100) if results["total_recipients"] > 0 else 0

        logger.info(f"SMS campaign {content.campaign_id} completed: {results['sent']}/{results['total_recipients']} sent")
        return results

    async def send_multichannel_campaign(
        self,
        content: CampaignContent,
        recipients: List[CampaignRecipient],
        channels: List[str] = None
    ) -> Dict[str, Any]:
        """
        Send marketing campaign via multiple channels.

        Args:
            content: Campaign content
            recipients: List of recipients
            channels: List of channels ('email', 'sms')

        Returns:
            Combined delivery statistics
        """
        if channels is None:
            channels = ["email", "sms"]

        results = {
            "campaign_id": content.campaign_id,
            "channels": channels,
            "started_at": datetime.utcnow().isoformat()
        }

        if "email" in channels:
            email_recipients = [r for r in recipients if r.email]
            results["email"] = await self.send_email_campaign(content, email_recipients)

        if "sms" in channels:
            sms_recipients = [r for r in recipients if r.phone]
            results["sms"] = await self.send_sms_campaign(content, sms_recipients)

        results["completed_at"] = datetime.utcnow().isoformat()
        return results

    def _build_email_html(self, content: CampaignContent, recipient: CampaignRecipient) -> str:
        """Build HTML email content for marketing campaign"""
        offer_section = ""
        if content.offer_value:
            offer_section = f"""
            <div style="background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">EXCLUSIVE OFFER</p>
                <p style="margin: 10px 0; font-size: 32px; font-weight: bold;">{content.offer_value}</p>
                {f'<p style="margin: 0; font-size: 14px;">Use code: <strong>{content.offer_code}</strong></p>' if content.offer_code else ''}
            </div>
            """

        expiry_text = ""
        if content.expires_at:
            expiry_text = f'<p style="color: #ef4444; font-size: 14px; text-align: center;">Offer expires: {content.expires_at.strftime("%B %d, %Y")}</p>'

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .unsubscribe {{ color: #999; font-size: 11px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">{content.headline}</h1>
                </div>
                <div class="content">
                    <p>Hi {recipient.name},</p>
                    <p>{content.description}</p>

                    {offer_section}

                    <p style="text-align: center;">
                        <a href="{content.cta_link}" class="button">{content.cta_text}</a>
                    </p>

                    {expiry_text}

                    <p>Don't miss out on this exclusive opportunity!</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} SwipeSavvy. All rights reserved.</p>
                    <p class="unsubscribe">
                        You're receiving this email because you're a SwipeSavvy member.
                        <br>
                        <a href="https://app.swipesavvy.com/unsubscribe" style="color: #999;">Unsubscribe</a> |
                        <a href="https://app.swipesavvy.com/preferences" style="color: #999;">Email Preferences</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

    def _build_email_text(self, content: CampaignContent, recipient: CampaignRecipient) -> str:
        """Build plain text email content for marketing campaign"""
        offer_text = ""
        if content.offer_value:
            offer_text = f"\n\nEXCLUSIVE OFFER: {content.offer_value}"
            if content.offer_code:
                offer_text += f"\nUse code: {content.offer_code}"

        expiry_text = ""
        if content.expires_at:
            expiry_text = f"\n\nOffer expires: {content.expires_at.strftime('%B %d, %Y')}"

        return f"""
Hi {recipient.name},

{content.headline}

{content.description}
{offer_text}

{content.cta_text}: {content.cta_link}
{expiry_text}

Don't miss out on this exclusive opportunity!

---
SwipeSavvy
https://swipesavvy.com

To unsubscribe: https://app.swipesavvy.com/unsubscribe
        """

    def _build_sms_message(self, content: CampaignContent, recipient: CampaignRecipient) -> str:
        """Build SMS message for marketing campaign"""
        # SMS has 160 char limit for single message
        message = f"SwipeSavvy: {content.headline}"

        if content.offer_value:
            message += f" - {content.offer_value}"

        if content.offer_code:
            message += f". Code: {content.offer_code}"

        # Add shortened CTA link if space permits
        max_length = 155  # Leave room for carrier additions
        if len(message) < max_length - 30:
            message += f". {content.cta_link}"

        # Truncate if too long
        if len(message) > max_length:
            message = message[:max_length-3] + "..."

        return message

    async def send_promotional_notification(
        self,
        user_email: str,
        user_phone: Optional[str],
        subject: str,
        message: str,
        offer_value: Optional[str] = None,
        cta_link: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a single promotional notification to a user.

        Args:
            user_email: User's email address
            user_phone: User's phone number (optional)
            subject: Email subject
            message: Promotional message
            offer_value: Value of offer (e.g., "20% off")
            cta_link: Call to action link

        Returns:
            Delivery results
        """
        results = {"email": None, "sms": None}

        # Send email
        if user_email:
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                    .offer {{ background: #10b981; color: white; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; margin: 15px 0; }}
                    .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SwipeSavvy</h1>
                    </div>
                    <div class="content">
                        <p>{message}</p>
                        {f'<div class="offer">{offer_value}</div>' if offer_value else ''}
                        {f'<p style="text-align: center;"><a href="{cta_link}" class="button">Learn More</a></p>' if cta_link else ''}
                    </div>
                </div>
            </body>
            </html>
            """

            results["email"] = await self.ses_service.send_email(
                to_email=user_email,
                subject=subject,
                html_body=html_body,
                text_body=message
            )

        # Send SMS
        if user_phone:
            sms_message = f"SwipeSavvy: {message[:100]}"
            if offer_value:
                sms_message = f"SwipeSavvy: {offer_value}! {message[:80]}"

            results["sms"] = await self.sns_service.send_promotional_sms(
                to_phone=user_phone,
                message=sms_message
            )

        return results

    async def send_ai_generated_campaign(
        self,
        campaign_data: Dict[str, Any],
        recipients: List[Dict[str, Any]],
        ai_copy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send AI-generated marketing campaign using AWS SES/SNS.

        Args:
            campaign_data: Campaign metadata from AI marketing service
            recipients: List of recipient dicts with user_id, email, phone, name
            ai_copy: AI-generated copy with headline, description, cta, selling_points

        Returns:
            Delivery results
        """
        # Build campaign content from AI-generated copy
        content = CampaignContent(
            campaign_id=campaign_data.get("campaign_id", str(datetime.utcnow().timestamp())),
            campaign_name=campaign_data.get("name", "AI Campaign"),
            subject=ai_copy.get("headline", campaign_data.get("name", "Special Offer from SwipeSavvy")),
            headline=ai_copy.get("headline", "Exclusive Offer Just for You"),
            description=ai_copy.get("description", campaign_data.get("description", "")),
            cta_text=ai_copy.get("cta", "Shop Now"),
            cta_link=campaign_data.get("cta_link", "https://app.swipesavvy.com/offers"),
            offer_value=f"{campaign_data.get('offer_value', '')} {campaign_data.get('offer_unit', '')}".strip() or None,
            offer_code=campaign_data.get("offer_code"),
            expires_at=None  # Could be calculated from duration_days
        )

        # Convert recipient dicts to CampaignRecipient objects
        campaign_recipients = [
            CampaignRecipient(
                user_id=r.get("user_id", ""),
                email=r.get("email"),
                phone=r.get("phone"),
                name=r.get("name", "Valued Customer")
            )
            for r in recipients
        ]

        # Determine channels based on recipient data
        has_emails = any(r.email for r in campaign_recipients)
        has_phones = any(r.phone for r in campaign_recipients)

        channels = []
        if has_emails:
            channels.append("email")
        if has_phones:
            channels.append("sms")

        return await self.send_multichannel_campaign(content, campaign_recipients, channels)


# Singleton instance
_marketing_delivery_service = None


def get_marketing_delivery_service() -> MarketingDeliveryService:
    """Get or create Marketing Delivery service"""
    global _marketing_delivery_service
    if _marketing_delivery_service is None:
        _marketing_delivery_service = MarketingDeliveryService()
    return _marketing_delivery_service
