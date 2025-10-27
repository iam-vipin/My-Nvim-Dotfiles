"""Query parsing utilities to avoid circular imports."""

from typing import Optional
from typing import Tuple

from bs4 import BeautifulSoup

# Import MENTION_TAGS from settings to avoid circular import
from pi import settings

MENTION_TAGS = settings.chat.MENTION_TAGS


def parse_query(query: str) -> Tuple[Optional[str], str]:
    """
    Parse HTML query to extract text and mention components.

    Handles any HTML structure (p, pre, code, div, etc.) and recursively
    extracts text while identifying mention-component tags.

    Args:
        query: HTML string that may contain mention-component tags

    Returns:
        Tuple of (mention_target, reformatted_query) where:
        - mention_target: The 'target' attribute of the last mention found (or None)
        - reformatted_query: Plain text with mentions replaced by descriptive text
    """
    soup = BeautifulSoup(query, "html.parser")

    # Track last mention for return value
    last_mention_target = None
    last_mention_entity_id = None

    def extract_text_recursive(element) -> str:
        """
        Recursively extract text from an element, handling mention-components specially.

        Args:
            element: BeautifulSoup element to process

        Returns:
            Extracted text with mentions replaced by descriptive text
        """
        nonlocal last_mention_target, last_mention_entity_id

        text_parts = []

        # Handle NavigableString (plain text nodes)
        if isinstance(element, str):
            return element

        # Handle mention-component tags
        if hasattr(element, "name") and element.name == "mention-component":
            # Prefer entity_identifier; fall back to id for backward compatibility
            entity_id = element.get("entity_identifier") or element.get("id")
            mention_target = element.get("target")

            if entity_id and mention_target:
                mention_tag_name = MENTION_TAGS.get(mention_target, mention_target)
                # Store last mention for return value
                last_mention_target = mention_target
                last_mention_entity_id = entity_id
                return f"{mention_tag_name} with id: {entity_id}"
            # If mention is malformed, just skip it
            return ""

        # For all other tags, recursively process children
        if hasattr(element, "children"):
            for child in element.children:
                child_text = extract_text_recursive(child)
                if child_text:
                    text_parts.append(child_text)

        return "".join(text_parts)

    # Extract text from the entire document
    reformatted_query = extract_text_recursive(soup)

    # Clean up whitespace: collapse multiple spaces/newlines into single spaces
    reformatted_query = " ".join(reformatted_query.split())

    # Return based on whether we found any mentions
    if last_mention_target and last_mention_entity_id:
        return last_mention_target, reformatted_query
    return None, reformatted_query
