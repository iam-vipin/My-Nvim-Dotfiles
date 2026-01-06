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

# Python imports
import json

# Third-party imports
from typing import Optional

import strawberry

# Django imports
from asgiref.sync import sync_to_async
from django.utils import timezone
from strawberry.exceptions import GraphQLError

# Strawberry imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module imports
from plane.bgtasks.issue_description_version_task import issue_description_version_task
from plane.db.models import Issue, IssueAssignee, IssueLabel
from plane.graphql.bgtasks.issue_activity_task import issue_activity
from plane.graphql.helpers import (
    get_project,
    get_project_default_state,
    get_project_epic_type,
    get_project_member,
    get_work_item_ids_async,
    get_workspace_async,
    is_epic_feature_flagged,
    is_project_epics_enabled,
    is_project_workflow_enabled,
    is_workflow_create_allowed,
    is_workflow_feature_flagged,
    is_workflow_update_allowed,
    update_work_item_parent_id_async,
)
from plane.graphql.helpers.teamspace import project_member_filter_via_teamspaces_async
from plane.graphql.permissions.project import ProjectPermission, Roles
from plane.graphql.types.epics.base import (
    EpicCreateInputType,
    EpicType,
    EpicUpdateInputType,
)
from plane.graphql.utils.issue_activity import convert_issue_properties_to_activity_dict


