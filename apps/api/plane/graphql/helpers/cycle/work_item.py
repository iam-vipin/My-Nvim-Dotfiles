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

"""CycleWorkItem lookup helpers for GraphQL operations."""

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
from plane.db.models import CycleIssue

CycleWorkItem = CycleIssue


def cycle_work_item_base_query(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    cycle_id: Optional[Union[str, strawberry.ID]] = None,
    work_item_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> QuerySet[CycleWorkItem]:
    """Build base query for cycle work items with optional filters."""

    query = CycleWorkItem.objects.filter(workspace_id=workspace_id)

    if project_id:
        query = query.filter(project_id=project_id)
    if cycle_id:
        query = query.filter(cycle_id=cycle_id)
    if work_item_id:
        query = query.filter(work_item_id=work_item_id)
    if filters:
        query = query.filter(**filters)

    return query


def get_cycle_work_items(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    cycle_id: Optional[Union[str, strawberry.ID]] = None,
    work_item_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> list[CycleWorkItem]:
    """
    Get cycle work items for a workspace.

    Args:
        workspace_id: Workspace UUID.
        project_id: Optional project UUID.
        cycle_id: Optional cycle UUID.
        work_item_id: Optional work item UUID.
        filters: Extra Django ORM filters.

    Returns:
        List of cycle work item instances.

    Raises:
        GraphQLError: SOMETHING_WENT_WRONG (400) if error occurs.
    """

    try:
        base_query = cycle_work_item_base_query(
            workspace_id=workspace_id,
            project_id=project_id,
            cycle_id=cycle_id,
            work_item_id=work_item_id,
            filters=filters,
        )

        cycle_work_items = base_query.all()

        return list(cycle_work_items)
    except Exception:
        error_message = "Error getting cycle work items"
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@sync_to_async
def get_cycle_work_items_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    cycle_id: Optional[Union[str, strawberry.ID]] = None,
    work_item_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> list[CycleWorkItem]:
    """Async version of get_cycle_work_items. See get_cycle_work_items for details."""

    return get_cycle_work_items(
        workspace_id=workspace_id,
        project_id=project_id,
        cycle_id=cycle_id,
        work_item_id=work_item_id,
        filters=filters,
    )


def get_cycle_work_item(
    workspace_id: Union[str, strawberry.ID],
    cycle_work_item_id: Union[str, strawberry.ID],
    project_id: Optional[Union[str, strawberry.ID]] = None,
    cycle_id: Optional[Union[str, strawberry.ID]] = None,
    work_item_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
    raise_exception: Optional[bool] = True,
) -> Optional[CycleWorkItem]:
    """
    Get a cycle work item by id.

    Args:
        cycle_work_item_id: Cycle work item UUID.
        workspace_id: Workspace UUID.
        project_id: Optional project UUID.
        cycle_id: Optional cycle UUID.
        work_item_id: Optional work item UUID.
        filters: Extra Django ORM filters.
        raise_exception: If True, raises GraphQLError on not found. If False, returns None.

    Returns:
        CycleWorkItem instance, or None if not found and raise_exception=False.

    Raises:
        GraphQLError: NOT_FOUND (404) or SOMETHING_WENT_WRONG (400).
    """

    try:
        base_query = cycle_work_item_base_query(
            workspace_id=workspace_id,
            project_id=project_id,
            cycle_id=cycle_id,
            work_item_id=work_item_id,
            filters=filters,
        )

        if cycle_work_item_id:
            base_query = base_query.filter(id=cycle_work_item_id)

        cycle_work_item = base_query.first()
        if not cycle_work_item:
            if not raise_exception:
                return None
            error_message = "Cycle work item not found"
            error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
            raise GraphQLError(message=error_message, extensions=error_extensions)

        return cycle_work_item
    except CycleWorkItem.DoesNotExist:
        if not raise_exception:
            return None
        error_message = "Cycle work item not found"
        error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Exception:
        if not raise_exception:
            return None
        error_message = "Error getting cycle work item"
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@sync_to_async
def get_cycle_work_item_async(
    workspace_id: Union[str, strawberry.ID],
    cycle_work_item_id: Optional[Union[str, strawberry.ID]] = None,
    project_id: Optional[Union[str, strawberry.ID]] = None,
    cycle_id: Optional[Union[str, strawberry.ID]] = None,
    work_item_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
    raise_exception: Optional[bool] = True,
) -> Optional[CycleWorkItem]:
    """Async version of get_cycle_work_item. See get_cycle_work_item for details."""

    return get_cycle_work_item(
        cycle_work_item_id=cycle_work_item_id,
        workspace_id=workspace_id,
        project_id=project_id,
        cycle_id=cycle_id,
        work_item_id=work_item_id,
        filters=filters,
        raise_exception=raise_exception,
    )
