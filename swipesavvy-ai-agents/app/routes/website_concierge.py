"""
Website AI Concierge - Public-facing chatbot for Swipe Savvy website visitors

This endpoint provides AI-powered support for potential customers visiting swipesavvy.com.
It has comprehensive knowledge about Swipe Savvy products, pricing, features, and can help
visitors understand the platform and guide them toward demos/signups.
"""

import json
import logging
import os
import time
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from together import Together

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/website-concierge", tags=["website-concierge"])

SSE_DONE = "data: [DONE]\n\n"

# Comprehensive Swipe Savvy knowledge base
SWIPESAVVY_KNOWLEDGE = """
# SWIPE SAVVY PLATFORM KNOWLEDGE BASE

## COMPANY OVERVIEW
Swipe Savvy is an all-in-one retail technology platform that combines:
- Cloud POS (Point of Sale) system
- Customer Rewards Wallet
- Loyalty Programs
- Customer Data Platform (CDP)
- AI-Powered Analytics (Savvy AI)

Founded in 2024, Swipe Savvy serves 10,000+ merchants worldwide and has processed over $2B in transactions.
Headquarters: Wilmington, Delaware, USA

## CORE PRODUCTS

### 1. SHOP SAVVY POS (Point of Sale)
Our flagship cloud-based POS system designed for modern retail.

**Key Features:**
- Offline-First Architecture: Never lose a sale due to connectivity issues. Transactions sync automatically when connection restored.
- Multi-Location Management: Unified dashboard for all store locations
- Real-Time Inventory: Track stock levels across all channels
- Multiple Payment Methods: Credit/debit, mobile wallets, cash, gift cards
- Employee Management: Clock-in/out, permissions, sales tracking
- Hardware Agnostic: Works with existing POS hardware or our recommended devices
- 99.9% Uptime SLA: Enterprise-grade reliability with AWS infrastructure

**Supported Hardware:**
- Receipt printers (Star, Epson)
- Cash drawers
- Barcode scanners
- Payment terminals (PAX, Verifone, Square)
- Customer-facing displays
- Kitchen display systems (KDS)

### 2. REWARDS WALLET (Customer Mobile App)
The customer-facing mobile app where shoppers earn and redeem rewards.

**For Customers:**
- Digital rewards wallet - see points balance in real-time
- Digital receipts stored automatically
- Personalized offers based on shopping behavior
- Store locator for participating merchants
- Push notifications for rewards and promotions
- No plastic cards needed - phone number or QR code at checkout

**For Merchants:**
- Increased customer retention
- Valuable customer data and insights
- Reduced churn through engagement
- Automated birthday/anniversary rewards

### 3. CUSTOMER DATA PLATFORM (CDP)
Enterprise-grade customer data management.

**Capabilities:**
- Unified Customer Profiles: Merge data from POS, ecommerce, and mobile
- Real-Time Identity Resolution: Recognize customers across channels
- Cohort Builder: Create segments based on behavior, demographics, spend
- Event-Driven Activation: Trigger campaigns based on customer actions
- Data Exports: Export to marketing tools, BI platforms, data warehouses
- Privacy Compliant: GDPR and CCPA ready

### 4. MERCHANT LOYALTY SOLUTION
Open-loop loyalty that works at checkout.

**Features:**
- Points System: Customizable earn rates (e.g., 1 point per $1)
- Tier Programs: Bronze, Silver, Gold, Platinum levels
- Gamification: Challenges, streaks, bonus events
- Instant Redemption: Use points at checkout immediately
- Coalition Loyalty: Customers earn/redeem across multiple merchants
- Full Analytics: Track program performance and ROI

### 5. SAVVY AI (Artificial Intelligence)
AI capabilities built into the platform.

**AI Modules:**
1. **AI Marketing Automation**:
   - Automated campaign creation
   - Customer segmentation
   - Personalized offers via SMS, email, push
   - A/B testing optimization

2. **AI Business Intelligence**:
   - Sales forecasting
   - Demand prediction
   - Inventory optimization
   - Anomaly detection (fraud, errors)

3. **AI Order Suggestions**:
   - Real-time upsell/cross-sell at checkout
   - Personalized recommendations
   - Increase average order value

4. **AI Menu Optimization** (for restaurants):
   - Menu engineering insights
   - Pricing recommendations
   - Item placement optimization

5. **AI Support Concierge**:
   - 24/7 self-service support
   - Instant answers to common questions
   - Troubleshooting guides

## INDUSTRIES WE SERVE

### Retail
- Apparel & fashion
- Electronics & appliances
- Home goods & furniture
- Sporting goods
- General merchandise

**Retail-Specific Features:**
- Size/color matrix inventory
- Returns and exchanges
- Gift registry
- Layaway management
- Sales associate tracking

### QSR & Restaurants
- Fast casual
- Quick service
- Coffee shops
- Food trucks
- Ghost kitchens

**Restaurant-Specific Features:**
- Kitchen Display System (KDS)
- Menu modifiers and combos
- Table management
- Order ahead/pickup
- Delivery integration
- Tip management

### Grocery & Convenience
- Supermarkets
- Convenience stores
- Specialty food stores
- Liquor stores

**Grocery-Specific Features:**
- PLU code lookup
- Perishables management (FIFO/FEFO)
- Age verification
- Scale integration
- EBT/SNAP acceptance

### Healthcare & Medical Retail
- Pharmacies
- Medical supply stores
- Optical shops
- DME suppliers

**Healthcare-Specific Features:**
- HIPAA compliance
- NDC code support
- Lot tracking
- Prescription integration
- FSA/HSA processing

### Jewelry & Luxury
- Fine jewelry
- Watches
- High-end accessories
- Luxury goods

**Jewelry-Specific Features:**
- Serialized inventory
- Certificate management
- Appraisal tracking
- Layaway with flexible terms
- High-value item approvals

### Warehouse & Distribution
- Wholesale operations
- Distribution centers
- B2B sales

**Warehouse-Specific Features:**
- WMS-lite capabilities
- LPN/carton tracking
- Bin location management
- Pick/pack/ship workflows
- ATP (Available to Promise)

## PRICING

### Starter Plan - $49/month base + $19/location/month
- Up to 3 locations
- Core POS features
- Basic inventory
- Email support
- Standard reporting

### Professional Plan - $99/month base + $29/location/month
- Up to 10 locations
- Advanced inventory
- Loyalty program
- Basic CDP features
- Priority support
- Advanced reporting
- API access

### Enterprise Plan - Custom pricing
- Unlimited locations
- Full CDP capabilities
- Custom integrations
- Dedicated success manager
- SLA guarantees
- White-label options
- Advanced security features

### Add-Ons:
- Savvy AI Marketing: +$49/month
- Advanced Analytics: +$29/month
- Multi-currency: +$19/month
- Custom integrations: Contact sales

**No long-term contracts required. Month-to-month available.**

## PAYMENT PROCESSING
Swipe Savvy offers integrated payment processing with competitive rates:
- Card-present: 2.6% + $0.10
- Card-not-present: 2.9% + $0.30
- ACH/bank transfer: 0.8% (min $0.25)

Or bring your own processor - we integrate with:
- Stripe
- Square
- PayPal/Braintree
- Adyen
- Worldpay
- First Data

## INTEGRATIONS
Swipe Savvy integrates with 100+ platforms:

**Accounting:**
- QuickBooks
- Xero
- FreshBooks

**Ecommerce:**
- Shopify
- WooCommerce
- BigCommerce
- Magento

**Marketing:**
- Mailchimp
- Klaviyo
- HubSpot
- Salesforce Marketing Cloud

**Delivery:**
- DoorDash
- UberEats
- Grubhub
- Postmates

**Other:**
- Zapier (1000+ apps)
- Custom API access

## SUPPORT & CONTACT

**Phone:** 1-800-505-8769
**Email:** support@swipesavvy.com (support), sales@swipesavvy.com (sales)
**Hours:** 24/7 for Enterprise, Mon-Fri 8am-8pm ET for others

**Support Resources:**
- Help Center with 500+ articles
- Video tutorials
- Live chat (business hours)
- Community forum
- Implementation guides

## GETTING STARTED
1. Schedule a demo at swipesavvy.com/contact
2. Our team will assess your needs
3. Get a customized quote
4. Self-service onboarding in under 30 minutes
5. Go live with full support

**Free Trial:** 14-day free trial available for Starter and Professional plans.

## SECURITY & COMPLIANCE
- PCI DSS Level 1 certified
- SOC 2 Type II compliant
- GDPR and CCPA compliant
- End-to-end encryption
- Regular security audits
- AWS infrastructure with 99.9% uptime

## FREQUENTLY ASKED QUESTIONS

Q: Does Swipe Savvy work offline?
A: Yes! Our offline-first architecture ensures you never miss a sale. Transactions are stored locally and sync automatically when internet is restored.

Q: Can I use my existing hardware?
A: Yes, Swipe Savvy works with most standard POS hardware including receipt printers, cash drawers, barcode scanners, and payment terminals.

Q: How long does setup take?
A: Self-service onboarding takes about 30 minutes. Our team can also provide white-glove setup for larger deployments.

Q: Do you offer training?
A: Yes, we provide free onboarding training, video tutorials, and detailed documentation. Enterprise customers get dedicated training sessions.

Q: Can I migrate from another POS?
A: Yes, we offer free migration assistance including product catalog import, customer data migration, and historical transaction import.

Q: Is there a contract?
A: No long-term contracts required. All plans are available month-to-month with no cancellation fees.

Q: What's the Rewards Wallet?
A: The Rewards Wallet is our customer mobile app where shoppers track points, view digital receipts, and redeem rewards at participating merchants.
"""


