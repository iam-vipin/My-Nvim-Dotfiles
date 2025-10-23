"""Query parsing utilities to avoid circular imports."""

from typing import Optional
from typing import Tuple

from bs4 import BeautifulSoup

# Import MENTION_TAGS from settings to avoid circular import
from pi import settings

MENTION_TAGS = settings.chat.MENTION_TAGS


def parse_query(query: str) -> Tuple[Optional[str], str]:
    """
    Parse a query to extract mentions and clean the text.

    Args:
        query: Input query string that may contain HTML and mentions

    Returns:
        Tuple of (mention_target, cleaned_query) where mention_target is the target
        of the last mention found, or None if no mentions
    """
    # Wrap query in <p> if not already wrapped
    if not query.strip().startswith("<p") and not query.strip().endswith("</p>"):
        query = f"<p>{query}</p>"

    soup = BeautifulSoup(query, "html.parser")
    p_tags = soup.find_all("p")
    if not p_tags:
        return None, query

    # Track last mention for return value
    last_mention_target = None
    last_mention_id = None
    combined_text = ""

    # Process each p tag
    for p_tag in p_tags:
        text = ""
        for content in p_tag.contents:
            if isinstance(content, str):
                text += content
            elif content.name == "mention-component":
                mention_id = content.get("id")
                mention_target = content.get("target")
                mention_tag_name = MENTION_TAGS.get(mention_target, "")
                text += f"{mention_tag_name} with id: {mention_id}"
                # Store last mention for return value
                last_mention_target = mention_target
                last_mention_id = mention_id
            else:
                text += str(content)
        combined_text += text.strip() + "\n"

    reformated_query = combined_text.strip()

    # Return based on whether we found any mentions
    if last_mention_target and last_mention_id:
        return last_mention_target, reformated_query
    return None, reformated_query
