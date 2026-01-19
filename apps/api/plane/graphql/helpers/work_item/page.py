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

"""
Helper functions for work item page operations
"""

# Python Imports
from typing import Optional, Union

# Third-Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Django Imports
from django.db.models import Q, QuerySet

# strawberry imports
from strawberry.exceptions import GraphQLError

# Local Imports
from plane.db.models import Page
from plane.ee.models import WorkItemPage
from plane.graphql.types.feature_flag import FeatureFlagsTypesEnum
from plane.graphql.types.workitem import WorkItemPageType
from plane.graphql.utils.feature_flag import _validate_feature_flag


# ***************************************
# Feature Flag
# ***************************************
def is_work_item_page_feature_flagged(
    workspace_slug: str, user_id: Union[str, strawberry.ID], raise_exception: bool = True
) -> bool:
    """
    Check if the work item page feature flag is enabled for the workspace and user

    Args:
        workspace_slug: The slug of the workspace
        user_id: The ID of the user
        raise_exception: Whether to raise an exception if the feature flag is not enabled

    Returns:
        bool: True if the work item page feature flag is enabled for the workspace and user, False otherwise
    """

    try:
        feature_key = FeatureFlagsTypesEnum.LINK_PAGES.value
        flag = _validate_feature_flag(workspace_slug=workspace_slug, feature_key=feature_key, user_id=user_id)
        if not flag:
            if not raise_exception:
                return False
            message = "Link pages feature flag is not enabled for the workspace"
            error_extensions = {"code": "LINK_PAGES_FEATURE_FLAG_NOT_ENABLED", "statusCode": 400}
            raise GraphQLError(message, extensions=error_extensions)
        return flag
    except Exception as e:
        if not raise_exception:
            return False
        message = e.message if hasattr(e, "message") else "Error checking if link pages feature flag is enabled"
        error_extensions = (
            e.extensions if hasattr(e, "extensions") else {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        )
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def is_work_item_page_feature_flagged_async(
    workspace_slug: str, user_id: Union[str, strawberry.ID], raise_exception: bool = True
) -> bool:
    """
    Check if the work item page feature flag is enabled for the workspace and user asynchronously
    """

    return is_work_item_page_feature_flagged(
        workspace_slug=workspace_slug, user_id=user_id, raise_exception=raise_exception
    )


# ***************************************
# Helper Functions
# ***************************************
def validate_page_ids(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[Union[str, strawberry.ID]]:
    """
    Validate the page ids for the given workspace, project and page ids

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        page_ids: The IDs of the pages

    Returns:
        list[Union[str, strawberry.ID]]: The valid page ids
    """

    valid_page_ids = Page.objects.filter(
        Q(project_pages__project_id=project_id, project_pages__deleted_at__isnull=True) | Q(is_global=True),
        workspace_id=workspace_id,
        id__in=page_ids,
        archived_at__isnull=True,
        deleted_at__isnull=True,
        moved_to_page__isnull=True,
    ).values_list("id", flat=True)

    return list(valid_page_ids)


@sync_to_async
def validate_page_ids_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[Union[str, strawberry.ID]]:
    """
    Validate the page ids for the given workspace, project and page ids asynchronously
    """

    return validate_page_ids(workspace_id=workspace_id, project_id=project_id, page_ids=page_ids)


def convert_work_item_page_to_work_item_page_type(work_item_pages: list[WorkItemPage]) -> list[WorkItemPageType]:
    """
    Convert the work item page to the work item page type

    Args:
        work_item_pages: The work item pages to convert

    Returns:
        list[WorkItemPageType]: The work item page types
    """

    pages: list[WorkItemPageType] = []

    for work_item_page in work_item_pages:
        page = WorkItemPageType(
            id=work_item_page.page.id,
            name=work_item_page.page.name,
            logo_props=work_item_page.page.logo_props,
            is_global=work_item_page.page.is_global,
            access=work_item_page.page.access,
        )
        pages.append(page)

    return pages


@sync_to_async
def convert_work_item_page_to_work_item_page_type_async(work_item_pages: list[WorkItemPage]) -> list[WorkItemPageType]:
    """
    Convert the work item page to the work item page type asynchronously
    """

    return convert_work_item_page_to_work_item_page_type(work_item_pages=work_item_pages)


def work_item_page_ids(work_item_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the work item page ids for the given work item pages

    Args:
        work_item_pages: The work item pages to convert

    Returns:
        list[str]: The work item page ids
    """

    work_item_page_ids = []

    for work_item_page in work_item_pages:
        if work_item_page is not None:
            work_item_page_ids.append(str(work_item_page.id))

    return work_item_page_ids


@sync_to_async
def work_item_page_ids_async(work_item_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the work item page ids for the given work item pages asynchronously
    """

    return work_item_page_ids(work_item_pages=work_item_pages)


def work_item_page_page_ids(work_item_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the work item page page ids for the given work item pages

    Args:
        work_item_pages: The work item pages to convert

    Returns:
        list[str]: The work item page page ids
    """

    page_ids = []

    for work_item_page in work_item_pages:
        if work_item_page.page is not None:
            page_ids.append(str(work_item_page.page.id))

    return page_ids


@sync_to_async
def work_item_page_page_ids_async(work_item_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the work item page page ids for the given work item pages asynchronously
    """

    return work_item_page_page_ids(work_item_pages=work_item_pages)


# ***************************************
# Base Query
# ***************************************
def _work_item_page_base_query(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    page_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> QuerySet:
    """
    Construct the base query for the work item page

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        work_item_id: The ID of the work item
        page_id: The ID of the page
        filters: The filters to apply to the query

    Returns:
        QuerySet: The base query for the work item page
    """

    base_query = (
        WorkItemPage.objects.filter(
            workspace_id=workspace_id, project_id=project_id, issue_id=work_item_id, deleted_at__isnull=True
        )
        .select_related("page")
        .only("id", "page")
    )

    if page_id is not None:
        base_query = base_query.filter(page_id=page_id)

    if filters is not None:
        base_query = base_query.filter(**filters)

    return base_query


# ***************************************
# Work Item Pages count
# ***************************************
def get_work_item_pages_count(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
) -> int:
    """
    Get the work item pages count for the given workspace, project and work item

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        work_item_id: The ID of the work item

    Returns:
        int: The work item pages count for the given workspace, project and work item
    """

    base_query = _work_item_page_base_query(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id)

    return base_query.count()


@sync_to_async
def get_work_item_pages_count_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
) -> int:
    """
    Get the work item pages count for the given workspace, project and work item asynchronously
    """

    return get_work_item_pages_count(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id)


# ***************************************
# Work Item Pages
# ***************************************
def work_item_pages(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
) -> list[WorkItemPage]:
    """
    Get the work item pages for the given workspace, project and work item

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        work_item_id: The ID of the work item

    Returns:
        list[WorkItemPage]: The work item pages for the given workspace, project and work item
    """

    base_query = _work_item_page_base_query(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id)
    work_item_pages = base_query.all()

    return list(work_item_pages)


@sync_to_async
def work_item_pages_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
) -> list[WorkItemPage]:
    """
    Get the work item pages for the given workspace, project and work item asynchronously
    """

    return work_item_pages(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id)


# ***************************************
# Work Item Page
# ***************************************
def work_item_page(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    page_id: Union[str, strawberry.ID],
) -> Optional[WorkItemPage]:
    """
    Get the work item page for the given workspace, project, work item and page

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        work_item_id: The ID of the work item
        page_id: The ID of the page

    Returns:
        Optional[WorkItemPageType]: The work item page for the given workspace, project, work item and page
    """

    try:
        base_query = _work_item_page_base_query(
            workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id, page_id=page_id
        )
        work_item_page = base_query.first()

        if work_item_page is None:
            message = "Work item page not found"
            error_extensions = {"code": "WORK_ITEM_PAGE_NOT_FOUND", "statusCode": 404}
            raise GraphQLError(message, extensions=error_extensions)

        return work_item_page
    except Exception as e:
        message = e.message if hasattr(e, "message") else "Error getting work item page"
        error_extensions = (
            {"code": "SOMETHING_WENT_WRONG", "statusCode": 400} if not hasattr(e, "extensions") else e.extensions
        )
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def work_item_page_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    page_id: Union[str, strawberry.ID],
) -> Optional[WorkItemPageType]:
    """
    Get the work item page for the given workspace, project, work item and page asynchronously
    """

    return work_item_page(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id, page_id=page_id)


# ***************************************
# Search Work Item Pages
# ***************************************
def search_work_item_pages(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    search: Optional[str] = None,
    is_global: Optional[bool] = False,
    exclude_work_item_pages: Optional[bool] = True,
) -> list[Page]:
    """
    Search the work item pages for the given user, workspace, project and work item

    Args:
        user_id: The ID of the user
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        search: The search query
        is_global: Whether to search for global pages
        work_item_id: The ID of the work item

    Returns:
        list[Page]: The pages for the given user, workspace, project and work item
    """

    base_query = (
        Page.objects.filter(workspace_id=workspace_id, archived_at__isnull=True, deleted_at__isnull=True)
        .filter((Q(owned_by_id=user_id) & Q(access=1)) | (Q(access=0)))
        .distinct()
    )

    if search is not None:
        base_query = base_query.filter(name__icontains=search)

    project_page_filter = Q(project_pages__project_id=project_id, project_pages__deleted_at__isnull=True)
    if is_global is True:
        base_query = base_query.filter(Q(is_global=is_global) | project_page_filter)
    else:
        base_query = base_query.filter(project_page_filter)

    if work_item_id is not None and exclude_work_item_pages is True:
        work_item_page_ids = (
            _work_item_page_base_query(workspace_id=workspace_id, project_id=project_id, work_item_id=work_item_id)
            .values_list("page_id", flat=True)
            .distinct()
        )
        base_query = base_query.exclude(id__in=work_item_page_ids)

    pages = list(base_query.only("id", "name", "logo_props", "is_global", "access"))

    return pages


@sync_to_async
def search_work_item_pages_async(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    work_item_id: Union[str, strawberry.ID],
    search: Optional[str] = None,
    is_global: Optional[bool] = False,
    exclude_work_item_pages: Optional[bool] = True,
) -> list[Page]:
    """
    Search the work item pages for the given user, workspace, project and work item asynchronously
    """

    return search_work_item_pages(
        user_id=user_id,
        workspace_id=workspace_id,
        project_id=project_id,
        work_item_id=work_item_id,
        search=search,
        is_global=is_global,
        exclude_work_item_pages=exclude_work_item_pages,
    )
