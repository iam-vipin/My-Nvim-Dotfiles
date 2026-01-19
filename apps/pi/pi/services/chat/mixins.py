# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

"""
Chat mixins for reusable functionality.
"""

from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from langchain_core.messages import HumanMessage

from pi.services.chat.utils import format_message_with_attachments


class AttachmentMixin:
    """Mixin for consistent attachment handling across chat components."""

    def get_current_attachment_blocks(self) -> Optional[List[Dict[str, Any]]]:
        """Get current attachment blocks from shared context."""
        return getattr(self, "_current_attachment_blocks", None)

    def create_message_with_attachments(self, content: str, attachment_blocks: Optional[List[Dict[str, Any]]] = None) -> HumanMessage:
        """
        Create a HumanMessage with optional attachment blocks.

        Args:
            content: Text content for the message
            attachment_blocks: Optional attachment blocks to include

        Returns:
            HumanMessage with properly formatted content
        """
        if attachment_blocks:
            # format_message_with_attachments returns List[Dict[str, Any]]
            # The content blocks are compatible with HumanMessage at runtime
            formatted_blocks = format_message_with_attachments(content, attachment_blocks)
            return HumanMessage(content=formatted_blocks)  # type: ignore[arg-type]
        else:
            return HumanMessage(content=content)

    def enhance_query_with_context(self, base_query: str, context: str) -> str:
        """
        Enhance a query with additional context in a standardized format.

        Args:
            base_query: The original query
            context: Additional context to append

        Returns:
            Enhanced query with context
        """
        if not context:
            return base_query
        return f"{base_query}\n\nAttachment Context: {context}"
