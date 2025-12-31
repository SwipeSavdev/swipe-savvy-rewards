"""
Enhanced AI Marketing Service - Rule-Based Analysis + LLM Intelligence

Combines behavioral pattern detection with Together.AI for:
- AI-generated campaign copy and creative suggestions
- Smart audience insights and segmentation recommendations
- Dynamic campaign optimization suggestions
- Natural language insights on campaign performance
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
from together import Together
import os

from app.services.marketing_ai import (
    BehaviorAnalyzer, 
    UserBehavior, 
    BehaviorPattern, 
    CampaignType,
    get_marketing_ai_service
)

logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}

# Together.AI Configuration
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
together_client = Together(api_key=TOGETHER_API_KEY) if TOGETHER_API_KEY else None


class AIMarketingEnhanced:
    """Enhanced marketing AI combining behavioral analysis with LLM intelligence"""

    def __init__(self):
        self.together = together_client
        self.marketing_service = get_marketing_ai_service()

    def _get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**DB_CONFIG)

    async def generate_campaign_copy(
        self, 
        campaign_name: str,
        target_patterns: List[str],
        campaign_type: str,
        audience_size: int,
        offer_value: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered campaign copy using Together.AI
        
        Args:
            campaign_name: Name of the campaign
            target_patterns: List of behavior patterns (e.g., ['high_spender', 'frequent_shopper'])
            campaign_type: Type of campaign (discount, cashback, loyalty, etc.)
            audience_size: Number of users in target audience
            offer_value: Value of offer (e.g., "10% off", "$5 cashback")
        """
        if not self.together:
            return {"error": "Together.AI not configured"}

        pattern_descriptions = {
            "high_spender": "high-value customers with significant purchasing power",
            "frequent_shopper": "loyal customers who shop regularly",
            "weekend_shopper": "customers who prefer weekend shopping",
            "category_focused": "customers loyal to specific product categories",
            "location_clustered": "customers with strong location preferences",
            "new_shopper": "recent customers still building shopping habits",
            "inactive": "customers showing reduced activity levels",
            "seasonal_spender": "customers with seasonal spending patterns"
        }

        patterns_text = ", ".join([
            pattern_descriptions.get(p, p) for p in target_patterns
        ])

        prompt = f"""You are an expert marketing copywriter. Generate compelling, concise marketing content for this campaign:

Campaign Name: {campaign_name}
Campaign Type: {campaign_type}
Target Audience: {patterns_text}
Audience Size: {audience_size:,} users
Offer: {offer_value or 'Special promotion'}

Generate:
1. A compelling 50-word campaign headline
2. A 100-word campaign description highlighting benefits
3. A call-to-action message (20 words max)
4. Three key selling points as bullet points

Format as JSON with keys: headline, description, cta, selling_points"""

        try:
            response = self.together.chat.completions.create(
                model="meta-llama/Llama-3-70b-chat-hf",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7,
            )

            content = response.choices[0].message.content
            
            # Parse JSON from response
            try:
                # Extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    campaign_copy = json.loads(json_match.group())
                else:
                    campaign_copy = {
                        "headline": content[:100],
                        "description": content,
                        "cta": "Shop now",
                        "selling_points": ["Great offers", "Tailored for you", "Limited time"]
                    }
            except json.JSONDecodeError:
                campaign_copy = {
                    "headline": content[:100],
                    "description": content,
                    "cta": "Shop now",
                    "selling_points": ["Great offers", "Tailored for you", "Limited time"]
                }

            return {
                "success": True,
                "campaign_copy": campaign_copy,
                "model": "meta-llama/Llama-3-70b-chat-hf"
            }
        except Exception as e:
            logger.error(f"Error generating campaign copy: {e}")
            return {"error": str(e)}

    async def get_audience_insights(
        self,
        target_patterns: List[str],
        lookback_days: int = 90
    ) -> Dict[str, Any]:
        """
        Generate smart audience insights and segmentation recommendations
        """
        if not self.together:
            return {"error": "Together.AI not configured"}

        # Get users matching patterns
        conn = self._get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        try:
            # Query for behavioral statistics using available tables
            query = """
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                AVG(COALESCE(p.total_spent, 0)) as avg_spend,
                MAX(COALESCE(p.total_spent, 0)) as max_spend,
                AVG(COALESCE(p.payment_count, 0)) as avg_transactions
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id,
                    SUM(amount) as total_spent,
                    COUNT(id) as payment_count
                FROM payments
                WHERE created_at > NOW() - INTERVAL '%s days'
                GROUP BY user_id
            ) p ON u.id = p.user_id
            """
            
            cursor.execute(query, (lookback_days,))
            stats = cursor.fetchone()

            prompt = f"""Analyze this audience segment and provide strategic insights:

Audience Size: {stats['total_users'] or 0:,} users
Average Spend: ${stats['avg_spend'] or 0:.2f}
Max Spend: ${stats['max_spend'] or 0:.2f}
Avg Transactions: {stats['avg_transactions'] or 0:.1f}
Behaviors: {', '.join(target_patterns)}
Time Period: Last {lookback_days} days

Provide:
1. Key audience characteristics (2-3 sentences)
2. Top 3 engagement opportunities
3. Recommended offer structure
4. Best channels for this audience
5. Potential challenges and mitigation strategies

Format as JSON with keys: characteristics, opportunities, offer_recommendation, channels, challenges"""

            response = self.together.chat.completions.create(
                model="meta-llama/Llama-3-70b-chat-hf",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.7,
            )

            content = response.choices[0].message.content
            
            try:
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    insights = json.loads(json_match.group())
                else:
                    insights = {
                        "characteristics": content[:200],
                        "opportunities": ["Build engagement", "Increase frequency", "Boost AOV"],
                        "offer_recommendation": "Personalized tiered rewards",
                        "channels": ["Email", "Push", "In-app"],
                        "challenges": ["Retention", "Seasonality"]
                    }
            except json.JSONDecodeError:
                insights = {
                    "characteristics": content[:200],
                    "opportunities": ["Build engagement", "Increase frequency", "Boost AOV"],
                    "offer_recommendation": "Personalized tiered rewards",
                    "channels": ["Email", "Push", "In-app"],
                    "challenges": ["Retention", "Seasonality"]
                }

            return {
                "success": True,
                "audience_stats": {
                    "total_users": stats['total_users'] or 0,
                    "avg_spend": float(stats['avg_spend'] or 0),
                    "max_spend": float(stats['max_spend'] or 0),
                    "avg_transactions": float(stats['avg_transactions'] or 0)
                },
                "insights": insights
            }
        finally:
            cursor.close()
            conn.close()

    async def optimize_campaign(
        self,
        campaign_id: str,
        campaign_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate dynamic campaign optimization suggestions based on performance
        """
        if not self.together:
            return {"error": "Together.AI not configured"}

        prompt = f"""You are a marketing optimization expert. Analyze this campaign's performance and suggest improvements:

Campaign Performance:
- Reach: {campaign_metrics.get('reach', 0):,}
- Engagement Rate: {campaign_metrics.get('engagement_rate', 0):.2%}
- Click Rate: {campaign_metrics.get('click_rate', 0):.2%}
- Conversion Rate: {campaign_metrics.get('conversion_rate', 0):.2%}
- ROI: {campaign_metrics.get('roi', 0):.2%}
- Cost per Conversion: ${campaign_metrics.get('cost_per_conversion', 0):.2f}

Provide:
1. Performance assessment (strong/weak areas)
2. Top 3 optimization recommendations with specific actions
3. A/B testing suggestions
4. Expected uplift from optimizations
5. Timeline for implementation

Format as JSON with keys: assessment, recommendations, ab_tests, expected_uplift, timeline"""

        try:
            response = self.together.chat.completions.create(
                model="meta-llama/Llama-3-70b-chat-hf",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.7,
            )

            content = response.choices[0].message.content
            
            try:
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    suggestions = json.loads(json_match.group())
                else:
                    suggestions = {
                        "assessment": content[:200],
                        "recommendations": ["Increase frequency", "Target new segments", "Refine messaging"],
                        "ab_tests": ["Copy variation", "Timing optimization"],
                        "expected_uplift": "15-25%",
                        "timeline": "2 weeks"
                    }
            except json.JSONDecodeError:
                suggestions = {
                    "assessment": content[:200],
                    "recommendations": ["Increase frequency", "Target new segments", "Refine messaging"],
                    "ab_tests": ["Copy variation", "Timing optimization"],
                    "expected_uplift": "15-25%",
                    "timeline": "2 weeks"
                }

            return {
                "success": True,
                "campaign_id": campaign_id,
                "optimization_suggestions": suggestions
            }
        except Exception as e:
            logger.error(f"Error optimizing campaign: {e}")
            return {"error": str(e)}

    async def analyze_performance(
        self,
        campaign_id: str,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate natural language performance analysis and insights
        """
        if not self.together:
            return {"error": "Together.AI not configured"}

        metrics_text = "\n".join([
            f"- {key.replace('_', ' ').title()}: {value}"
            for key, value in performance_data.items()
        ])

        prompt = f"""You are a data analyst. Provide a comprehensive natural language analysis of this campaign's performance:

{metrics_text}

Generate:
1. Executive summary (2-3 sentences)
2. Key highlights and wins
3. Areas of concern
4. Comparative insights (vs benchmarks if applicable)
5. Actionable next steps
6. Success factors to replicate

Format as JSON with keys: executive_summary, highlights, concerns, insights, next_steps, success_factors"""

        try:
            response = self.together.chat.completions.create(
                model="meta-llama/Llama-3-70b-chat-hf",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7,
            )

            content = response.choices[0].message.content
            
            try:
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group())
                else:
                    analysis = {
                        "executive_summary": content[:300],
                        "highlights": ["Strong engagement", "Good ROI"],
                        "concerns": ["Low conversion", "High cost"],
                        "insights": "Campaign performed well overall",
                        "next_steps": ["Expand audience", "Optimize timing"],
                        "success_factors": ["Clear messaging", "Right timing"]
                    }
            except json.JSONDecodeError:
                analysis = {
                    "executive_summary": content[:300],
                    "highlights": ["Strong engagement", "Good ROI"],
                    "concerns": ["Low conversion", "High cost"],
                    "insights": "Campaign performed well overall",
                    "next_steps": ["Expand audience", "Optimize timing"],
                    "success_factors": ["Clear messaging", "Right timing"]
                }

            return {
                "success": True,
                "campaign_id": campaign_id,
                "performance_analysis": analysis,
                "analyzed_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error analyzing performance: {e}")
            return {"error": str(e)}


# Singleton instance
_ai_marketing_enhanced = None


def get_ai_marketing_enhanced():
    """Get or create AI Marketing Enhanced service"""
    global _ai_marketing_enhanced
    if _ai_marketing_enhanced is None:
        _ai_marketing_enhanced = AIMarketingEnhanced()
    return _ai_marketing_enhanced
