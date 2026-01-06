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

# python imports
import json
from typing import Optional, Union

# Third-party imports
import strawberry
from asgiref.sync import sync_to_async

# Django imports
from django.utils import timezone

# Strawberry imports
from strawberry.exceptions import GraphQLError
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module imports
from plane.db.models import IssueComment
from plane.graphql.bgtasks.issue_activity_task import issue_activity
from plane.graphql.helpers import (
    get_intake_work_item_async,
    get_project,
    get_workspace_async,
    is_project_intakes_enabled_async,
)
from plane.graphql.permissions.project import ProjectBasePermission
from plane.graphql.types.intake.comment import (
    IntakeWorkItemCommentActivityType,
    IntakeWorkItemCommentInputType,
)


@sync_to_async
def get_work_item_comment(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    parent_id: Optional[Union[str, strawberry.ID]] = None,
    comment_id: Optional[Union[str, strawberry.ID]] = None,
):
    try:
        work_item_comment_query = IssueComment.objects.filter(
            workspace_id=workspace_id, project_id=project_id, issue_id=work_item_id
        )
        if parent_id:
            work_item_comment_query = work_item_comment_query.filter(parent_id=parent_id)
        if comment_id:
            work_item_comment_query = work_item_comment_query.filter(id=comment_id)

        comment = work_item_comment_query.get()

        return comment
    except IssueComment.DoesNotExist:
        message = "Comment does not exist"
        error_extensions = {"code": "COMMENT_DOES_NOT_EXIST", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)
    except Exception as e:
        message = e.message or "Error getting comment"
        error_extensions = e.extensions or {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)


def _validate_who_can_delete_comment(user_id: Union[str, strawberry.ID], comment: IssueComment) -> bool:
    user_id = str(user_id)
    comment_actor_id = str(comment.actor_id)

    if comment_actor_id != user_id:
        message = "You are not allowed to delete this comment"
        error_extensions = {"code": "NOT_ALLOWED_TO_DELETE_COMMENT", "statusCode": 403}
        raise GraphQLError(message, extensions=error_extensions)

    return True


