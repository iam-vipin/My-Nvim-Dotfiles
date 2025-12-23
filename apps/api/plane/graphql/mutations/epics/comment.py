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
    get_workspace_async,
    is_epic_feature_flagged,
    is_project_epics_enabled,
    get_project,
    get_epic,
)
from plane.graphql.permissions.project import ProjectBasePermission
from plane.graphql.types.epics.comment import (
    EpicCommentActivityType,
    EpicCommentInputType,
)


@sync_to_async
def get_epic_comment(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    parent_id: Optional[Union[str, strawberry.ID]] = None,
    comment_id: Optional[Union[str, strawberry.ID]] = None,
):
    try:
        work_item_comment_query = IssueComment.objects.filter(
            workspace_id=workspace_id, project_id=project_id, issue_id=epic_id
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
class EpicCommentMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def add_epic_comment(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
        comment_input: EpicCommentInputType,
    ) -> EpicCommentActivityType:
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace_details = await get_workspace_async(slug=slug)
        workspace_id = str(workspace_details.id)
        workspace_slug = workspace_details.slug

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # get the epic
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        comment_html = comment_input.comment_html

        # create the epic comment
        epic_comment = await sync_to_async(
            lambda: IssueComment.objects.create(
                workspace_id=workspace_id,
                project_id=project_id,
                issue_id=epic_id,
                comment_html=comment_html,
                actor_id=user_id,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
        )()

        # comment activity payload
        comment_activity_payload = {
            "id": str(epic_comment.id),
            "comment_html": comment_html,
        }

        # update the epic comment activity
        issue_activity.delay(
            type="comment.activity.created",
            requested_data=json.dumps(comment_activity_payload),
            actor_id=user_id,
            project_id=project_id,
            issue_id=epic_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return epic_comment

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def delete_epic_comment(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
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

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project)

        # get the work item
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        # get the work item comment
        epic_comment = await get_epic_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic_id,
            comment_id=comment,
            parent_id=None,
        )
        epic_comment_id = str(epic_comment.id)

        # validate who can delete the comment
        _validate_who_can_delete_comment(user_id, epic_comment)

        # comment activity payload
        comment_activity_payload = {
            "comment_id": epic_comment_id,
        }

        # delete the work item comment
        await sync_to_async(epic_comment.delete)()

        # update the issue comment activity
        issue_activity.delay(
            type="comment.activity.deleted",
            requested_data=json.dumps(comment_activity_payload),
            actor_id=user_id,
            issue_id=epic_id,
            project_id=project_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return True


@strawberry.type
class EpicCommentReplyMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def add_epic_comment_reply(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
        comment: str,
        comment_input: EpicCommentInputType,
    ) -> EpicCommentActivityType:
        user = info.context.user
        user_id = str(user.id)

        # get the workspace
        workspace_details = await get_workspace_async(slug=slug)
        workspace_id = str(workspace_details.id)
        workspace_slug = workspace_details.slug

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # get the epic
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        # get the epic comment
        epic_comment = await get_epic_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic_id,
            comment_id=comment,
        )
        epic_comment_id = str(epic_comment.id)

        comment_html = comment_input.comment_html

        # create the epic comment reply
        epic_comment_reply = await sync_to_async(
            lambda: IssueComment.objects.create(
                workspace_id=workspace_id,
                project_id=project_id,
                issue_id=epic_id,
                parent_id=epic_comment_id,
                comment_html=comment_html,
                actor_id=user_id,
                created_by_id=user_id,
                updated_by_id=user_id,
            )
        )()

        # comment reply activity payload
        epic_comment_reply_activity_payload = {
            "id": str(epic_comment_reply.id),
            "comment_html": comment_html,
        }

        # update the epic comment activity
        issue_activity.delay(
            type="comment.activity.created",
            requested_data=json.dumps(epic_comment_reply_activity_payload),
            actor_id=user_id,
            project_id=project_id,
            issue_id=epic_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return epic_comment_reply

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def delete_epic_comment_reply(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
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

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # get the work item
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        # get the work item comment
        epic_comment = await get_epic_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic_id,
            comment_id=comment,
            parent_id=None,
        )
        epic_comment_id = str(epic_comment.id)

        # get the epic comment reply
        epic_comment_reply = await get_epic_comment(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic_id,
            comment_id=reply,
            parent_id=epic_comment_id,
        )
        epic_comment_reply_id = str(epic_comment_reply.id)

        # validate who can delete the comment reply
        _validate_who_can_delete_comment(user_id, epic_comment_reply)

        # comment reply activity payload
        epic_comment_reply_activity_payload = {
            "comment_id": epic_comment_reply_id,
        }

        # delete the work item comment
        await sync_to_async(epic_comment_reply.delete)()

        # update the issue comment activity
        issue_activity.delay(
            type="comment.activity.deleted",
            requested_data=json.dumps(epic_comment_reply_activity_payload),
            actor_id=user_id,
            issue_id=epic_id,
            project_id=project_id,
            current_instance=None,
            epoch=int(timezone.now().timestamp()),
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return True
