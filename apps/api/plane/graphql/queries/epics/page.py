# Python imports
from typing import Optional

# Third-party imports
import strawberry

# Strawberry imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module imports
from plane.graphql.helpers import (
    convert_epic_page_to_epic_page_type_async,
    epic_page_async,
    epic_pages_async,
    get_project,
    get_workspace_async,
    is_epic_feature_flagged,
    is_epic_page_feature_flagged_async,
    is_project_epics_enabled,
    search_epic_pages_async,
)
from plane.graphql.permissions.project import ProjectPermission
from plane.graphql.types.epics import EpicPageType


@strawberry.type
class EpicPageQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def epic_pages(self, info: Info, slug: str, project: str, epic: str) -> list[EpicPageType]:
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

        # get epic pages
        epic_pages = await epic_pages_async(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic,
        )

        pages = await convert_epic_page_to_epic_page_type_async(epic_pages=epic_pages)

        return pages

    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def epic_page(self, info: Info, slug: str, project: str, epic: str, page: str) -> EpicPageType:
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

        # get epic page
        epic_page = await epic_page_async(
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic,
            page_id=page,
        )

        epic_page = await convert_epic_page_to_epic_page_type_async(epic_pages=[epic_page])
        if len(epic_page) == 0:
            return None

        return epic_page[0]


@strawberry.type
class EpicPageSearchQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def search_epic_pages(
        self,
        info: Info,
        slug: str,
        project: str,
        epic: str,
        search: Optional[str] = None,
        is_global: Optional[bool] = False,
    ) -> list[EpicPageType]:
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

        # get pages
        search_pages = await search_epic_pages_async(
            user_id=user_id,
            workspace_id=workspace_id,
            project_id=project_id,
            epic_id=epic,
            search=search,
            is_global=is_global,
        )

        return search_pages
