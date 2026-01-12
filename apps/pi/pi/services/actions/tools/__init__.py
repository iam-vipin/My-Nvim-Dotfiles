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
from .customers import get_customer_tools
from .cycles import get_cycle_tools
from .initiatives import get_initiative_tools
from .intake import get_intake_tools
from .labels import get_label_tools
from .links import get_link_tools
from .members import get_member_tools
from .modules import get_module_tools
from .pages import get_page_tools
from .projects import get_project_tools
from .properties import get_property_tools
from .states import get_state_tools
from .stickies import get_sticky_tools
from .teamspaces import get_teamspace_tools
from .types import get_type_tools
from .users import get_user_tools
from .workitems import get_workitem_tools
from .worklogs import get_worklog_tools
from .workspaces import get_workspace_tools

CATEGORY_TO_PROVIDER: Dict[str, Callable] = {
    "activity": get_activity_tools,
    "activities": get_activity_tools,
    "assets": get_asset_tools,
    "asset": get_asset_tools,
    "attachments": get_attachment_tools,
    "attachment": get_attachment_tools,
    "comments": get_comment_tools,
    "comment": get_comment_tools,
    "customers": get_customer_tools,
    "customer": get_customer_tools,
    "cycles": get_cycle_tools,
    "cycle": get_cycle_tools,
    "intake": get_intake_tools,
    "intakes": get_intake_tools,
    "initiatives": get_initiative_tools,
    "initiative": get_initiative_tools,
    "labels": get_label_tools,
    "label": get_label_tools,
    "links": get_link_tools,
    "link": get_link_tools,
    "members": get_member_tools,
    "member": get_member_tools,
    "modules": get_module_tools,
    "module": get_module_tools,
    "pages": get_page_tools,
    "page": get_page_tools,
    "projects": get_project_tools,
    "project": get_project_tools,
    "properties": get_property_tools,
    "property": get_property_tools,
    "states": get_state_tools,
    "state": get_state_tools,
    "stickies": get_sticky_tools,
    "sticky": get_sticky_tools,
    "teamspaces": get_teamspace_tools,
    "teamspace": get_teamspace_tools,
    "types": get_type_tools,
    "type": get_type_tools,
    "users": get_user_tools,
    "user": get_user_tools,
    "workitems": get_workitem_tools,
    "workitem": get_workitem_tools,
    "worklogs": get_worklog_tools,
    "worklog": get_worklog_tools,
    "workspaces": get_workspace_tools,
    "workspace": get_workspace_tools,
}


def get_tools_for_category(category: str, method_executor, context: Dict[str, Any]) -> List[BaseTool]:
    """Return the LangChain tools for a category using the explicit provider mapping."""
    provider = CATEGORY_TO_PROVIDER.get(category)
    if not provider:
        return []
    return provider(method_executor, context)


__all__ = ["get_tools_for_category"]
