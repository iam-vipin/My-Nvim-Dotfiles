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

"""Cycle lookup helpers for GraphQL operations."""

# Python Imports
from typing import Optional, Union

# Third Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Django Imports
from django.db.models import QuerySet

# Strawberry Imports
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.db.models import Cycle


def cycle_base_query(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> QuerySet[Cycle]:
    """
    Build the base query for cycles.
    """

    query = Cycle.objects.filter(workspace_id=workspace_id)

    if project_id:
        query = query.filter(project_id=project_id)
    if filters:
        query = query.filter(**filters).distinct()

    return query


def get_cycles(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> list[Cycle]:
    """
    Get cycles for a workspace.

    Args:
        workspace_id: Workspace UUID.
        project_id: Optional project UUID to filter cycles.
        filters: Extra Django ORM filters.

    Returns:
        List of cycle instances.

    Raises:
        GraphQLError: SOMETHING_WENT_WRONG (400) if error occurs.
    """

    try:
        base_query = cycle_base_query(workspace_id=workspace_id, project_id=project_id, filters=filters)

        cycles = base_query.all()

        return list(cycles)
    except Exception:
        error_message = "Error getting cycles"
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@sync_to_async
def get_cycles_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> list[Cycle]:
    """Async version of get_cycles. See get_cycles for details."""

    return get_cycles(workspace_id=workspace_id, project_id=project_id, filters=filters)


def get_cycle(
    workspace_id: Union[str, strawberry.ID],
    cycle_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
    raise_exception: Optional[bool] = True,
) -> Optional[Cycle]:
    """
    Get a cycle by id.

    Args:
        workspace_id: Workspace UUID.
        cycle_id: Cycle UUID.
        project_id: Optional project UUID to filter cycle.
        filters: Extra Django ORM filters.
        raise_exception: If True, raises GraphQLError on not found. If False, returns None.

    Returns:
        Cycle instance, or None if not found and raise_exception=False.

    Raises:
        GraphQLError: NOT_FOUND (404) or SOMETHING_WENT_WRONG (400).
    """

    try:
        base_query = cycle_base_query(workspace_id=workspace_id, project_id=project_id, filters={"id": cycle_id})
        if filters:
            base_query = base_query.filter(**filters)

        cycle = base_query.first()
        if not cycle:
            if not raise_exception:
                return None
            error_message = "Cycle not found"
            error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
            raise GraphQLError(message=error_message, extensions=error_extensions)

        return cycle
    except Cycle.DoesNotExist:
        if not raise_exception:
            return None
        error_message = "Cycle not found"
        error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Exception:
        if not raise_exception:
            return None
        error_message = "Error getting cycle"
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@sync_to_async
def get_cycle_async(
    workspace_id: Union[str, strawberry.ID],
    cycle_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
    raise_exception: Optional[bool] = True,
) -> Optional[Cycle]:
    """Async version of get_cycle. See get_cycle for details."""

    return get_cycle(
        workspace_id=workspace_id,
        cycle_id=cycle_id,
        project_id=project_id,
        filters=filters,
        raise_exception=raise_exception,
    )
