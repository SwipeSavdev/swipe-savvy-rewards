"""
Website Forms Handler - Contact form, demo request, and sales inquiry endpoints

These endpoints handle form submissions from swipesavvy.com and send automated
email responses using AWS SES templates.
"""

import json
import logging
import os
from datetime import datetime
from typing import Optional
from enum import Enum

import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, EmailStr

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["website-forms"])

# AWS SES Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
SES_SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "noreply@swipesavvy.com")
SES_SALES_EMAIL = os.getenv("SES_SALES_EMAIL", "sales@swipesavvy.com")
SES_CONFIGURATION_SET = os.getenv("SES_CONFIGURATION_SET", "swipesavvy-production")


class InquiryType(str, Enum):
    """Type of inquiry from contact form"""
    DEMO = "demo"
    SALES = "sales"
    SUPPORT = "support"
    PARTNERSHIP = "partnership"
    OTHER = "other"


class ContactFormRequest(BaseModel):
    """Request model for contact form submission"""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    company: Optional[str] = Field(None, max_length=100, description="Company name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    inquiry_type: Optional[InquiryType] = Field(InquiryType.DEMO, description="Type of inquiry")
    message: Optional[str] = Field(None, max_length=2000, description="Message or additional details")
    locations: Optional[str] = Field(None, description="Number of locations")
    industry: Optional[str] = Field(None, description="Industry/business type")


class SalesInquiryRequest(BaseModel):
    """Request model for sales inquiry"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    message: str = Field(..., min_length=10, max_length=2000)
    locations: Optional[str] = None
    industry: Optional[str] = None
    current_pos: Optional[str] = Field(None, description="Current POS system")


def get_ses_client():
    """Get AWS SES client"""
    return boto3.client("sesv2", region_name=AWS_REGION)


def send_templated_email(
    template_name: str,
    to_email: str,
    template_data: dict,
    reply_to: Optional[str] = None
) -> bool:
    """
    Send email using SES template

    Args:
        template_name: Name of the SES template
        to_email: Recipient email address
        template_data: Dictionary of template variables
        reply_to: Optional reply-to email address

    Returns:
        True if successful, False otherwise
    """
    try:
        ses = get_ses_client()

        email_params = {
            "FromEmailAddress": SES_SENDER_EMAIL,
            "Destination": {
                "ToAddresses": [to_email]
            },
            "Content": {
                "Template": {
                    "TemplateName": template_name,
                    "TemplateData": json.dumps(template_data)
                }
            },
            "ConfigurationSetName": SES_CONFIGURATION_SET
        }

        if reply_to:
            email_params["ReplyToAddresses"] = [reply_to]

        response = ses.send_email(**email_params)
        logger.info(f"Email sent successfully: {response['MessageId']}")
        return True

    except ClientError as e:
        logger.error(f"Failed to send email: {e.response['Error']['Message']}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending email: {str(e)}")
        return False


def send_internal_notification(
    subject: str,
    to_email: str,
    body_text: str,
    body_html: str
) -> bool:
    """Send internal notification email to sales/support team"""
    try:
        ses = get_ses_client()

        response = ses.send_email(
            FromEmailAddress=SES_SENDER_EMAIL,
            Destination={
                "ToAddresses": [to_email]
            },
            Content={
                "Simple": {
                    "Subject": {"Data": subject},
                    "Body": {
                        "Text": {"Data": body_text},
                        "Html": {"Data": body_html}
                    }
                }
            },
            ConfigurationSetName=SES_CONFIGURATION_SET
        )
        logger.info(f"Internal notification sent: {response['MessageId']}")
        return True

    except Exception as e:
        logger.error(f"Failed to send internal notification: {str(e)}")
        return False


async def process_contact_form(request: ContactFormRequest):
    """Background task to process contact form and send emails"""

    # Determine which template to use based on inquiry type
    if request.inquiry_type == InquiryType.DEMO:
        template_name = "website-demo-request-response"
    elif request.inquiry_type == InquiryType.SALES:
        template_name = "website-sales-inquiry-response"
    else:
        template_name = "website-contact-form-response"

    # Prepare template data
    first_name = request.name.split()[0] if request.name else "there"
    template_data = {
        "name": first_name,
        "full_name": request.name,
        "company": request.company or "your company",
        "year": str(datetime.now().year)
    }

    # Send auto-response to the visitor
    send_templated_email(
        template_name=template_name,
        to_email=request.email,
        template_data=template_data,
        reply_to=SES_SALES_EMAIL
    )

    # Send internal notification to sales team
    inquiry_label = request.inquiry_type.value.upper() if request.inquiry_type else "GENERAL"
    subject = f"[{inquiry_label}] New inquiry from {request.name}"

    body_text = f"""
New website inquiry received:

Name: {request.name}
Email: {request.email}
Company: {request.company or 'Not provided'}
Phone: {request.phone or 'Not provided'}
Inquiry Type: {request.inquiry_type.value if request.inquiry_type else 'Not specified'}
Locations: {request.locations or 'Not provided'}
Industry: {request.industry or 'Not provided'}

Message:
{request.message or 'No message provided'}

---
Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
"""

    body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background: #FFC20E; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .field {{ margin-bottom: 12px; }}
        .label {{ font-weight: bold; color: #666; }}
        .value {{ margin-left: 10px; }}
        .message-box {{ background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }}
        .footer {{ background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin: 0; color: #0b0f19;">New {inquiry_label} Inquiry</h2>
    </div>
    <div class="content">
        <div class="field">
            <span class="label">Name:</span>
            <span class="value">{request.name}</span>
        </div>
        <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:{request.email}">{request.email}</a></span>
        </div>
        <div class="field">
            <span class="label">Company:</span>
            <span class="value">{request.company or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Phone:</span>
            <span class="value">{request.phone or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Inquiry Type:</span>
            <span class="value">{request.inquiry_type.value if request.inquiry_type else 'Not specified'}</span>
        </div>
        <div class="field">
            <span class="label">Locations:</span>
            <span class="value">{request.locations or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Industry:</span>
            <span class="value">{request.industry or 'Not provided'}</span>
        </div>

        <div class="message-box">
            <div class="label">Message:</div>
            <p>{request.message or 'No message provided'}</p>
        </div>
    </div>
    <div class="footer">
        Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
    </div>
</body>
</html>
"""

    send_internal_notification(
        subject=subject,
        to_email=SES_SALES_EMAIL,
        body_text=body_text,
        body_html=body_html
    )


async def process_sales_inquiry(request: SalesInquiryRequest):
    """Background task to process sales inquiry and send emails"""

    first_name = request.name.split()[0] if request.name else "there"
    template_data = {
        "name": first_name,
        "full_name": request.name,
        "company": request.company,
        "year": str(datetime.now().year)
    }

    # Send auto-response
    send_templated_email(
        template_name="website-sales-inquiry-response",
        to_email=request.email,
        template_data=template_data,
        reply_to=SES_SALES_EMAIL
    )

    # Send internal notification
    subject = f"[SALES INQUIRY] {request.company} - {request.name}"

    body_text = f"""
New sales inquiry received:

Name: {request.name}
Email: {request.email}
Company: {request.company}
Phone: {request.phone or 'Not provided'}
Locations: {request.locations or 'Not provided'}
Industry: {request.industry or 'Not provided'}
Current POS: {request.current_pos or 'Not provided'}

Message:
{request.message}

---
Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
"""

    body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 20px; text-align: center; }}
        .header h2 {{ color: white; margin: 0; }}
        .content {{ padding: 20px; }}
        .field {{ margin-bottom: 12px; }}
        .label {{ font-weight: bold; color: #666; }}
        .value {{ margin-left: 10px; }}
        .message-box {{ background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }}
        .footer {{ background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
        .priority {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 15px; }}
    </style>
</head>
<body>
    <div class="header">
        <h2>Sales Inquiry</h2>
    </div>
    <div class="content">
        <div class="priority">
            <strong>Company:</strong> {request.company}<br>
            <strong>Contact:</strong> {request.name}
        </div>

        <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:{request.email}">{request.email}</a></span>
        </div>
        <div class="field">
            <span class="label">Phone:</span>
            <span class="value">{request.phone or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Locations:</span>
            <span class="value">{request.locations or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Industry:</span>
            <span class="value">{request.industry or 'Not provided'}</span>
        </div>
        <div class="field">
            <span class="label">Current POS:</span>
            <span class="value">{request.current_pos or 'Not provided'}</span>
        </div>

        <div class="message-box">
            <div class="label">Message:</div>
            <p>{request.message}</p>
        </div>
    </div>
    <div class="footer">
        Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
    </div>
</body>
</html>
"""

    send_internal_notification(
        subject=subject,
        to_email=SES_SALES_EMAIL,
        body_text=body_text,
        body_html=body_html
    )


@router.post("/contact")
async def handle_contact_form(
    request: ContactFormRequest,
    background_tasks: BackgroundTasks
):
    """
    Handle contact form submission from swipesavvy.com

    This endpoint:
    1. Validates the form data
    2. Sends an auto-response email to the visitor
    3. Sends a notification to the sales team

    The email sending happens in the background so the visitor gets
    immediate feedback.
    """
    logger.info(f"Contact form submission from {request.email}")

    # Add background task for email processing
    background_tasks.add_task(process_contact_form, request)

    return {
        "success": True,
        "message": "Thank you for your inquiry! We'll be in touch soon.",
        "inquiry_type": request.inquiry_type.value if request.inquiry_type else "general"
    }


@router.post("/demo-request")
async def handle_demo_request(
    request: ContactFormRequest,
    background_tasks: BackgroundTasks
):
    """
    Handle demo request form submission

    Similar to contact form but specifically for demo requests.
    Uses the demo-request email template.
    """
    logger.info(f"Demo request from {request.email}")

    # Force inquiry type to DEMO
    request.inquiry_type = InquiryType.DEMO

    # Add background task for email processing
    background_tasks.add_task(process_contact_form, request)

    return {
        "success": True,
        "message": "Thank you for requesting a demo! Our team will contact you within 24 hours.",
        "inquiry_type": "demo"
    }


@router.post("/sales-inquiry")
async def handle_sales_inquiry(
    request: SalesInquiryRequest,
    background_tasks: BackgroundTasks
):
    """
    Handle sales inquiry form submission

    For more detailed sales inquiries with company information.
    """
    logger.info(f"Sales inquiry from {request.company} - {request.email}")

    # Add background task for email processing
    background_tasks.add_task(process_sales_inquiry, request)

    return {
        "success": True,
        "message": "Thank you for your interest! A sales representative will contact you shortly.",
        "company": request.company
    }


@router.get("/forms/health")
async def health_check():
    """Health check for website forms service"""
    try:
        ses = get_ses_client()
        # Quick check that SES is accessible
        ses.get_account()
        ses_status = "healthy"
    except Exception as e:
        logger.error(f"SES health check failed: {e}")
        ses_status = "degraded"

    return {
        "status": ses_status,
        "service": "website-forms",
        "sender_email": SES_SENDER_EMAIL,
        "configuration_set": SES_CONFIGURATION_SET
    }
