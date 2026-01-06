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
Properties API tools for Plane custom property management.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing property actions


def get_property_tools(method_executor, context):
    """Return LangChain tools for the properties category using method_executor and context."""
    """Get all Properties API tools."""

    @tool
    async def properties_create(
        display_name: str,
        property_type: str,
        type_id: str,
        relation_type: Optional[str] = None,
        description: Optional[str] = None,
        is_required: Optional[bool] = None,
        default_value: Optional[list] = None,
        settings: Optional[dict] = None,
        is_active: Optional[bool] = None,
        is_multi: Optional[bool] = None,
        validation_rules: Optional[dict] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new work item property.

        Args:
            display_name: Display name for the property (required)
            property_type: Type of property - TEXT, DATETIME, DECIMAL, BOOLEAN, OPTION, RELATION, URL, EMAIL, FILE (required)
            type_id: Work item type ID this property belongs to (required)
            relation_type: Relation type for RELATION properties - ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY
            description: Description of the property
            is_required: Whether this property is required for work items
            default_value: List of default values for the property
            settings: Property settings (TextAttributeSettings for TEXT, DateAttributeSettings for DATETIME)
            is_active: Whether the property is active
            is_multi: Whether this property supports multiple values
            validation_rules: Validation rules for the property
            external_source: External system source identifier (e.g., 'github', 'jira')
            external_id: External system's identifier for this property
            project_id: Project ID (auto-filled from context if not provided)
            workspace_slug: Workspace slug (auto-filled from context if not provided)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "create",
            display_name=display_name,
            property_type=property_type,
            type_id=type_id,
            relation_type=relation_type,
            description=description,
            is_required=is_required,
            default_value=default_value,
            settings=settings,
            is_active=is_active,
            is_multi=is_multi,
            validation_rules=validation_rules,
            external_source=external_source,
            external_id=external_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload(f"Successfully created property '{display_name}'", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create property", result["error"])

    @tool
    async def properties_list(
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List all work item properties for a specific work item type.

        Args:
            type_id: Work item type ID to list properties for (required)
            project_id: Project ID (auto-filled from context if not provided)
            workspace_slug: Workspace slug (auto-filled from context if not provided)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "list",
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved properties list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list properties", result["error"])

    @tool
    async def properties_retrieve(
        property_id: str,
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get a single work item property by ID.

        Args:
            property_id: Property ID to retrieve (required)
            type_id: Work item type ID this property belongs to (required)
            project_id: Project ID (auto-filled from context if not provided)
            workspace_slug: Workspace slug (auto-filled from context if not provided)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "retrieve",
            property_id=property_id,
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved property", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve property", result["error"])

    @tool
    async def properties_update(
        property_id: str,
        type_id: str,
        display_name: Optional[str] = None,
        property_type: Optional[str] = None,
        relation_type: Optional[str] = None,
        description: Optional[str] = None,
        is_required: Optional[bool] = None,
        default_value: Optional[list] = None,
        settings: Optional[dict] = None,
        is_active: Optional[bool] = None,
        is_multi: Optional[bool] = None,
        validation_rules: Optional[dict] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update work item property details.

        Args:
            property_id: Property ID to update (required)
            type_id: Work item type ID this property belongs to (required)
            display_name: Display name for the property
            property_type: Type of property - TEXT, DATETIME, DECIMAL, BOOLEAN, OPTION, RELATION, URL, EMAIL, FILE
            relation_type: Relation type for RELATION properties - ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY
            description: Description of the property
            is_required: Whether this property is required for work items
            default_value: List of default values for the property
            settings: Property settings (TextAttributeSettings for TEXT, DateAttributeSettings for DATETIME)
            is_active: Whether the property is active
            is_multi: Whether this property supports multiple values
            validation_rules: Validation rules for the property
            external_source: External system source identifier (e.g., 'github', 'jira')
            external_id: External system's identifier for this property
            project_id: Project ID (auto-filled from context if not provided)
            workspace_slug: Workspace slug (auto-filled from context if not provided)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data: dict[str, Any] = {}
        if display_name is not None:
            update_data["display_name"] = display_name
        if property_type is not None:
            update_data["property_type"] = property_type
        if relation_type is not None:
            update_data["relation_type"] = relation_type
        if description is not None:
            update_data["description"] = description
        if is_required is not None:
            update_data["is_required"] = is_required
        if default_value is not None:
            update_data["default_value"] = default_value
        if settings is not None:
            update_data["settings"] = settings
        if is_active is not None:
            update_data["is_active"] = is_active
        if is_multi is not None:
            update_data["is_multi"] = is_multi
        if validation_rules is not None:
            update_data["validation_rules"] = validation_rules
        if external_source is not None:
            update_data["external_source"] = external_source
        if external_id is not None:
            update_data["external_id"] = external_id

        result = await method_executor.execute(
            "properties",
            "update",
            property_id=property_id,
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated property", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update property", result["error"])

    @tool
    async def properties_delete(
        property_id: str,
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete a work item property.

        Args:
            property_id: Property ID to delete (required)
            type_id: Work item type ID this property belongs to (required)
            project_id: Project ID (auto-filled from context if not provided)
            workspace_slug: Workspace slug (auto-filled from context if not provided)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "delete",
            property_id=property_id,
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully deleted property", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete property", result["error"])

    @tool
    async def properties_create_option(
        property_id: str,
        type_id: str,
        name: str,
        value: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "create_option",
            property_id=property_id,
            type_id=type_id,
            name=name,
            value=value,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully created property option", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create property option", result["error"])

    @tool
    async def properties_create_value(
        property_id: str,
        type_id: str,
        issue_id: str,
        value: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a property value."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "create_value",
            property_id=property_id,
            type_id=type_id,
            issue_id=issue_id,
            value=value,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully created property value", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create property value", result["error"])

    @tool
    async def properties_list_options(
        property_id: str,
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List property options."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "list_options",
            property_id=property_id,
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved property options", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list property options", result["error"])

    @tool
    async def properties_list_values(
        type_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List property values."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "list_values",
            type_id=type_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved property values", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list property values", result["error"])

    @tool
    async def properties_retrieve_option(
        property_id: str,
        type_id: str,
        option_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get property option by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "retrieve_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved property option", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve property option", result["error"])

    @tool
    async def properties_update_option(
        property_id: str,
        type_id: str,
        option_id: str,
        name: Optional[str] = None,
        value: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if value is not None:
            update_data["value"] = value

        result = await method_executor.execute(
            "properties",
            "update_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated property option", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update property option", result["error"])

    @tool
    async def properties_delete_option(
        property_id: str,
        type_id: str,
        option_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "delete_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully deleted property option", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete property option", result["error"])

    return [
        properties_create,
        properties_list,
        properties_retrieve,
        properties_update,
        properties_delete,
        properties_create_option,
        properties_create_value,
        properties_list_options,
        properties_list_values,
        properties_retrieve_option,
        properties_update_option,
        properties_delete_option,
    ]
