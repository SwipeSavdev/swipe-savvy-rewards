"""
AWS Secrets Manager Service

Securely fetch credentials from AWS Secrets Manager instead of environment variables.
This module provides a centralized way to access all application secrets.

Usage:
    from app.services.secrets_service import secrets_service

    # Get database credentials
    db_config = secrets_service.get_database_credentials()

    # Get specific secret
    aws_creds = secrets_service.get_secret('swipesavvy/aws/credentials')
"""

import json
import logging
import os
from functools import lru_cache
from typing import Dict, Any, Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
SECRET_PREFIX = os.getenv("SECRETS_PREFIX", "swipesavvy")
USE_SECRETS_MANAGER = os.getenv("USE_SECRETS_MANAGER", "false").lower() == "true"


class SecretsService:
    """Service for fetching secrets from AWS Secrets Manager"""

    def __init__(self):
        self.client = None
        self.enabled = USE_SECRETS_MANAGER

        if self.enabled:
            try:
                self.client = boto3.client('secretsmanager', region_name=AWS_REGION)
                logger.info(f"Secrets Manager initialized in region: {AWS_REGION}")
            except Exception as e:
                logger.warning(f"Failed to initialize Secrets Manager: {e}")
                self.enabled = False

    @lru_cache(maxsize=32)
    def get_secret(self, secret_name: str) -> Dict[str, Any]:
        """
        Fetch a secret from AWS Secrets Manager.
        Results are cached to minimize API calls.

        Args:
            secret_name: The name of the secret (e.g., 'swipesavvy/database/credentials')

        Returns:
            Dictionary containing the secret values
        """
        if not self.enabled:
            logger.debug(f"Secrets Manager disabled, returning empty dict for {secret_name}")
            return {}

        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            secret_string = response.get('SecretString')

            if secret_string:
                return json.loads(secret_string)

            logger.warning(f"Secret {secret_name} has no string value")
            return {}

        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ResourceNotFoundException':
                logger.warning(f"Secret not found: {secret_name}")
            elif error_code == 'AccessDeniedException':
                logger.error(f"Access denied to secret: {secret_name}")
            else:
                logger.error(f"Error fetching secret {secret_name}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error fetching secret {secret_name}: {e}")
            return {}

    def get_database_credentials(self) -> Dict[str, str]:
        """Get database connection credentials"""
        secret = self.get_secret(f"{SECRET_PREFIX}/database/credentials")
        return {
            'host': secret.get('DB_HOST') or os.getenv('DB_HOST'),
            'port': secret.get('DB_PORT') or os.getenv('DB_PORT', '5432'),
            'database': secret.get('DB_NAME') or os.getenv('DB_NAME'),
            'user': secret.get('DB_USER') or os.getenv('DB_USER'),
            'password': secret.get('DB_PASSWORD') or os.getenv('DB_PASSWORD'),
        }

    def get_jwt_secret(self) -> str:
        """Get JWT signing secret"""
        secret = self.get_secret(f"{SECRET_PREFIX}/auth/jwt")
        return secret.get('JWT_SECRET') or os.getenv('JWT_SECRET', '')

    def get_together_api_keys(self) -> Dict[str, str]:
        """Get Together AI API keys"""
        secret = self.get_secret(f"{SECRET_PREFIX}/ai/together")
        return {
            'primary': secret.get('TOGETHER_API_KEY') or os.getenv('TOGETHER_API_KEY'),
            'general': secret.get('TOGETHER_API_KEY_GENERAL') or os.getenv('TOGETHER_API_KEY_GENERAL'),
            'marketing': secret.get('TOGETHER_API_KEY_MARKETING') or os.getenv('TOGETHER_API_KEY_MARKETING'),
        }

    def get_stripe_credentials(self) -> Dict[str, str]:
        """Get Stripe payment credentials"""
        secret = self.get_secret(f"{SECRET_PREFIX}/payments/stripe")
        return {
            'secret_key': secret.get('STRIPE_SECRET_KEY') or os.getenv('STRIPE_SECRET_KEY'),
            'publishable_key': secret.get('STRIPE_PUBLISHABLE_KEY') or os.getenv('STRIPE_PUBLISHABLE_KEY'),
            'webhook_secret': secret.get('STRIPE_WEBHOOK_SECRET') or os.getenv('STRIPE_WEBHOOK_SECRET'),
        }

    def get_plaid_credentials(self) -> Dict[str, str]:
        """Get Plaid bank linking credentials"""
        secret = self.get_secret(f"{SECRET_PREFIX}/banking/plaid")
        return {
            'client_id': secret.get('PLAID_CLIENT_ID') or os.getenv('PLAID_CLIENT_ID'),
            'secret': secret.get('PLAID_SECRET') or os.getenv('PLAID_SECRET'),
        }

    def get_fis_credentials(self) -> Dict[str, str]:
        """Get FIS Global Payment One credentials"""
        secret = self.get_secret(f"{SECRET_PREFIX}/cards/fis")
        return {
            'client_id': secret.get('FIS_CLIENT_ID') or os.getenv('FIS_CLIENT_ID'),
            'client_secret': secret.get('FIS_CLIENT_SECRET') or os.getenv('FIS_CLIENT_SECRET'),
            'webhook_secret': secret.get('FIS_WEBHOOK_SECRET') or os.getenv('FIS_WEBHOOK_SECRET'),
        }

    def get_aws_credentials(self) -> Dict[str, str]:
        """Get AWS credentials (for services that can't use IAM roles)"""
        secret = self.get_secret(f"{SECRET_PREFIX}/aws/credentials")
        return {
            'access_key_id': secret.get('AWS_ACCESS_KEY_ID') or os.getenv('AWS_ACCESS_KEY_ID'),
            'secret_access_key': secret.get('AWS_SECRET_ACCESS_KEY') or os.getenv('AWS_SECRET_ACCESS_KEY'),
        }

    def clear_cache(self):
        """Clear the secrets cache (call after rotating credentials)"""
        self.get_secret.cache_clear()
        logger.info("Secrets cache cleared")


# Singleton instance
secrets_service = SecretsService()