class WebsiteConciergeRequest(BaseModel):
    """Request model for website visitor chat"""
    message: str = Field(..., description="Visitor's message/question")
    user_id: str = Field(default="anonymous", description="Visitor ID (can be anonymous)")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    page_context: Optional[str] = Field(None, description="Which page the visitor is on")


# Build the system prompt for website visitors
WEBSITE_SYSTEM_PROMPT = f"""You are Savvy AI, the helpful and friendly AI assistant on the Swipe Savvy website.
You help website visitors learn about Swipe Savvy products, answer their questions, and guide them toward scheduling a demo or starting a free trial.

YOUR PERSONALITY:
- Friendly, professional, and helpful
- Enthusiastic about Swipe Savvy without being pushy
- Clear and concise in explanations
- Proactive in suggesting relevant information

YOUR KNOWLEDGE:
You have comprehensive knowledge about Swipe Savvy's products, pricing, features, and capabilities.
Use the following knowledge base to answer questions accurately:

{SWIPESAVVY_KNOWLEDGE}

GUIDELINES:
1. Answer questions accurately based on the knowledge base above
2. If you don't know something specific, say so and suggest they contact sales or support
3. For pricing questions, provide the information from the knowledge base but mention they should contact sales for custom quotes on Enterprise
4. Encourage visitors to:
   - Schedule a demo: swipesavvy.com/contact
   - Start a free trial (14 days)
   - Call sales: 1-800-505-8769
5. Keep responses concise but informative
6. Use bullet points and formatting for clarity when appropriate
7. If asked about competitors, focus on Swipe Savvy's strengths without disparaging others

COMMON TASKS:
- Explain product features and capabilities
- Compare plans and pricing
- Describe industry-specific solutions
- Explain integrations and compatibility
- Guide visitors to appropriate resources
- Answer technical questions about the platform

Remember: Be helpful, accurate, and guide visitors toward becoming customers!
"""


