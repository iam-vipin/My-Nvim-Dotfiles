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
from typing import Optional

# Third-party imports
import strawberry

# Strawberry imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module imports
from plane.graphql.helpers import (
    get_project,
    get_workspace_async,
    is_work_item_page_feature_flagged_async,
    search_work_item_pages_async,
    work_item_page_async,
    work_item_pages_async,
    convert_work_item_page_to_work_item_page_type_async,
)
from plane.graphql.permissions.project import ProjectPermission
from plane.graphql.types.workitem import WorkItemPageType


@strawberry.type
class WorkItemPageQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def work_item_pages(self, info: Info, slug: str, project: str, work_item: str) -> list[WorkItemPageType]:
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

        # get work item pages
        work_item_pages = await work_item_pages_async(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=work_item,
        )

        pages = await convert_work_item_page_to_work_item_page_type_async(work_item_pages=work_item_pages)

        return pages

    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def work_item_page(self, info: Info, slug: str, project: str, work_item: str, page: str) -> WorkItemPageType:
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

        # get work item pages
        work_item_page = await work_item_page_async(
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=work_item,
            page_id=page,
        )

        work_item_page = await convert_work_item_page_to_work_item_page_type_async(work_item_pages=[work_item_page])
        if len(work_item_page) == 0:
            return None

        return work_item_page[0]


@strawberry.type
class WorkItemPageSearchQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectPermission()])])
    async def search_work_item_pages(
        self,
        info: Info,
        slug: str,
        project: str,
        work_item: str,
        search: Optional[str] = None,
        is_global: Optional[bool] = False,
    ) -> list[WorkItemPageType]:
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

        # get work item pages
        search_pages = await search_work_item_pages_async(
            user_id=user_id,
            workspace_id=workspace_id,
            project_id=project_id,
            work_item_id=work_item,
            search=search,
            is_global=is_global,
        )

        return search_pages
