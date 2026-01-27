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
Customers API tools for Plane customer relationship management.
"""

from typing import Dict

from pi.services.actions.tool_generator import generate_tools_for_category
from pi.services.actions.tool_metadata import ToolMetadata
from pi.services.actions.tool_metadata import ToolParameter

# ============================================================================
# CUSTOMERS TOOL DEFINITIONS
# ============================================================================

CUSTOMER_TOOL_DEFINITIONS: Dict[str, ToolMetadata] = {
    "create": ToolMetadata(
        name="customers_create",
        description="Create a new customer",
        sdk_method="create_customer",
        returns_entity_type="customer",
        parameters=[
            ToolParameter(
                name="name",
                type="str",
                required=True,
                description="Customer name (required)",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="description",
                type="Optional[str]",
                required=False,
                description="Plain text description (optional)",
            ),
            ToolParameter(
                name="description_html",
                type="Optional[str]",
                required=False,
                description="HTML description (optional)",
            ),
            ToolParameter(
                name="email",
                type="Optional[str]",
                required=False,
                description="Customer contact email (optional)",
            ),
            ToolParameter(
                name="website_url",
                type="Optional[str]",
                required=False,
                description="Customer website URL (optional)",
            ),
            ToolParameter(
                name="logo_props",
                type="Optional[dict]",
                required=False,
                description="Logo configuration JSON (optional)",
            ),
            ToolParameter(
                name="domain",
                type="Optional[str]",
                required=False,
                description="Customer domain (optional)",
            ),
            ToolParameter(
                name="employees",
                type="Optional[int]",
                required=False,
                description="Number of employees (optional)",
            ),
            ToolParameter(
                name="stage",
                type="Optional[str]",
                required=False,
                description="Customer stage/lifecycle. Valid values: 'lead', 'sales_qualified_lead', 'contract_negotiation', 'closed_won', 'closed_lost' (optional)",  # noqa E501
            ),
            ToolParameter(
                name="contract_status",
                type="Optional[str]",
                required=False,
                description="Contract status. Valid values: 'active', 'pre_contract', 'signed', 'inactive' (optional)",
            ),
            ToolParameter(
                name="revenue",
                type="Optional[float]",
                required=False,
                description="Annual revenue (optional)",
            ),
        ],
    ),
    "list": ToolMetadata(
        name="customers_list",
        description="List all customers in the workspace",
        sdk_method="list_customers",
        parameters=[
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "retrieve": ToolMetadata(
        name="customers_retrieve",
        description="Retrieve a single customer by ID",
        sdk_method="retrieve_customer",
        parameters=[
            ToolParameter(
                name="customer_id",
                type="str",
                required=True,
                description="Customer ID (required)",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "update": ToolMetadata(
        name="customers_update",
        description="Update customer details",
        sdk_method="update_customer",
        returns_entity_type="customer",
        parameters=[
            ToolParameter(
                name="customer_id",
                type="str",
                required=True,
                description="Customer ID (required)",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="name",
                type="Optional[str]",
                required=False,
                description="New customer name",
            ),
            ToolParameter(
                name="description",
                type="Optional[str]",
                required=False,
                description="New plain text description",
            ),
            ToolParameter(
                name="description_html",
                type="Optional[str]",
                required=False,
                description="New HTML description",
            ),
            ToolParameter(
                name="email",
                type="Optional[str]",
                required=False,
                description="New contact email",
            ),
            ToolParameter(
                name="website_url",
                type="Optional[str]",
                required=False,
                description="New website URL",
            ),
            ToolParameter(
                name="logo_props",
                type="Optional[dict]",
                required=False,
                description="New logo configuration JSON",
            ),
            ToolParameter(
                name="domain",
                type="Optional[str]",
                required=False,
                description="New domain",
            ),
            ToolParameter(
                name="employees",
                type="Optional[int]",
                required=False,
                description="New employee count",
            ),
            ToolParameter(
                name="stage",
                type="Optional[str]",
                required=False,
                description="New customer stage. Valid values: 'lead', 'sales_qualified_lead', 'contract_negotiation', 'closed_won', 'closed_lost'",
            ),
            ToolParameter(
                name="contract_status",
                type="Optional[str]",
                required=False,
                description="New contract status. Valid values: 'active', 'pre_contract', 'signed', 'inactive'",
            ),
            ToolParameter(
                name="revenue",
                type="Optional[float]",
                required=False,
                description="New annual revenue",
            ),
        ],
    ),
    "delete": ToolMetadata(
        name="customers_delete",
        description="Delete a customer",
        sdk_method="delete_customer",
        parameters=[
            ToolParameter(
                name="customer_id",
                type="str",
                required=True,
                description="Customer ID (required)",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
}


# ============================================================================
# TOOL FACTORY
# ============================================================================


def get_customer_tools(method_executor, context):
    """Return LangChain tools for the customers category using auto-generation from metadata."""
    return generate_tools_for_category(
        category="customers",
        method_executor=method_executor,
        context=context,
        tool_definitions=CUSTOMER_TOOL_DEFINITIONS,
    )
