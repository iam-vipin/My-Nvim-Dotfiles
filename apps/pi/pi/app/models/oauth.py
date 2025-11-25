"""
OAuth models for storing Plane app authentication tokens
"""

from datetime import datetime
from datetime import timedelta
from datetime import timezone
from typing import Optional
from uuid import UUID
from uuid import uuid4

from sqlmodel import Field
from sqlmodel import SQLModel


class PlaneOAuthToken(SQLModel, table=True):
    """Store OAuth tokens for Plane app integration"""

    __table_args__ = {"extend_existing": True}

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True)
    workspace_id: UUID = Field(index=True)
    workspace_slug: str = Field(index=True)

    # OAuth tokens
    access_token: str = Field()
    refresh_token: Optional[str] = Field(default=None)

    # Token metadata
    token_type: str = Field(default="Bearer")
    expires_in: int = Field()  # seconds until expiry
    expires_at: datetime = Field()  # calculated expiry time

    # App installation details
    app_installation_id: Optional[str] = Field(default=None)
    app_bot_user_id: Optional[str] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    # Status
    is_active: bool = Field(default=True)

    def is_expired(self) -> bool:
        """Check if the access token is expired"""
        # Ensure both times have no timezone for comparison
        current_time = datetime.now(timezone.utc).replace(tzinfo=None)
        expires_at = self.expires_at.replace(tzinfo=None) if self.expires_at.tzinfo else self.expires_at
        return current_time >= expires_at

    def needs_refresh(self) -> bool:
        """Check if token should be refreshed (5 minutes before expiry)"""
        buffer_time = 300  # 5 minutes
        # Ensure both times have no timezone for comparison
        current_time = datetime.now(timezone.utc).replace(tzinfo=None)
        expires_at = self.expires_at.replace(tzinfo=None) if self.expires_at.tzinfo else self.expires_at
        return current_time >= (expires_at - timedelta(seconds=buffer_time))


class PlaneOAuthState(SQLModel, table=True):
    """Track OAuth flow state for security"""

    __table_args__ = {"extend_existing": True}

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    state: str = Field(unique=True, index=True)  # Random state parameter
    user_id: UUID = Field(index=True)
    workspace_id: Optional[UUID] = Field(default=None)
    workspace_slug: Optional[str] = Field(default=None)

    # OAuth flow details
    redirect_uri: str = Field()
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    expires_at: datetime = Field()  # State expires after 10 minutes

    # Additional context for redirect
    chat_id: Optional[str] = Field(default=None)  # Store chat ID
    message_token: Optional[str] = Field(default=None)  # Store message token
    return_url: Optional[str] = Field(default=None)  # Store where to redirect after OAuth
    is_project_chat: Optional[bool] = Field(default=False)  # Store if this is a project chat
    project_id: Optional[str] = Field(default=None)  # Store project ID if project chat
    pi_sidebar_open: Optional[bool] = Field(default=False)  # Store if sidebar is open
    sidebar_open_url: Optional[str] = Field(default=None)  # Store sidebar open URL

    # Status
    is_used: bool = Field(default=False)

    def is_expired(self) -> bool:
        """Check if the state is expired"""
        current_time = datetime.now(timezone.utc).replace(tzinfo=None)
        return current_time >= self.expires_at
