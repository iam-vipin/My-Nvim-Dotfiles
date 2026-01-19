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

# Python Imports
import copy
from typing import Optional

# Third-Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Django Imports
from django.db.models import Exists, OuterRef, Q, Subquery
from django.utils import timezone

# Strawberry Imports
from strawberry.permission import PermissionExtension
from strawberry.scalars import JSON
from strawberry.types import Info

# Module Imports
from plane.db.models import (
    IntakeIssue,
    Issue,
    IssueAssignee,
    IssueSubscriber,
    Notification,
    WorkspaceMember,
)
from plane.graphql.helpers.notification import (
    get_unread_notification_count_by_user_id_async,
    get_unread_workspace_notification_count_by_user_id_async,
)
from plane.graphql.helpers.teamspace import build_teamspace_project_access_filter_async
from plane.graphql.helpers.workspace import get_workspace_async
from plane.graphql.permissions.workspace import IsAuthenticated, WorkspaceBasePermission
from plane.graphql.types.notification import NotificationCountType, NotificationType
from plane.graphql.types.paginator import PaginatorResponse
from plane.graphql.types.teamspace import TeamspaceProjectQueryPathEnum
from plane.graphql.utils.paginator import query_paginate_async


@strawberry.type
class NotificationCountQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[IsAuthenticated()])])
    async def notification_count(self, info: Info) -> NotificationCountType:
        user = info.context.user
        user_id = str(user.id)

        global_notification_count = await get_unread_notification_count_by_user_id_async(user_id=user_id)
        workspaces_notification_counts = await get_unread_workspace_notification_count_by_user_id_async(user_id=user_id)

        return NotificationCountType(
            unread=global_notification_count.unread,
            mentioned=global_notification_count.mentioned,
            workspaces=workspaces_notification_counts,
        )


@strawberry.type
class NotificationQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[WorkspaceBasePermission()])])
    async def notifications(
        self,
        info: Info,
        slug: str,
        type: Optional[JSON] = "all",
        snoozed: Optional[bool] = False,
        archived: Optional[bool] = False,
        mentioned: Optional[bool] = None,
        read: Optional[str] = None,
        cursor: Optional[str] = None,
    ) -> PaginatorResponse[NotificationType]:
        user = info.context.user
        user_id = str(user.id)

        # Get workspace_id first to avoid workspace join in main query
        workspace = await get_workspace_async(slug=slug)
        workspace_id = str(workspace.id)
        workspace_slug = workspace.slug

        # Teamspace Filter - get project IDs the user has access to
        project_teamspace_filter = await build_teamspace_project_access_filter_async(
            user_id=user_id,
            workspace_id=workspace_id,
            workspace_slug=workspace_slug,
            query_path=TeamspaceProjectQueryPathEnum.SINGLE_FK,
        )

        notification_queryset = (
            Notification.objects.filter(project_teamspace_filter.query)
            .filter(workspace_id=workspace_id)
            .filter(receiver_id=user_id)
            .filter(entity_name__in=["issue", "epic"])
        )

        q_filters = Q()

        # Apply snoozed filter
        now = timezone.now()
        snoozed = False if snoozed is None else snoozed
        if snoozed:
            q_filters &= Q(snoozed_till__isnull=False)
        else:
            q_filters &= Q(snoozed_till__lt=now) | Q(snoozed_till__isnull=True)

        # Apply archived filter
        archived = False if archived is None else archived
        if archived:
            q_filters &= Q(archived_at__isnull=False)
        else:
            q_filters &= Q(archived_at__isnull=True)

        # Apply read filter
        if read is not None:
            if read == "true":
                q_filters &= Q(read_at__isnull=False)
            elif read == "false":
                q_filters &= Q(read_at__isnull=True)

        # Apply mentioned filter
        if mentioned is not None:
            if mentioned:
                q_filters &= Q(sender__icontains="mentioned")
            else:
                q_filters &= ~Q(sender__icontains="mentioned")

        type_q_filters = Q()
        if type is not None and type != "all":
            filter_type = type.split(",")

            # Subscribed issues subquery
            if "subscribed" in filter_type:
                subscribed_subquery = (
                    IssueSubscriber.objects.filter(
                        workspace_id=workspace_id, subscriber_id=user_id, issue_id=OuterRef("entity_identifier")
                    )
                    .annotate(
                        created=Exists(
                            Issue.objects.filter(created_by=user, pk=OuterRef("issue_id")).filter(
                                Q(type__isnull=True) | Q(type__is_epic=False)
                            )
                        )
                    )
                    .annotate(
                        assigned=Exists(IssueAssignee.objects.filter(issue_id=OuterRef("issue_id"), assignee=user))
                    )
                    .filter(created=False, assigned=False)
                )

                type_q_filters |= Q(entity_identifier__in=subscribed_subquery.only("issue_id").values("issue_id"))

            # Assigned issues subquery
            if "assigned" in filter_type:
                assigned_subquery = IssueAssignee.objects.filter(
                    workspace_id=workspace_id, assignee_id=user_id, issue_id=OuterRef("entity_identifier")
                )

                type_q_filters |= Q(entity_identifier__in=assigned_subquery.only("issue_id").values("issue_id"))

            # Created issues subquery
            if "created" in filter_type:
                has_permission = await sync_to_async(
                    WorkspaceMember.objects.filter(
                        workspace_id=workspace_id,
                        member=user,
                        role__lt=15,
                        is_active=True,
                    ).exists
                )()
                if has_permission:
                    notification_queryset = notification_queryset.none()
                else:
                    created_subquery = Issue.objects.filter(
                        workspace_id=workspace_id, created_by=user, pk=OuterRef("entity_identifier")
                    ).filter(Q(type__isnull=True) | Q(type__is_epic=False))

                    type_q_filters |= Q(entity_identifier__in=created_subquery.only("id").values("id"))

        q = q_filters & type_q_filters
        notification_queryset = notification_queryset.filter(q)

        # handling the notification count queryset
        notification_count_queryset = copy.deepcopy(notification_queryset)

        # Optimized intake subquery - use single Subquery for intake_id
        intake_id_subquery = IntakeIssue.objects.filter(
            issue_id=OuterRef("entity_identifier"),
            issue__workspace_id=workspace_id,
            status__in=[0, 2, -2],
        ).values("id")[:1]

        # Epic issue subquery
        epic_issue_subquery = Issue.objects.filter(
            pk=OuterRef("entity_identifier"),
            workspace_id=workspace_id,
            type__isnull=False,
            type__is_epic=True,
        ).values("pk")[:1]

        notification_queryset = notification_queryset.annotate(
            intake_id=Subquery(intake_id_subquery),
            is_epic_issue=Exists(epic_issue_subquery),
        )

        notification_queryset = notification_queryset.select_related("project", "triggered_by").order_by(
            "snoozed_till", "-created_at"
        )

        return await query_paginate_async(
            base_queryset=notification_count_queryset,
            query_set=notification_queryset,
            cursor=cursor,
        )
