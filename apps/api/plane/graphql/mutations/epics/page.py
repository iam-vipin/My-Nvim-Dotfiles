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
    convert_epic_page_to_epic_page_type_async,
    epic_page_page_ids_async,
    epic_pages_async,
    get_epic,
    get_project,
    get_workspace_async,
    is_epic_feature_flagged,
    is_epic_page_feature_flagged_async,
    is_project_epics_enabled,
    validate_epic_page_ids_async,
)
from plane.graphql.permissions.project import ProjectPermission
from plane.graphql.types.epics import EpicPageType


@sync_to_async
def delete_epic_pages(epic_id: Union[str, strawberry.ID], page_ids: list[Union[str, strawberry.ID]]) -> Optional[int]:
    try:
        deleted_count = WorkItemPage.objects.filter(issue_id=epic_id, page_id__in=page_ids).delete()
        return deleted_count
    except Exception:
        message = "Failed to delete epic pages"
        error_extensions = {"code": "EPIC_PAGES_NOT_DELETED", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def create_epic_pages(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[WorkItemPage]:
    try:
        new_epic_pages = WorkItemPage.objects.bulk_create(
            [
                WorkItemPage(
                    workspace_id=workspace_id,
                    project_id=project_id,
                    issue_id=epic_id,
                    page_id=page_id,
                    created_by_id=user_id,
                    updated_by_id=user_id,
                )
                for page_id in page_ids
            ],
            batch_size=1000,
            ignore_conflicts=True,
        )

        epic_pages = list(new_epic_pages)

        return epic_pages
    except Exception:
        message = "Failed to create epic pages"
        error_extensions = {"code": "EPIC_PAGES_NOT_CREATED", "statusCode": 400}
        raise GraphQLError(message, extensions=error_extensions)


@strawberry.type
class EpicPageMutation:
    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def add_epic_page(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
        page_ids: list[str],
    ) -> list[EpicPageType]:
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

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # validate feature flag
        await is_epic_page_feature_flagged_async(workspace_slug=workspace_slug, user_id=user_id)

        # epic details
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        # existing epic pages
        linked_epic_pages = await epic_pages_async(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)
        linked_epic_page_page_ids = await epic_page_page_ids_async(epic_pages=linked_epic_pages)
        linked_epic_page_page_ids = set([str(page_id) for page_id in linked_epic_page_page_ids])

        # validate page ids
        valid_page_ids = await validate_epic_page_ids_async(
            workspace_id=workspace_id, project_id=project_id, page_ids=page_ids
        )
        valid_page_ids = set([str(page_id) for page_id in valid_page_ids])

        # handle the deletion of the epic page
        # INFO: We are commenting out the deletion of the epic pages as it is not needed.
        # delete_page_ids = linked_epic_page_page_ids - valid_page_ids
        # delete_page_ids = list(delete_page_ids)

        # if len(delete_page_ids) > 0:
        #     await delete_epic_pages(epic_id=epic_id, page_ids=delete_page_ids)

        # handle the creation of the epic pages
        new_page_ids = valid_page_ids - linked_epic_page_page_ids
        new_page_ids = list(new_page_ids)

        if len(new_page_ids) > 0:
            # create the new epic pages
            await create_epic_pages(
                user_id=user_id,
                workspace_id=workspace_id,
                project_id=project_id,
                epic_id=epic_id,
                page_ids=new_page_ids,
            )

        # track the activity
        requested_data = {"pages_ids": list(linked_epic_page_page_ids.union(set(new_page_ids)))}
        current_instance = list(linked_epic_page_page_ids)
        issue_activity.delay(
            type="page.activity.created",
            requested_data=requested_data,
            actor_id=user_id,
            issue_id=epic_id,
            project_id=project_id,
            current_instance=current_instance,
            epoch=int(timezone.now().timestamp()),
            subscriber=True,
            notification=True,
            origin=info.context.request.META.get("HTTP_ORIGIN"),
        )

        # getting the new epic pages
        new_epic_pages = await epic_pages_async(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)

        # converting the new epic pages to the epic page type
        converted_new_epic_pages = await convert_epic_page_to_epic_page_type_async(epic_pages=new_epic_pages)

        return converted_new_epic_pages

    @strawberry.mutation(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def delete_epic_page(self, info: Info, slug: str, project: str, epic: str, page_ids: list[str]) -> bool:
        # get user details
        user = info.context.user
        user_id = str(user.id)

        # get workspace details
        workspace = await get_workspace_async(slug=slug)
        workspace_slug = workspace.slug

        # get project details
        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        # Check if the epic feature flag is enabled for the workspace
        await is_epic_feature_flagged(user_id=user_id, workspace_slug=workspace_slug)

        # check if the epic is enabled for the project
        await is_project_epics_enabled(workspace_slug=workspace_slug, project_id=project_id)

        # validate feature flag
        await is_epic_page_feature_flagged_async(workspace_slug=workspace_slug, user_id=user_id)

        # epic details
        epic_details = await get_epic(workspace_slug=workspace_slug, project_id=project_id, epic_id=epic)
        epic_id = str(epic_details.id)

        if len(page_ids) <= 0:
            return True

        await delete_epic_pages(epic_id=epic_id, page_ids=page_ids)

        # track the activity
        for page_id in page_ids:
            issue_activity.delay(
                type="page.activity.deleted",
                requested_data=page_id,
                actor_id=user_id,
                issue_id=epic_id,
                project_id=project_id,
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                subscriber=True,
                notification=True,
                origin=info.context.request.META.get("HTTP_ORIGIN"),
            )

        return True
