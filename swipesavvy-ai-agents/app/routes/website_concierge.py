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
    conversation_history: Optional[list] = Field(None, description="Previous messages for context")


class SentimentAnalyzer:
    """Analyze customer sentiment for escalation and sales opportunity detection"""

    NEGATIVE_INDICATORS = [
        'frustrated', 'angry', 'upset', 'terrible', 'awful', 'horrible',
        'worst', 'hate', 'ridiculous', 'unacceptable', 'disgusted', 'furious',
        'disappointed', 'annoyed', 'fed up', 'sick of', 'waste', 'useless',
        'broken', 'not working', "doesn't work", 'still not', 'never works',
        'terrible experience', 'waste of time', 'giving up', 'cancel'
    ]

    POSITIVE_INDICATORS = [
        'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome',
        'fantastic', 'wonderful', 'impressed', 'excited', 'interested',
        'looking forward', 'ready to', 'want to try', 'sounds good'
    ]

    URGENCY_INDICATORS = [
        'urgent', 'emergency', 'asap', 'immediately', 'right now',
        'critical', 'down', 'outage', "can't process", 'stuck', 'blocked'
    ]

    TRANSFER_REQUESTS = [
        'speak to', 'talk to', 'human', 'agent', 'representative',
        'real person', 'manager', 'supervisor', 'call me', 'phone call'
    ]

    BUYING_SIGNALS = [
        'how much', 'pricing', 'cost', 'quote', 'buy', 'purchase',
        'sign up', 'get started', 'trial', 'demo', 'implement',
        'when can', 'how soon', 'contract', 'payment', 'discount',
        'ready to move forward', 'next steps', 'onboarding'
    ]

    @classmethod
    def analyze(cls, text: str) -> Dict[str, Any]:
        """Analyze text for sentiment, intent, and escalation needs"""
        lower_text = text.lower()

        # Check for explicit transfer request
        for phrase in cls.TRANSFER_REQUESTS:
            if phrase in lower_text:
                return {
                    'sentiment': 'transfer_request',
                    'score': 1.0,
                    'should_escalate': True,
                    'escalation_reason': 'customer_requested_human',
                    'escalation_type': 'support',
                    'is_sales_opportunity': False
                }

        # Calculate scores
        negative_score = sum(0.25 for word in cls.NEGATIVE_INDICATORS if word in lower_text)
        positive_score = sum(0.2 for word in cls.POSITIVE_INDICATORS if word in lower_text)
        urgency_score = sum(0.3 for word in cls.URGENCY_INDICATORS if word in lower_text)
        buying_score = sum(0.25 for word in cls.BUYING_SIGNALS if word in lower_text)

        # Check for ALL CAPS (frustration indicator)
        caps_words = [w for w in text.split() if len(w) > 3 and w.isupper()]
        if len(caps_words) >= 2:
            negative_score += 0.4

        # Check for repeated punctuation (!!!, ???)
        if any(p * 2 in text for p in ['!', '?']):
            negative_score += 0.2

        # Determine overall sentiment
        total_negative = min(negative_score + urgency_score, 1.0)

        result = {
            'sentiment': 'neutral',
            'negative_score': round(total_negative, 2),
            'positive_score': round(min(positive_score, 1.0), 2),
            'buying_score': round(min(buying_score, 1.0), 2),
            'should_escalate': False,
            'escalation_reason': None,
            'escalation_type': None,
            'is_sales_opportunity': buying_score >= 0.25 or positive_score >= 0.4
        }

        # Flight risk detection (negative sentiment = potential churn)
        if total_negative >= 0.6:
            result['sentiment'] = 'negative'
            result['should_escalate'] = True
            result['escalation_reason'] = 'high_frustration_flight_risk'
            result['escalation_type'] = 'support'
        elif total_negative >= 0.3:
            result['sentiment'] = 'concerning'

        # Sales opportunity detection (high buying intent)
        if buying_score >= 0.5 or (positive_score >= 0.3 and buying_score >= 0.25):
            result['sentiment'] = 'high_intent'
            result['is_sales_opportunity'] = True
            result['should_escalate'] = True
            result['escalation_reason'] = 'sales_opportunity_hot_lead'
            result['escalation_type'] = 'sales'

        return result


# Base knowledge for the AI - will be combined with dynamic context
SWIPESAVVY_KNOWLEDGE_BASE = SWIPESAVVY_KNOWLEDGE


