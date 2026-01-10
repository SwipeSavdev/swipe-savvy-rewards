"""Configuration module for SwipeSavvy AI Agents"""
from .ai_roles import ROLE_CONFIGS, get_role_config, build_role_aware_prompt

__all__ = ["ROLE_CONFIGS", "get_role_config", "build_role_aware_prompt"]