@strawberry.type
class EpicMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission([Roles.ADMIN, Roles.MEMBER])])])
    async def create_epic(self, info: Info, slug: str, project: str, epic_input: EpicCreateInputType) -> EpicType:
        user = info.context.user
        user_id = str(user.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=slug, project_id=project)

        # get the workspace
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug
        workspace_id = str(workspace.id)

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        epic_state_id = epic_input.state or None
        epic_labels = epic_input.labels or None
        epic_assignees = epic_input.assignees or None

        # check if the workflow is enabled for the project and the state is not passed
        if epic_state_id is None:
            state = await get_project_default_state(workspace_slug=workspace_slug, project_id=project_id)
            epic_state_id = str(state.id)
        else:
            workflow_feature_flagged = await is_workflow_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)
            if workflow_feature_flagged:
                project_workflow_enabled = await is_project_workflow_enabled(
                    workspace_slug=workspace_slug, project_id=project_id
                )
                if project_workflow_enabled:
                    await is_workflow_create_allowed(
                        workspace_slug=workspace_slug,
                        project_id=project_id,
                        user_id=user_id,
                        state_id=epic_state_id,
                    )

        # get the epic type
        epic_type = await get_project_epic_type(workspace_slug=slug, project_id=project)
        epic_type_id = str(epic_type.id)

        epic_payload = {
            k: v
            for k, v in {
                "name": epic_input.name,
                "description_html": epic_input.description_html,
                "priority": epic_input.priority,
                "start_date": epic_input.start_date,
                "target_date": epic_input.target_date,
                "state_id": epic_state_id or epic_input.state,
            }.items()
            if v is not None
        }

        # create the epic
        epic = await sync_to_async(Issue.objects.create)(
            workspace_id=workspace_id,
            project_id=project_id,
            type_id=epic_type_id,
            created_by_id=user_id,
            updated_by_id=user_id,
            **epic_payload,
        )
        epic_id = str(epic.id)

        # updating the assignees
        if epic_assignees is not None and len(epic_assignees) > 0:
            await sync_to_async(IssueAssignee.objects.bulk_create)(
                [
                    IssueAssignee(
                        workspace_id=workspace_id,
                        project_id=project_id,
                        issue_id=epic_id,
                        assignee_id=assignee,
                        created_by_id=user_id,
                        updated_by_id=user_id,
                    )
                    for assignee in epic_assignees
                ],
                batch_size=10,
            )

        # updating the labels
        if epic_labels is not None and len(epic_labels) > 0:
            await sync_to_async(IssueLabel.objects.bulk_create)(
                [
                    IssueLabel(
                        workspace_id=workspace_id,
                        project_id=project_id,
                        issue_id=epic_id,
                        label_id=label,
                        created_by_id=user_id,
                        updated_by_id=user_id,
                    )
                    for label in epic_labels
                ],
                batch_size=10,
            )

        # activity tacking data
        activity_payload = {}
        for key, value in epic_payload.items():
            if key in ("start_date", "target_date") and value is not None:
                activity_payload[key] = value.strftime("%Y-%m-%d")
            else:
                activity_payload[key] = value
        if epic_labels is not None and len(epic_labels) > 0:
            activity_payload["label_ids"] = epic_labels
        if epic_assignees is not None and len(epic_assignees) > 0:
            activity_payload["assignee_ids"] = epic_assignees

        # Track the epic activity
        await sync_to_async(issue_activity.delay)(
            type="epic.activity.created",
            origin=info.context.request.META.get("HTTP_ORIGIN"),
            epoch=int(timezone.now().timestamp()),
            notification=True,
            project_id=str(project),
            issue_id=str(epic_id),
            actor_id=str(user.id),
            current_instance=None,
            requested_data=json.dumps(activity_payload),
        )

        # issue description activity
        issue_description_version_task.delay(
            updated_issue=json.dumps(epic_payload),
            issue_id=epic_id,
            user_id=user_id,
            is_creating=True,
        )

        return epic

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission([Roles.ADMIN, Roles.MEMBER])])])
    async def update_epic(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
        epic_input: Optional[EpicUpdateInputType] = None,
    ) -> EpicType:
        user = info.context.user
        user_id = str(user.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=slug, project_id=project)

        # get the workspace
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug
        workspace_id = str(workspace.id)

        # get the project
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        provided_fields = {
            k: v
            for k, v in info.variable_values.get("epicInput", {}).items()
            if k in info.variable_values.get("epicInput", {})
        }

        # get the epic
        epic = await sync_to_async(Issue.objects.get)(id=epic)
        epic_id = str(epic.id)

        # get the current epic activity
        current_epic_activity = await convert_issue_properties_to_activity_dict(epic)

        # activity tacking data
        current_activity_payload = {}
        activity_payload = {}

        if "name" in provided_fields and epic_input.name is not None:
            epic.name = provided_fields["name"]
            activity_payload["name"] = provided_fields["name"]
            current_activity_payload["name"] = current_epic_activity["name"]

        if "descriptionHtml" in provided_fields:
            epic.description_html = provided_fields["descriptionHtml"]
            activity_payload["description_html"] = provided_fields["descriptionHtml"]
            current_activity_payload["description_html"] = current_epic_activity["description_html"]

        if "priority" in provided_fields:
            epic.priority = provided_fields["priority"]
            activity_payload["priority"] = provided_fields["priority"]
            current_activity_payload["priority"] = current_epic_activity["priority"]

        if "startDate" in provided_fields:
            if epic_input.start_date is not None:
                epic.start_date = epic_input.start_date
                activity_payload["start_date"] = epic_input.start_date.strftime("%Y-%m-%d")
                current_activity_payload["start_date"] = current_epic_activity["start_date"]
            else:
                epic.start_date = None
                activity_payload["start_date"] = None
                current_activity_payload["start_date"] = current_epic_activity["start_date"]

        if "targetDate" in provided_fields:
            if epic_input.target_date is not None:
                epic.target_date = epic_input.target_date
                activity_payload["target_date"] = epic_input.target_date.strftime("%Y-%m-%d")
                current_activity_payload["target_date"] = current_epic_activity["target_date"]
            else:
                epic.target_date = None
                activity_payload["target_date"] = None
                current_activity_payload["target_date"] = current_epic_activity["target_date"]

        if "state" in provided_fields:
            epic.state_id = provided_fields["state"]
            activity_payload["state_id"] = provided_fields["state"]
            current_activity_payload["state_id"] = current_epic_activity["state_id"]

        if "parent" in provided_fields:
            epic.parent_id = provided_fields["parent"]
            activity_payload["parent_id"] = provided_fields["parent"]
            current_activity_payload["parent_id"] = current_epic_activity["parent_id"]

        # validate the workflow if the project has workflows enabled
        state_id = provided_fields["state"] if "state" in provided_fields else None
        if state_id:
            workflow_enabled = await is_workflow_feature_flagged(workspace_slug=workspace_slug, user_id=user_id)
            if workflow_enabled:
                await is_workflow_update_allowed(
                    workspace_slug=workspace_slug,
                    project_id=project_id,
                    user_id=user_id,
                    current_state_id=epic.state_id,
                    new_state_id=state_id,
                )

        # updating the epic
        epic.updated_by_id = user_id
        await sync_to_async(epic.save)()

        # creating or updating the assignees
        assignees = provided_fields["assignees"] if "assignees" in provided_fields else None
        if assignees is not None:
            activity_payload["assignee_ids"] = assignees
            current_activity_payload["assignee_ids"] = current_epic_activity["assignee_ids"]

            await sync_to_async(IssueAssignee.objects.filter(issue=epic).delete)()
            if len(assignees) > 0:
                await sync_to_async(IssueAssignee.objects.bulk_create)(
                    [
                        IssueAssignee(
                            workspace_id=workspace_id,
                            project_id=project_id,
                            issue_id=epic_id,
                            assignee_id=assignee,
                            created_by_id=user_id,
                            updated_by_id=user_id,
                        )
                        for assignee in assignees
                    ],
                    batch_size=10,
                )

        # creating or updating the labels
        labels = provided_fields["labels"] if "labels" in provided_fields else None
        if labels is not None:
            activity_payload["label_ids"] = labels
            current_activity_payload["label_ids"] = current_epic_activity["label_ids"]

            await sync_to_async(IssueLabel.objects.filter(issue=epic).delete)()
            if len(labels) > 0:
                await sync_to_async(IssueLabel.objects.bulk_create)(
                    [
                        IssueLabel(
                            workspace_id=workspace_id,
                            project_id=project_id,
                            issue_id=epic_id,
                            label_id=label,
                            created_by_id=user_id,
                            updated_by_id=user_id,
                        )
                        for label in labels
                    ],
                    batch_size=10,
                )

        # Track the epic
        issue_activity.delay(
            type="issue.activity.updated",
            origin=info.context.request.META.get("HTTP_ORIGIN"),
            epoch=int(timezone.now().timestamp()),
            notification=True,
            project_id=str(project),
            issue_id=str(epic.id),
            actor_id=str(info.context.user.id),
            current_instance=json.dumps(current_epic_activity),
            requested_data=json.dumps(activity_payload),
        )

        # issue description activity
        issue_description_version_task.delay(
            updated_issue=json.dumps(activity_payload),
            issue_id=epic_id,
            user_id=user_id,
        )

        return epic

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def delete_epic(self, info: Info, slug: str, project: str, epic: str) -> bool:
        user = info.context.user
        user_id = str(user.id)

        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug

        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # get the epic
        epic = await sync_to_async(Issue.objects.get)(id=epic)
        epic_id = str(epic.id)
        epic_created_by_id = str(epic.created_by_id)

        # project member check
        current_user_role = None
        project_member = await get_project_member(
            workspace_slug=workspace_slug,
            project_id=project_id,
            user_id=user_id,
            raise_exception=False,
        )
        if not project_member:
            project_teamspace_filter = await project_member_filter_via_teamspaces_async(
                user_id=user_id,
                workspace_slug=workspace_slug,
            )
            teamspace_project_ids = project_teamspace_filter.teamspace_project_ids
            if project_id not in teamspace_project_ids:
                message = "You are not allowed to access this project"
                error_extensions = {"code": "FORBIDDEN", "statusCode": 403}
                raise GraphQLError(message, extensions=error_extensions)
            current_user_role = Roles.MEMBER.value
        else:
            current_user_role = project_member.role

        if current_user_role in [Roles.MEMBER.value, Roles.GUEST.value]:
            if epic_created_by_id != user_id:
                message = "You are not allowed to delete this epic"
                error_extensions = {"code": "FORBIDDEN", "statusCode": 403}
                raise GraphQLError(message, extensions=error_extensions)

        # activity tracking data
        current_epic_activity = await convert_issue_properties_to_activity_dict(epic)

        # get all the issues that have this epic as a parent
        work_item_ids = await get_work_item_ids_async(filters={"parent_id": epic_id})
        if len(work_item_ids) > 0:
            # update the parent id of the issues
            await update_work_item_parent_id_async(
                work_item_ids=work_item_ids,
                parent_id=None,
            )
            # update the activity that we have removed the parent from the issues
            for work_item_id in work_item_ids:
                issue_activity.delay(
                    type="issue.activity.updated",
                    requested_data=json.dumps({"parent_id": None}),
                    actor_id=user_id,
                    issue_id=work_item_id,
                    project_id=project,
                    current_instance=json.dumps({"parent_id": epic_id}),
                    epoch=int(timezone.now().timestamp()),
                )

        # delete the epic
        await sync_to_async(epic.delete)()

        # Track the issue
        issue_activity.delay(
            type="issue.activity.deleted",
            requested_data=json.dumps({"issue_id": str(epic)}),
            actor_id=user_id,
            issue_id=epic_id,
            notification=True,
            project_id=str(project),
            current_instance=current_epic_activity,
            epoch=int(timezone.now().timestamp()),
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        return True