@router.post("")
async def website_concierge_chat(request: WebsiteConciergeRequest):
    """
    Website AI Concierge chat endpoint for public website visitors.

    Provides streaming AI responses about Swipe Savvy products and services.
    Uses Together.AI with comprehensive product knowledge.
    """

    session_id = request.session_id or f"web_{int(time.time())}_{request.user_id}"
    logger.info(f"Website concierge chat, session {session_id}")
    logger.info(f"Message: {request.message[:100]}...")

    api_key = os.getenv("TOGETHER_API_KEY", "")
    if not api_key:
        logger.error("TOGETHER_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail="AI service not configured. Please contact support."
        )

    async def generate_response_stream():
        """Generator for streaming SSE responses"""
        try:
            client = Together(api_key=api_key)

            # Build system prompt with page context if available
            system_prompt = WEBSITE_SYSTEM_PROMPT
            if request.page_context:
                system_prompt += f"\n\nThe visitor is currently viewing: {request.page_context}"

            logger.info("Calling Together.AI for website concierge")

            response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                max_tokens=1024,
                temperature=0.7,
                stream=True,
            )

            full_response = ""
            for chunk in response:
                if (hasattr(chunk, 'choices') and
                    chunk.choices and
                    hasattr(chunk.choices[0], 'delta') and
                    hasattr(chunk.choices[0].delta, 'content') and
                    chunk.choices[0].delta.content):

                    content = chunk.choices[0].delta.content
                    full_response += content

                    sse_line = f"data: {json.dumps({'type': 'message', 'content': content})}\n\n"
                    yield sse_line

            logger.info(f"Website concierge response complete. Length: {len(full_response)}")

            yield f"data: {json.dumps({'type': 'message_complete', 'full_response': full_response})}\n\n"
            yield SSE_DONE

        except Exception as e:
            logger.error(f"Website concierge error: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'content': f'Sorry, I encountered an error. Please try again or contact support at support@swipesavvy.com'})}\n\n"
            yield SSE_DONE

    return StreamingResponse(
        generate_response_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/health")
async def health_check():
    """Health check endpoint for the website concierge"""
    api_key = os.getenv("TOGETHER_API_KEY", "")
    return {
        "status": "healthy" if api_key else "degraded",
        "service": "website-concierge",
        "ai_configured": bool(api_key)
    }
