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
from plane.ee.models import WorkItemPage
from plane.graphql.bgtasks.issue_activity_task import issue_activity
from plane.graphql.helpers import (
    convert_work_item_page_to_work_item_page_type_async,
    get_project,
    get_work_item,
    get_workspace_async,
    is_work_item_page_feature_flagged_async,
    validate_page_ids_async,
    work_item_page_page_ids_async,
    work_item_pages_async,
)
from plane.graphql.permissions.project import ProjectPermission
from plane.graphql.types.workitem import WorkItemPageType


@sync_to_async
def delete_work_item_pages(
    work_item_id: Union[str, strawberry.ID], page_ids: list[Union[str, strawberry.ID]]
) -> Optional[int]:
    try:
        deleted_count = WorkItemPage.objects.filter(issue_id=work_item_id, page_id__in=page_ids).delete()
        return deleted_count
    except Exception:
        message = "Failed to delete work item pages"
        error_extensions = {"code": "WORK_ITEM_PAGES_NOT_DELETED", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def create_work_item_pages(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[WorkItemPage]:
    try:
        new_work_item_pages = WorkItemPage.objects.bulk_create(
            [
                WorkItemPage(
                    workspace_id=workspace_id,
                    project_id=project_id,
                    issue_id=work_item_id,
                    page_id=page_id,
                    created_by_id=user_id,
                    updated_by_id=user_id,
                )
                for page_id in page_ids
            ],
            batch_size=1000,
            ignore_conflicts=True,
        )

        work_item_pages = list(new_work_item_pages)

        return work_item_pages
    except Exception:
        message = "Failed to create work item pages"
        error_extensions = {"code": "WORK_ITEM_PAGES_NOT_CREATED", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)


@strawberry.type
class WorkItemPageMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def add_work_item_page(
        self,
        info: Info,
        slug: str,
        project: str,
        work_item: str,
        page_ids: list[str],
    ) -> list[WorkItemPageType]:
        # get user details
        user = info.context.user
        user_id = str(user.id)

        # get workspace details
        workspace = await get_workspace_async(slug=slug)
        workspace_id = str(workspace.id)
        workspace_slug = workspace.slug

        # get project details
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # validate feature flag
        await is_work_item_page_feature_flagged_async(workspace_slug=workspace_slug, user_id=user_id)

        # work item details
        work_item_details = await get_work_item(
            workspace_slug=workspace_slug, project_id=project_id, work_item_id=work_item
        )
        work_item_id = str(work_item_details.id)

        # existing work item pages
        linked_work_item_pages = await work_item_pages_async(
            workspace_id=workspace_id, project_id=project_id, work_item_id=work_item
        )
        linked_work_item_page_page_ids = await work_item_page_page_ids_async(work_item_pages=linked_work_item_pages)
        linked_work_item_page_page_ids = set([str(page_id) for page_id in linked_work_item_page_page_ids])

        # validate page ids
        valid_page_ids = await validate_page_ids_async(
            workspace_id=workspace_id, project_id=project_id, page_ids=page_ids
        )
        valid_page_ids = set([str(page_id) for page_id in valid_page_ids])

        # handle the deletion of the work item page
        # INFO: We are commenting out the deletion of the work item pages as it is not needed.
        # delete_page_ids = linked_work_item_page_page_ids - valid_page_ids
        # delete_page_ids = list(delete_page_ids)

        # if len(delete_page_ids) > 0:
        #     await delete_work_item_pages(work_item_id=work_item_id, page_ids=delete_page_ids)

        # INFO: We are not tracking the activity for the deleted pages as it is not needed.
        # requested_data = {"pages_ids": list(valid_page_ids)}
        # current_instance = list(linked_work_item_page_page_ids)

        # handle the creation of the work item pages
        new_page_ids = valid_page_ids - linked_work_item_page_page_ids
        new_page_ids = list(new_page_ids)

        if len(new_page_ids) > 0:
            # create the new work item pages
            await create_work_item_pages(
                user_id=user_id,
                workspace_id=workspace_id,
                project_id=project_id,
                work_item_id=work_item_id,
                page_ids=new_page_ids,
            )

        # track the activity
        requested_data = {"pages_ids": list(linked_work_item_page_page_ids.union(set(new_page_ids)))}
        current_instance = list(linked_work_item_page_page_ids)
        issue_activity.delay(
            type="page.activity.created",
            requested_data=requested_data,
            actor_id=user_id,
            issue_id=work_item_id,
            project_id=project_id,
            current_instance=current_instance,
            epoch=int(timezone.now().timestamp()),
            subscriber=True,
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        # getting the new work item pages
        new_work_item_pages = await work_item_pages_async(
            workspace_id=workspace_id, project_id=project_id, work_item_id=work_item
        )

        # converting the new work item pages to the work item page type
        converted_new_work_item_pages = await convert_work_item_page_to_work_item_page_type_async(
            work_item_pages=new_work_item_pages
        )

        return converted_new_work_item_pages

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def delete_work_item_page(
        self, info: Info, slug: str, project: str, work_item: str, page_ids: list[str]
    ) -> bool:
        # get user details
        user = info.context.user
        user_id = str(user.id)

        # get workspace details
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug

        # get project details
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # validate feature flag
        await is_work_item_page_feature_flagged_async(workspace_slug=workspace_slug, user_id=user_id)

        # work item details
        work_item_details = await get_work_item(
            workspace_slug=workspace_slug, project_id=project_id, work_item_id=work_item
        )
        work_item_id = str(work_item_details.id)

        if len(page_ids) <= 0:
            return True

        await delete_work_item_pages(work_item_id=work_item_id, page_ids=page_ids)

        # track the activity
        for page_id in page_ids:
            issue_activity.delay(
                type="page.activity.deleted",
                requested_data=page_id,
                actor_id=user_id,
                issue_id=work_item_id,
                project_id=project_id,
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                subscriber=True,
                notification=True,
                origin=info.context.request.META.get("HTTP_ORIGIN"),
            )

        return True