def build_dynamic_system_prompt(
    page_context: Optional[str] = None,
    sentiment_data: Optional[Dict[str, Any]] = None,
    conversation_length: int = 0
) -> str:
    """
    Build a dynamic, context-aware system prompt based on visitor behavior.
    Avoids boilerplate by adapting tone and focus to the situation.
    """

    # Base personality - adapt based on sentiment
    if sentiment_data and sentiment_data.get('sentiment') == 'negative':
        personality = """You are Savvy AI. The visitor seems frustrated - be extra empathetic, patient, and solution-focused.
Acknowledge their frustration before addressing their concern. Focus on resolving their issue quickly.
If they're very frustrated, proactively offer to connect them with a human support specialist."""
    elif sentiment_data and sentiment_data.get('is_sales_opportunity'):
        personality = """You are Savvy AI. This visitor shows strong buying intent - be helpful and informative without being pushy.
Answer their questions directly and thoroughly. If they ask about pricing or getting started, give clear actionable next steps.
This is a warm lead - provide excellent service to help them make a confident decision."""
    elif conversation_length > 5:
        personality = """You are Savvy AI. This is an ongoing conversation - be conversational and remember context.
Don't repeat introductions or re-explain things already discussed. Build on the conversation naturally."""
    else:
        personality = """You are Savvy AI, the friendly assistant on Swipe Savvy's website.
Be warm, helpful, and conversational - like a knowledgeable colleague, not a script-reading bot."""

    # Page-specific context
    page_focus = ""
    if page_context:
        page_map = {
            "pricing": "They're on the pricing page - focus on value and ROI, not just features.",
            "solutions": "They're exploring solutions - understand their specific needs before suggesting products.",
            "industries": "They're looking at industry solutions - ask about their business to give relevant examples.",
            "contact": "They're on the contact page - they may be ready to talk to sales or have a specific question.",
            "support": "They may need help with an existing issue - prioritize problem-solving.",
            "demo": "They're interested in a demo - make scheduling easy and answer pre-demo questions.",
        }
        for key, focus in page_map.items():
            if key in page_context.lower():
                page_focus = f"\n\nCONTEXT: {focus}"
                break

    # Sentiment-aware instructions
    sentiment_instructions = ""
    if sentiment_data:
        if sentiment_data.get('sentiment') == 'negative':
            sentiment_instructions = """

PRIORITY: This visitor may be frustrated.
- Lead with empathy: "I understand that's frustrating..."
- Focus on solutions, not explanations
- If you can't resolve it, offer human support immediately
- Don't be defensive or make excuses"""
        elif sentiment_data.get('sentiment') == 'high_intent':
            sentiment_instructions = """

PRIORITY: This visitor shows strong buying signals.
- Answer questions thoroughly and confidently
- Provide clear pricing when asked (refer to knowledge base)
- Make next steps crystal clear: demo scheduling, free trial, or sales call
- Don't oversell - let the product speak for itself"""

    prompt = f"""{personality}

KNOWLEDGE BASE:
{SWIPESAVVY_KNOWLEDGE_BASE}
{page_focus}
{sentiment_instructions}

COMMUNICATION STYLE:
- Be direct and concise - respect their time
- Use natural language, not marketing speak
- Answer the actual question first, then offer relevant extras
- Format with bullets or short paragraphs for readability
- Don't over-explain or add unnecessary caveats
- Match their energy - casual if they're casual, professional if they're formal

ACTIONS YOU CAN SUGGEST:
- Schedule a demo: swipesavvy.com/contact or call 1-800-505-8769
- Start free 14-day trial
- Talk to sales for custom pricing (Enterprise)
- Contact support: support@swipesavvy.com

Never fabricate information. If you don't know, say so and point them to the right resource."""

    return prompt


@router.post("")
async def website_concierge_chat(request: WebsiteConciergeRequest):
    """
    Website AI Concierge chat endpoint for public website visitors.

    Provides streaming AI responses about Swipe Savvy products and services.
    Uses Together.AI with comprehensive product knowledge.
    Features dynamic sentiment analysis for escalation and sales opportunity detection.
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

    # Analyze sentiment for tone detection and escalation needs
    sentiment_data = SentimentAnalyzer.analyze(request.message)
    logger.info(f"Sentiment analysis: {sentiment_data}")

    # Calculate conversation length from history
    conversation_length = len(request.conversation_history) if request.conversation_history else 0

    async def generate_response_stream():
        """Generator for streaming SSE responses"""
        try:
            client = Together(api_key=api_key)

            # Build dynamic system prompt based on context and sentiment
            system_prompt = build_dynamic_system_prompt(
                page_context=request.page_context,
                sentiment_data=sentiment_data,
                conversation_length=conversation_length
            )

            # Build messages array with conversation history
            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation history for context continuity
            if request.conversation_history:
                for msg in request.conversation_history[-10:]:  # Last 10 messages for context
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if role in ['user', 'assistant'] and content:
                        messages.append({"role": role, "content": content})

            # Add current message
            messages.append({"role": "user", "content": request.message})

            logger.info(f"Calling Together.AI with {len(messages)} messages")

            # Send sentiment data at the start of stream for frontend to handle
            yield f"data: {json.dumps({'type': 'sentiment', 'data': sentiment_data})}\n\n"

            response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
                messages=messages,
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

            # Send completion event with sentiment summary for escalation handling
            completion_data = {
                'type': 'message_complete',
                'full_response': full_response,
                'sentiment': sentiment_data,
                'should_escalate': sentiment_data.get('should_escalate', False),
                'escalation_type': sentiment_data.get('escalation_type'),
                'escalation_reason': sentiment_data.get('escalation_reason'),
                'is_sales_opportunity': sentiment_data.get('is_sales_opportunity', False)
            }
            yield f"data: {json.dumps(completion_data)}\n\n"
            yield SSE_DONE

        except Exception as e:
            logger.error(f"Website concierge error: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'content': 'Sorry, I encountered an error. Please try again or contact support at support@swipesavvy.com'})}\n\n"
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
