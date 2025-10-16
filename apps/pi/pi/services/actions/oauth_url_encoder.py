"""
Service for encoding/decoding OAuth URLs to make them clean and secure
"""

import base64
import json
from typing import Any
from typing import Dict

from cryptography.fernet import Fernet

from pi import settings


class OAuthUrlEncoder:
    """Encodes OAuth parameters into a clean, encrypted URL"""

    def __init__(self):
        # Use the secret key from environment
        if not settings.plane_api.OAUTH_URL_ENCRYPTION_KEY:
            raise ValueError(
                "OAUTH_URL_ENCRYPTION_KEY must be set in environment. "
                'Generate one using: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
            )

        self.secret_key = settings.plane_api.OAUTH_URL_ENCRYPTION_KEY.encode()
        self.cipher_suite = Fernet(self.secret_key)

    def encode_oauth_params(self, params: Dict[str, Any]) -> str:
        """
        Encode OAuth parameters into a clean, encrypted string

        Args:
            params: Dictionary containing user_id, workspace_id, chat_id, message_token, etc.

        Returns:
            str: Clean, encrypted parameter string
        """
        # Convert to JSON and encrypt
        json_data = json.dumps(params)
        encrypted_data = self.cipher_suite.encrypt(json_data.encode())

        # Encode to base64 for URL safety
        encoded = base64.urlsafe_b64encode(encrypted_data).decode()

        return encoded

    def decode_oauth_params(self, encoded_params: str) -> Dict[str, Any]:
        """
        Decode encrypted OAuth parameters

        Args:
            encoded_params: Encrypted parameter string from URL

        Returns:
            Dict: Decoded parameters
        """
        try:
            # Decode from base64
            encrypted_data = base64.urlsafe_b64decode(encoded_params.encode())

            # Decrypt
            decrypted_data = self.cipher_suite.decrypt(encrypted_data)

            # Parse JSON
            params = json.loads(decrypted_data.decode())

            return params
        except Exception as e:
            raise ValueError(f"Failed to decode OAuth parameters: {e}")

    def generate_clean_oauth_url(self, base_url: str, params: Dict[str, Any]) -> str:
        """
        Generate a clean OAuth URL with encrypted parameters

        Args:
            base_url: Base URL for the OAuth endpoint
            params: Parameters to encode

        Returns:
            str: Clean OAuth URL
        """
        encoded_params = self.encode_oauth_params(params)
        return f"{base_url}/api/v1/oauth/authorize/{encoded_params}"