@strawberry.type
class IntakeWorkItemCommentMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def add_intake_work_item_comment(
        self,
        info: Info,
        slug: str,
        project: str,
        intake_work_item: str,
        comment_input: IntakeWorkItemCommentInputType,
    ) -> IntakeWorkItemCommentActivityType:
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug
        workspace_id = str(workspace.id)

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # check if the intake is enabled for the project
        await is_project_intakes_enabled_async(workspace_slug=workspace_slug, project_id=project_id)

        # get the intake work item
        intake_work_item = await get_intake_work_item_async(
            workspace_slug=workspace_slug,
            project_id=project_id,
            intake_work_item_id=intake_work_item,
        )
        intake_work_item_id = str(intake_work_item.issue_id)

        comment_html = comment_input.comment_html

        intake_work_item_comment = await sync_to_async(
            lambda: IssueComment.objects.create(
                workspace_id=workspace_id,
                project_id=project,
                issue_id=intake_work_item_id,
                comment_html=comment_html,
                actor_id=user_id,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
        )()

        comment_activity_payload = {
            "id": str(intake_work_item_comment.id),
            "comment_html": comment_html,
        }

        # update the intake work item comment activity
        issue_activity.delay(
            type="comment.activity.created",
            requested_data=json.dumps(comment_activity_payload),
            actor_id=str(user_id),
            project_id=str(project),
            issue_id=str(intake_work_item_id),
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return intake_work_item_comment

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def delete_intake_work_item_comment(
        self,
        info: Info,
        slug: str,
        project: str,
        intake_work_item: str,
        comment: str,
    ) -> bool:
        # user details
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace_details = await get_workspace_async(slug=slug)
        workspace_id = str(workspace_details.id)
        workspace_slug = workspace_details.slug

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # check if the intake is enabled for the project
        await is_project_intakes_enabled_async(workspace_slug=workspace_slug, project_id=project_id)

        # get the intake work item
        intake_work_item = await get_intake_work_item_async(
            workspace_slug=workspace_slug,
            project_id=project_id,
            intake_work_item_id=intake_work_item,
        )
        intake_work_item_id = str(intake_work_item.issue_id)

        # get the work item comment
        intake_work_item_comment = await get_work_item_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=intake_work_item_id,
            comment_id=comment,
            parent_id=None,
        )
        intake_work_item_comment_id = str(intake_work_item_comment.id)

        # validate who can delete the comment
        _validate_who_can_delete_comment(user_id, intake_work_item_comment)

        # comment activity payload
        comment_activity_payload = {
            "comment_id": intake_work_item_comment_id,
        }

        # delete the work item comment
        await sync_to_async(intake_work_item_comment.delete)()

        # update the issue comment activity
        issue_activity.delay(
            type="comment.activity.deleted",
            requested_data=json.dumps(comment_activity_payload),
            actor_id=user_id,
            issue_id=intake_work_item_id,
            project_id=project_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return True


@strawberry.type
class IntakeWorkItemCommentReplyMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def add_intake_work_item_comment_reply(
        self,
        info: Info,
        slug: str,
        project: str,
        intake_work_item: str,
        comment: str,
        comment_input: IntakeWorkItemCommentInputType,
    ) -> IntakeWorkItemCommentActivityType:
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug
        workspace_id = str(workspace.id)

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # check if the intake is enabled for the project
        await is_project_intakes_enabled_async(workspace_slug=workspace_slug, project_id=project_id)

        # get the intake work item
        intake_work_item = await get_intake_work_item_async(
            workspace_slug=workspace_slug,
            project_id=project_id,
            intake_work_item_id=intake_work_item,
        )
        intake_work_item_id = str(intake_work_item.issue_id)

        # get the work item comment
        intake_work_item_comment = await get_work_item_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=intake_work_item_id,
            comment_id=comment,
        )
        intake_work_item_comment_id = str(intake_work_item_comment.id)

        comment_html = comment_input.comment_html

        intake_work_item_comment_reply = await sync_to_async(
            lambda: IssueComment.objects.create(
                workspace_id=workspace_id,
                project_id=project_id,
                issue_id=intake_work_item_id,
                parent_id=intake_work_item_comment_id,
                comment_html=comment_html,
                actor_id=user_id,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
        )()
        intake_work_item_comment_reply_id = str(intake_work_item_comment_reply.id)

        intake_work_item_comment_reply_activity_payload = {
            "id": intake_work_item_comment_reply_id,
            "comment_html": comment_html,
        }

        # update the intake work item comment activity
        issue_activity.delay(
            type="comment.activity.created",
            requested_data=json.dumps(intake_work_item_comment_reply_activity_payload),
            actor_id=user_id,
            project_id=project_id,
            issue_id=intake_work_item_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return intake_work_item_comment_reply

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def delete_intake_work_item_comment_reply(
        self,
        info: Info,
        slug: str,
        project: str,
        intake_work_item: str,
        comment: str,
        reply: str,
    ) -> bool:
        # user details
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace_details = await get_workspace_async(slug=slug)
        workspace_id = str(workspace_details.id)
        workspace_slug = workspace_details.slug

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # check if the intake is enabled for the project
        await is_project_intakes_enabled_async(workspace_slug=workspace_slug, project_id=project_id)

        # get the intake work item
        intake_work_item = await get_intake_work_item_async(
            workspace_slug=workspace_slug,
            project_id=project_id,
            intake_work_item_id=intake_work_item,
        )
        intake_work_item_id = str(intake_work_item.issue_id)

        # get the work item comment
        intake_work_item_comment = await get_work_item_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=intake_work_item_id,
            comment_id=comment,
            parent_id=None,
        )
        intake_work_item_comment_id = str(intake_work_item_comment.id)

        # get the work item comment reply
        intake_work_item_comment_reply = await get_work_item_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=intake_work_item_id,
            parent_id=intake_work_item_comment_id,
            comment_id=reply,
        )
        intake_work_item_comment_reply_id = str(intake_work_item_comment_reply.id)

        # validate who can delete the comment
        _validate_who_can_delete_comment(user_id, intake_work_item_comment_reply)

        # comment activity payload
        comment_activity_payload = {
            "comment_id": intake_work_item_comment_reply_id,
        }

        # delete the work item comment
        await sync_to_async(intake_work_item_comment_reply.delete)()

        # update the issue comment activity
        issue_activity.delay(
            type="comment.activity.deleted",
            requested_data=json.dumps(comment_activity_payload),
            actor_id=user_id,
            issue_id=intake_work_item_id,
            project_id=project_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return True
