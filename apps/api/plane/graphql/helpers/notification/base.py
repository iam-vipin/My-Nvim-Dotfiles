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

"""Notification lookup helpers for GraphQL operations."""

# Python imports
from typing import Optional, Union

# Third-Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Module imports
from plane.db.models import Notification
from plane.graphql.types.notification import NotificationCountBaseType, NotificationCountWorkspaceType

# Local imports
from ..workspace import get_workspaces_by_user_id


def get_unread_notification_count(
    user_id: Union[str, strawberry.ID],
    workspace_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
    exclude_filters: Optional[dict] = None,
) -> int:
    """
    Build and execute query to get unread notification count.

    Args:
        user_id: User ID to fetch notifications for.
        workspace_id: Optional workspace ID to filter notifications.
        filters: Extra Django ORM filters.
        exclude_filters: Extra Django ORM exclude filters.

    Returns:
        Count of unread notifications.
    """

    try:
        notification_query = Notification.objects.filter(
            receiver_id=user_id,
            read_at__isnull=True,
            snoozed_till__isnull=True,
            archived_at__isnull=True,
        )

        # filter by workspace
        if workspace_id:
            notification_query = notification_query.filter(workspace_id=workspace_id)

        if exclude_filters:
            notification_query = notification_query.exclude(**exclude_filters)

        if filters:
            notification_query = notification_query.filter(**filters)

        notification_count = notification_query.count()

        return notification_count
    except Exception as e:
        print(f"Error fetching unread notification count: {e}")
        return 0


def get_unread_notification_count_by_user_id(
    user_id: Union[str, strawberry.ID],
) -> NotificationCountBaseType:
    """
    Get unread notification count for a user.

    Args:
        user_id: User ID to fetch notifications for.

    Returns:
        NotificationCountBaseType with unread and mentioned counts.
    """

    unread_notification_count = get_unread_notification_count(user_id=user_id)

    # TODO: Implement mentioned unread notification count in future requirements
    mentioned_unread_notification_count = 0
    # mentioned_unread_notification_count = get_unread_notification_count(
    #     user_id=user_id, filters={"sender__icontains": "mentioned"}
    # )
    return NotificationCountBaseType(unread=unread_notification_count, mentioned=mentioned_unread_notification_count)


@sync_to_async
def get_unread_notification_count_by_user_id_async(
    user_id: Union[str, strawberry.ID],
) -> NotificationCountBaseType:
    """
    Async version of get_unread_notification_count_by_user_id.

    See get_unread_notification_count_by_user_id for details.
    """

    return get_unread_notification_count_by_user_id(user_id)


def get_unread_workspace_notification_count_by_user_id(
    user_id: Union[str, strawberry.ID],
) -> list[NotificationCountWorkspaceType]:
    """
    Get unread notification count for a user across all workspaces.

    Args:
        user_id: User ID to fetch notifications for.

    Returns:
        List of NotificationCountWorkspaceType with unread and mentioned counts for each workspace.
    """

    workspaces = get_workspaces_by_user_id(user_id=user_id)

    if len(workspaces) <= 0:
        return []

    workspaces_notification_counts = []

    for workspace in workspaces:
        workspace_id = str(workspace.id)
        workspace_slug = workspace.slug
        workspace_name = workspace.name

        unread_notification_count = get_unread_notification_count(user_id=user_id, workspace_id=workspace_id)

        # TODO: Implement mentioned unread notification count in future requirements
        mentioned_unread_notification_count = 0
        # mentioned_unread_notification_count = get_unread_notification_count(
        #     user_id=user_id, workspace_id=workspace_id, filters={"sender__icontains": "mentioned"}
        # )

        workspaces_notification_counts.append(
            NotificationCountWorkspaceType(
                id=workspace_id,
                slug=workspace_slug,
                name=workspace_name,
                unread=unread_notification_count,
                mentioned=mentioned_unread_notification_count,
            )
        )

    return workspaces_notification_counts


@sync_to_async
def get_unread_workspace_notification_count_by_user_id_async(
    user_id: Union[str, strawberry.ID],
) -> list[NotificationCountWorkspaceType]:
    """
    Async version of get_unread_workspace_notification_count_by_user_id.

    See get_unread_workspace_notification_count_by_user_id for details.
    """

    return get_unread_workspace_notification_count_by_user_id(user_id=user_id)
