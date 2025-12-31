"""Feature Flag service for backend operations."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
import hashlib
from app.models.feature_flag import (
    FeatureFlag,
    FeatureFlagCreate,
    FeatureFlagUpdate,
    FeatureFlagResponse,
    FeatureFlagListResponse,
    MobileFeatureFlagsResponse,
)


class FeatureFlagService:
    """Service for managing feature flags."""

    @staticmethod
    def create_flag(db: Session, flag_data: FeatureFlagCreate, user_id: str) -> FeatureFlagResponse:
        """Create a new feature flag."""
        db_flag = FeatureFlag(
            **flag_data.model_dump(),
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(db_flag)
        db.commit()
        db.refresh(db_flag)
        return FeatureFlagResponse.from_orm(db_flag)

    @staticmethod
    def get_flag(db: Session, flag_id: str) -> Optional[FeatureFlagResponse]:
        """Get a feature flag by ID."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        return FeatureFlagResponse.from_orm(flag) if flag else None

    @staticmethod
    def get_flag_by_name(db: Session, name: str) -> Optional[FeatureFlagResponse]:
        """Get a feature flag by name."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.name == name).first()
        return FeatureFlagResponse.from_orm(flag) if flag else None

    @staticmethod
    def list_flags(
        db: Session,
        page: int = 1,
        page_size: int = 50,
        enabled_only: bool = False,
    ) -> FeatureFlagListResponse:
        """List feature flags with pagination."""
        query = db.query(FeatureFlag)

        if enabled_only:
            query = query.filter(FeatureFlag.enabled == True)

        total = query.count()
        skip = (page - 1) * page_size
        flags = query.order_by(desc(FeatureFlag.created_at)).offset(skip).limit(page_size).all()

        return FeatureFlagListResponse(
            total=total,
            page=page,
            page_size=page_size,
            flags=[FeatureFlagResponse.from_orm(f) for f in flags],
        )

    @staticmethod
    def update_flag(
        db: Session,
        flag_id: str,
        flag_data: FeatureFlagUpdate,
        user_id: str,
    ) -> Optional[FeatureFlagResponse]:
        """Update a feature flag."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        if not flag:
            return None

        update_data = flag_data.model_dump(exclude_unset=True)
        update_data["updated_by"] = user_id
        update_data["updated_at"] = datetime.utcnow()

        for key, value in update_data.items():
            setattr(flag, key, value)

        db.commit()
        db.refresh(flag)
        return FeatureFlagResponse.from_orm(flag)

    @staticmethod
    def delete_flag(db: Session, flag_id: str) -> bool:
        """Delete a feature flag."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        if not flag:
            return False

        db.delete(flag)
        db.commit()
        return True

    @staticmethod
    def toggle_flag(db: Session, flag_id: str, enabled: bool, user_id: str) -> Optional[FeatureFlagResponse]:
        """Toggle a feature flag on/off."""
        return FeatureFlagService.update_flag(
            db,
            flag_id,
            FeatureFlagUpdate(enabled=enabled),
            user_id,
        )

    @staticmethod
    def get_mobile_flags(db: Session, user_id: Optional[str] = None) -> MobileFeatureFlagsResponse:
        """Get flags for mobile app (only enabled or in rollout)."""
        flags = db.query(FeatureFlag).filter(FeatureFlag.enabled == True).all()

        flags_dict = {}
        for flag in flags:
            # Check if user should receive this flag (based on rollout percentage)
            should_include = FeatureFlagService._should_include_flag(flag, user_id)

            if should_include:
                flags_dict[flag.name] = {
                    "enabled": flag.enabled,
                    "rollout_percentage": flag.rollout_percentage,
                    "metadata": flag.metadata or {},
                }

        return MobileFeatureFlagsResponse(
            flags=flags_dict,
            timestamp=datetime.utcnow(),
        )

    @staticmethod
    def _should_include_flag(flag: FeatureFlag, user_id: Optional[str] = None) -> bool:
        """Determine if a user should receive a flag based on rollout percentage."""
        if flag.rollout_percentage >= 100:
            return True

        if flag.rollout_percentage <= 0:
            return False

        # Hash-based rollout: consistent for same user
        if user_id:
            hash_input = f"{flag.id}:{user_id}"
            hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
            user_bucket = hash_value % 100
            return user_bucket < flag.rollout_percentage

        # Without user_id, use random decision
        import random
        return random.randint(0, 99) < flag.rollout_percentage
