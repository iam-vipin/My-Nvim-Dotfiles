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

"""Workspace lookup helpers for GraphQL operations."""

# Python Imports
from typing import Optional, Union

# Third Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Strawberry Imports
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.db.models import Workspace
from plane.graphql.utils.logger import log_graphql_error


def _build_workspace_filters(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
) -> dict:
    """Build filter dict for workspace lookup from id, slug, and extra filters."""

    workspace_filters = {}
    if id:
        workspace_filters["id"] = id
    if slug:
        workspace_filters["slug"] = slug
    if filters:
        workspace_filters.update(filters)
    return workspace_filters


def get_workspace(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
    raise_exception: bool = True,
) -> Optional[Workspace]:
    """
    Get a workspace by id or slug.

    Args:
        id: Workspace UUID.
        slug: Workspace slug.
        filters: Extra Django ORM filters.
        raise_exception: If True, raises GraphQLError on not found. If False, returns None.

    Returns:
        Workspace instance, or None if not found and raise_exception=False.

    Raises:
        GraphQLError: NOT_FOUND (404), INVALID_ARGUMENTS (400), or SOMETHING_WENT_WRONG (400).
    """

    try:
        if not id and not slug:
            raise ValueError("Either id or slug must be provided to build workspace filters")

        workspace_filters = _build_workspace_filters(id=id, slug=slug, filters=filters)
        return Workspace.objects.get(**workspace_filters)
    except ValueError as e:
        error_message = str(e)
        error_extensions = {"code": "INVALID_ARGUMENTS", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Workspace.DoesNotExist:
        if not raise_exception:
            return None

        error_message = f"Workspace not found with filters: {workspace_filters}"
        error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Exception as e:
        if not raise_exception:
            return None

        error_message = f"Error getting workspace with filters: {workspace_filters}"
        log_graphql_error(message=error_message, error=e)
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@sync_to_async
def get_workspace_async(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
    raise_exception: bool = True,
) -> Optional[Workspace]:
    """Async version of get_workspace. See get_workspace for details."""

    return get_workspace(id=id, slug=slug, filters=filters, raise_exception=raise_exception)


def get_workspaces_by_user_id(user_id: Union[str, strawberry.ID], filters: Optional[dict] = None) -> list[Workspace]:
    """
    Get workspaces by user id.

    Args:
        user_id: User ID.
        filters: Extra Django ORM filters.

    Returns:
        List of workspaces.

    Raises:
        Exception: If error occurs.
    """

    try:
        base_query = Workspace.objects.filter(workspace_member__member_id=user_id, workspace_member__is_active=True)
        if filters:
            base_query = base_query.filter(**filters)

        workspaces = base_query.all()

        return list(workspaces)
    except Exception as e:
        log_graphql_error(message=f"Error getting workspaces by user id: {user_id}", error=e)
        return []


@sync_to_async
def get_workspaces_by_user_id_async(
    user_id: Union[str, strawberry.ID], filters: Optional[dict] = None
) -> list[Workspace]:
    """Async version of get_workspaces_by_user_id. See get_workspaces_by_user_id for details."""

    return get_workspaces_by_user_id(user_id=user_id, filters=filters)
