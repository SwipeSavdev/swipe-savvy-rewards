"""
Rewards Service - Manages user points and reward redemptions
"""
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import uuid


class RewardsService:
    """Handles rewards, points, and redemption logic"""
    
    def __init__(self):
        # In-memory storage for MVP (easily replaceable with database)
        self.user_points: Dict[str, int] = {}  # user_id -> points balance
        self.transactions: Dict[str, List[Dict]] = {}  # user_id -> list of transactions
        self.offers: Dict[str, Dict] = {
            "offer_1": {
                "id": "offer_1",
                "title": "$5 Coffee Gift Card",
                "description": "Redeem for a $5 Starbucks gift card",
                "points_required": 500,
                "image_url": "https://via.placeholder.com/300x200?text=Coffee+Card",
                "category": "food",
                "expires_in_days": 30,
            },
            "offer_2": {
                "id": "offer_2",
                "title": "$10 Movie Ticket",
                "description": "Get a $10 movie theater gift card",
                "points_required": 1000,
                "image_url": "https://via.placeholder.com/300x200?text=Movie+Ticket",
                "category": "entertainment",
                "expires_in_days": 60,
            },
            "offer_3": {
                "id": "offer_3",
                "title": "$20 Amazon Credit",
                "description": "Redeem for $20 Amazon.com credit",
                "points_required": 2000,
                "image_url": "https://via.placeholder.com/300x200?text=Amazon+Credit",
                "category": "shopping",
                "expires_in_days": 90,
            },
            "offer_4": {
                "id": "offer_4",
                "title": "$50 Restaurant Voucher",
                "description": "Enjoy $50 off at partner restaurants",
                "points_required": 5000,
                "image_url": "https://via.placeholder.com/300x200?text=Restaurant",
                "category": "dining",
                "expires_in_days": 45,
            },
            "offer_5": {
                "id": "offer_5",
                "title": "Free Shipping (Any Store)",
                "description": "Free shipping on next online purchase",
                "points_required": 300,
                "image_url": "https://via.placeholder.com/300x200?text=Free+Shipping",
                "category": "shopping",
                "expires_in_days": 15,
            },
        }

    def initialize_user(self, user_id: str, starting_points: int = 1000) -> Tuple[bool, Dict]:
        """Initialize a new user with starting points"""
        if user_id in self.user_points:
            return False, {"error": "User already initialized"}
        
        self.user_points[user_id] = starting_points
        self.transactions[user_id] = [
            {
                "id": str(uuid.uuid4()),
                "type": "earned",
                "amount": starting_points,
                "description": "Welcome bonus",
                "timestamp": datetime.now().isoformat(),
            }
        ]
        
        return True, {"user_id": user_id, "points": starting_points}

    def get_user_points(self, user_id: str) -> Tuple[bool, Dict]:
        """Get current points balance for a user"""
        if user_id not in self.user_points:
            return False, {"error": "User not found"}
        
        points = self.user_points[user_id]
        return True, {
            "user_id": user_id,
            "balance": points,
            "tier": self._get_tier(points),
            "next_milestone": self._get_next_milestone(points),
        }

    def add_points(self, user_id: str, amount: int, description: str = "Points earned") -> Tuple[bool, Dict]:
        """Add points to user account"""
        if user_id not in self.user_points:
            return False, {"error": "User not found"}
        
        self.user_points[user_id] += amount
        
        transaction = {
            "id": str(uuid.uuid4()),
            "type": "earned",
            "amount": amount,
            "description": description,
            "timestamp": datetime.now().isoformat(),
        }
        self.transactions[user_id].append(transaction)
        
        return True, {
            "user_id": user_id,
            "new_balance": self.user_points[user_id],
            "transaction": transaction,
        }

    def redeem_offer(self, user_id: str, offer_id: str) -> Tuple[bool, Dict]:
        """Redeem an offer using points"""
        # Validate user
        if user_id not in self.user_points:
            return False, {"error": "User not found"}
        
        # Validate offer
        if offer_id not in self.offers:
            return False, {"error": "Offer not found"}
        
        offer = self.offers[offer_id]
        points_required = offer["points_required"]
        
        # Check sufficient points
        if self.user_points[user_id] < points_required:
            return False, {
                "error": "Insufficient points",
                "required": points_required,
                "current": self.user_points[user_id],
            }
        
        # Deduct points
        self.user_points[user_id] -= points_required
        
        # Create transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "type": "redeemed",
            "amount": points_required,
            "description": f"Redeemed: {offer['title']}",
            "offer_id": offer_id,
            "timestamp": datetime.now().isoformat(),
        }
        self.transactions[user_id].append(transaction)
        
        return True, {
            "success": True,
            "user_id": user_id,
            "offer": offer,
            "points_used": points_required,
            "new_balance": self.user_points[user_id],
            "transaction": transaction,
            "confirmation_code": str(uuid.uuid4())[:8].upper(),
        }

    def get_transaction_history(self, user_id: str, limit: int = 50) -> Tuple[bool, Dict]:
        """Get transaction history for a user"""
        if user_id not in self.transactions:
            return False, {"error": "User not found"}
        
        transactions = self.transactions[user_id][-limit:]
        
        # Calculate summary
        earned = sum(t["amount"] for t in transactions if t["type"] == "earned")
        redeemed = sum(t["amount"] for t in transactions if t["type"] == "redeemed")
        
        return True, {
            "user_id": user_id,
            "transactions": transactions,
            "summary": {
                "total_earned": earned,
                "total_redeemed": redeemed,
                "transaction_count": len(transactions),
            },
        }

    def get_available_offers(self) -> Tuple[bool, Dict]:
        """Get all available redemption offers"""
        offers_list = list(self.offers.values())
        
        return True, {
            "offers": offers_list,
            "count": len(offers_list),
        }

    def _get_tier(self, points: int) -> str:
        """Determine user tier based on points"""
        if points >= 10000:
            return "platinum"
        elif points >= 5000:
            return "gold"
        elif points >= 2000:
            return "silver"
        else:
            return "bronze"

    def _get_next_milestone(self, points: int) -> Dict:
        """Get next tier milestone"""
        milestones = [2000, 5000, 10000]
        
        for milestone in milestones:
            if points < milestone:
                return {
                    "points_needed": milestone,
                    "points_to_go": milestone - points,
                    "tier": self._get_tier(milestone),
                }
        
        return {
            "points_needed": None,
            "points_to_go": 0,
            "tier": "platinum",
            "max_tier_reached": True,
        }
