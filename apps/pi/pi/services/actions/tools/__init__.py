"""
Modular tools package for Plane API interactions.

This package organizes Plane API tools into logical categories for better maintainability.
Each module contains tools for a specific API domain (projects, work items, cycles, etc.).
"""

from typing import Any
from typing import Callable
from typing import Dict
from typing import List

from langchain_core.tools import BaseTool

# Explicit mapping of categories to their provider factories
# Import provider factories explicitly to make wiring obvious and avoid side effects
from .activity import get_activity_tools
from .assets import get_asset_tools
from .attachments import get_attachment_tools
from .comments import get_comment_tools
from .cycles import get_cycle_tools
from .intake import get_intake_tools
from .labels import get_label_tools
from .links import get_link_tools
from .members import get_member_tools
from .modules import get_module_tools
from .pages import get_page_tools
from .projects import get_project_tools
from .properties import get_property_tools
from .states import get_state_tools
from .types import get_type_tools
from .users import get_user_tools
from .workitems import get_workitem_tools
from .worklogs import get_worklog_tools

CATEGORY_TO_PROVIDER: Dict[str, Callable] = {
    "activity": get_activity_tools,
    "assets": get_asset_tools,
    "attachments": get_attachment_tools,
    "comments": get_comment_tools,
    "cycles": get_cycle_tools,
    "intake": get_intake_tools,
    "labels": get_label_tools,
    "links": get_link_tools,
    "members": get_member_tools,
    "modules": get_module_tools,
    "pages": get_page_tools,
    "projects": get_project_tools,
    "properties": get_property_tools,
    "states": get_state_tools,
    "types": get_type_tools,
    "users": get_user_tools,
    "workitems": get_workitem_tools,
    "worklogs": get_worklog_tools,
}


def get_tools_for_category(category: str, method_executor, context: Dict[str, Any]) -> List[BaseTool]:
    """Return the LangChain tools for a category using the explicit provider mapping."""
    provider = CATEGORY_TO_PROVIDER.get(category)
    if not provider:
        return []
    return provider(method_executor, context)


__all__ = ["get_tools_for_category"]
