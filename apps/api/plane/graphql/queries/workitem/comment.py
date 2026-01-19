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

# Python Standard Library Imports
import strawberry
from asgiref.sync import sync_to_async

# Django Imports
from django.db.models import Count, OuterRef, Prefetch, Q, Subquery
from django.db.models.functions import Coalesce

# Strawberry Imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module Imports
from plane.db.models import CommentReaction, IssueComment
from plane.graphql.helpers.teamspace import project_member_filter_via_teamspaces_async
from plane.graphql.permissions.project import ProjectBasePermission
from plane.graphql.types.issues.comment import IssueCommentActivityType


@strawberry.type
class IssueCommentActivityQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def issue_comment_activities(
        self, info: Info, slug: str, project: strawberry.ID, issue: strawberry.ID
    ) -> list[IssueCommentActivityType]:
        user = info.context.user
        user_id = str(user.id)

        project_teamspace_filter = await project_member_filter_via_teamspaces_async(
            user_id=user_id,
            workspace_slug=slug,
        )

        comment_replies_count_subquery = Coalesce(
            Subquery(
                IssueComment.objects.filter(parent_id=OuterRef("id"))
                .values("parent_id")
                .annotate(count=Count("id"))
                .values("count")
            ),
            0,
        )

        issue_comments = await sync_to_async(list)(
            IssueComment.all_objects.filter(workspace__slug=slug)
            .filter(project__id=project)
            .filter(issue_id=issue)
            .filter(project_teamspace_filter.query)
            .annotate(comment_replies_count=comment_replies_count_subquery)
            .filter(Q(deleted_at__isnull=True) | Q(comment_replies_count__gt=0))
            .distinct()
            .order_by("created_at")
            .select_related("actor", "issue", "project", "workspace")
            .prefetch_related(
                Prefetch(
                    "comment_reactions",
                    queryset=CommentReaction.objects.select_related("actor"),
                )
            )
        )

        return issue_comments
