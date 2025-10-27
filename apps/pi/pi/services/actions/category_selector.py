"""
Category Selector for Plane Actions
Handles the first step of hierarchical action execution.
"""

from typing import Dict

from .registry import get_available_categories


class CategorySelector:
    """Selects appropriate API category based on user intent"""

    @staticmethod
    def get_available_categories() -> Dict[str, str]:
        """Get available API categories with descriptions"""
        return get_available_categories()

    @staticmethod
    def get_category_for_intent(intent: str) -> str:
        """Simple intent-to-category mapping"""
        intent_lower = intent.lower()

        # Cycles keywords
        if any(keyword in intent_lower for keyword in ["cycle", "sprint", "iteration"]):
            return "cycles"

        # Work items keywords
        if any(keyword in intent_lower for keyword in ["issue", "work item", "task", "bug", "feature", "assign", "priority", "state"]):
            return "workitems"

        # Projects keywords
        if any(keyword in intent_lower for keyword in ["project", "workspace"]):
            return "projects"

        # Labels keywords
        if any(keyword in intent_lower for keyword in ["label", "tag"]):
            return "labels"

        # States keywords
        if any(keyword in intent_lower for keyword in ["state", "status", "stage"]):
            return "states"

        # Modules keywords
        if any(keyword in intent_lower for keyword in ["module", "component"]):
            return "modules"

        # Assets keywords
        if any(keyword in intent_lower for keyword in ["asset", "file", "attachment"]):
            return "assets"

        # Users keywords
        if any(keyword in intent_lower for keyword in ["user", "member", "profile"]):
            return "users"

        # Pages keywords
        if any(keyword in intent_lower for keyword in ["page", "note", "wiki", "notepad"]):
            return "pages"

        # No default fallback - let the LLM handle ambiguous cases with NO_ACTIONS_PLANNED
        return ""
