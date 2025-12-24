"""
Helper functions for epic page operations
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
from plane.graphql.types.epics import EpicPageType
from plane.graphql.types.feature_flag import FeatureFlagsTypesEnum
from plane.graphql.utils.feature_flag import _validate_feature_flag


# ***************************************
# Feature Flag
# ***************************************
def is_epic_page_feature_flagged(
    workspace_slug: str, user_id: Union[str, strawberry.ID], raise_exception: bool = True
) -> bool:
    """
    Check if the epic page feature flag is enabled for the workspace and user

    Args:
        workspace_slug: The slug of the workspace
        user_id: The ID of the user
        raise_exception: Whether to raise an exception if the feature flag is not enabled

    Returns:
        bool: True if the epic page feature flag is enabled for the workspace and user, False otherwise
    """

    try:
        feature_key = FeatureFlagsTypesEnum.LINK_PAGES.value
        flag = _validate_feature_flag(workspace_slug=workspace_slug, feature_key=feature_key, user_id=user_id)
        if not flag:
            if not raise_exception:
                return False
            message = "Epic link pages feature flag is not enabled for the workspace"
            error_extensions = {"code": "EPIC_LINK_PAGES_FEATURE_FLAG_NOT_ENABLED", "statusCode": 400}
            raise GraphQLError(message, extensions=error_extensions)
        return flag
    except Exception as e:
        if not raise_exception:
            return False
        message = e.message if hasattr(e, "message") else "Error checking if epic link pages feature flag is enabled"
        error_extensions = (
            e.extensions if hasattr(e, "extensions") else {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        )
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def is_epic_page_feature_flagged_async(
    workspace_slug: str, user_id: Union[str, strawberry.ID], raise_exception: bool = True
) -> bool:
    """
    Check if the epic page feature flag is enabled for the workspace and user asynchronously
    """

    return is_epic_page_feature_flagged(workspace_slug=workspace_slug, user_id=user_id, raise_exception=raise_exception)


# ***************************************
# Helper Functions
# ***************************************
def validate_epic_page_ids(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[Union[str, strawberry.ID]]:
    """
    Validate the epic page ids for the given workspace, project and page ids

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        page_ids: The IDs of the pages

    Returns:
        list[Union[str, strawberry.ID]]: The valid epic page ids
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
def validate_epic_page_ids_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    page_ids: list[Union[str, strawberry.ID]],
) -> list[Union[str, strawberry.ID]]:
    """
    Validate the epic page ids for the given workspace, project and page ids asynchronously
    """

    return validate_epic_page_ids(workspace_id=workspace_id, project_id=project_id, page_ids=page_ids)


def convert_epic_page_to_epic_page_type(
    epic_pages: list[WorkItemPage],
) -> list[EpicPageType]:
    """
    Convert the epic page to the epic page type

    Args:
        epic_pages: The pages to convert

    Returns:
        list[EpicPageType]: The epic page types
    """

    pages: list[EpicPageType] = []

    for work_item_page in epic_pages:
        page = EpicPageType(
            id=work_item_page.page.id,
            name=work_item_page.page.name,
            logo_props=work_item_page.page.logo_props,
            is_global=work_item_page.page.is_global,
            access=work_item_page.page.access,
        )
        pages.append(page)

    return pages


@sync_to_async
def convert_epic_page_to_epic_page_type_async(
    epic_pages: list[WorkItemPage],
) -> list[EpicPageType]:
    """
    Convert the epic page to the epic page type asynchronously
    """

    return convert_epic_page_to_epic_page_type(epic_pages=epic_pages)


def epic_page_ids(epic_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the page ids for the given pages

    Args:
        epic_pages: The pages to convert

    Returns:
        list[str]: The page ids
    """

    work_item_page_ids = []

    for work_item_page in epic_pages:
        if work_item_page is not None:
            work_item_page_ids.append(str(work_item_page.id))

    return work_item_page_ids


@sync_to_async
def epic_page_ids_async(epic_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the epic page ids for the given pages asynchronously
    """

    return epic_page_ids(epic_pages=epic_pages)


def epic_page_page_ids(epic_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the epic page page ids for the given epic pages

    Args:
        epic_pages: The epic pages to convert

    Returns:
        list[str]: The epic page page ids
    """

    page_ids = []

    for work_item_page in epic_pages:
        if work_item_page.page is not None:
            page_ids.append(str(work_item_page.page.id))

    return page_ids


@sync_to_async
def epic_page_page_ids_async(epic_pages: list[WorkItemPage]) -> list[str]:
    """
    Get the epic page page ids for the given epic pages asynchronously
    """

    return epic_page_page_ids(epic_pages=epic_pages)


# ***************************************
# Base Query
# ***************************************
def _epic_page_base_query(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    page_id: Optional[Union[str, strawberry.ID]] = None,
    filters: Optional[dict] = None,
) -> QuerySet:
    """
    Construct the base query for the epic page

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        epic_id: The ID of the epic
        page_id: The ID of the page
        filters: The filters to apply to the query

    Returns:
        QuerySet: The base query for the epic page
    """

    base_query = (
        WorkItemPage.objects.filter(
            workspace_id=workspace_id, project_id=project_id, issue_id=epic_id, deleted_at__isnull=True
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
# Epic Pages count
# ***************************************
def get_epic_pages_count(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
) -> int:
    """
    Get the epic pages count for the given workspace, project and epic

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        epic_id: The ID of the epic

    Returns:
        int: The epic pages count for the given workspace, project and epic
    """

    base_query = _epic_page_base_query(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)

    return base_query.count()


@sync_to_async
def get_epic_pages_count_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
) -> int:
    """
    Get the epic pages count for the given workspace, project and epic asynchronously
    """

    return get_epic_pages_count(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)


# ***************************************
# Epic Pages
# ***************************************
def epic_pages(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
) -> list[WorkItemPage]:
    """
    Get the epic pages for the given workspace, project and epic

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        epic_id: The ID of the epic

    Returns:
        list[WorkItemPage]: The epic pages for the given workspace, project and epic
    """

    base_query = _epic_page_base_query(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)
    epic_pages = base_query.all()

    return list(epic_pages)


@sync_to_async
def epic_pages_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
) -> list[WorkItemPage]:
    """
    Get the epic pages for the given workspace, project and epic asynchronously
    """

    return epic_pages(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)


# ***************************************
# Epic Page
# ***************************************
def epic_page(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    page_id: Union[str, strawberry.ID],
) -> Optional[WorkItemPage]:
    """
    Get the epic page for the given workspace, project, epic and page

    Args:
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        epic_id: The ID of the epic
        page_id: The ID of the page

    Returns:
        Optional[EpicPageType]: The epic page for the given workspace, project, epic and page
    """

    try:
        base_query = _epic_page_base_query(
            workspace_id=workspace_id, project_id=project_id, epic_id=epic_id, page_id=page_id
        )
        epic_page = base_query.first()

        if epic_page is None:
            message = "Epic page not found"
            error_extensions = {"code": "EPIC_PAGE_NOT_FOUND", "statusCode": 404}
            raise GraphQLError(message, extensions=error_extensions)

        return epic_page
    except Exception as e:
        message = e.message if hasattr(e, "message") else "Error getting epic page"
        error_extensions = (
            {"code": "SOMETHING_WENT_WRONG", "statusCode": 400} if not hasattr(e, "extensions") else e.extensions
        )
        raise GraphQLError(message, extensions=error_extensions)


@sync_to_async
def epic_page_async(
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    page_id: Union[str, strawberry.ID],
) -> Optional[EpicPageType]:
    """
    Get the epic page for the given workspace, project, epic and page asynchronously
    """

    return epic_page(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id, page_id=page_id)


# ***************************************
# Search Epic Pages
# ***************************************
def search_epic_pages(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    search: Optional[str] = None,
    is_global: Optional[bool] = False,
    exclude_epic_pages: Optional[bool] = True,
) -> list[Page]:
    """
    Search the epic pages for the given user, workspace, project and epic

    Args:
        user_id: The ID of the user
        workspace_id: The ID of the workspace
        project_id: The ID of the project
        search: The search query
        is_global: Whether to search for global pages
        epic_id: The ID of the epic

    Returns:
        list[Page]: The pages for the given user, workspace, project and epic
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

    if epic_id is not None and exclude_epic_pages is True:
        epic_page_ids = (
            _epic_page_base_query(workspace_id=workspace_id, project_id=project_id, epic_id=epic_id)
            .values_list("page_id", flat=True)
            .distinct()
        )
        base_query = base_query.exclude(id__in=epic_page_ids)

    pages = list(base_query.only("id", "name", "logo_props", "is_global", "access"))

    return pages


@sync_to_async
def search_epic_pages_async(
    user_id: Union[str, strawberry.ID],
    workspace_id: Union[str, strawberry.ID],
    project_id: Union[str, strawberry.ID],
    epic_id: Union[str, strawberry.ID],
    search: Optional[str] = None,
    is_global: Optional[bool] = False,
    exclude_epic_pages: Optional[bool] = True,
) -> list[Page]:
    """
    Search the epic pages for the given user, workspace, project and epic asynchronously
    """

    return search_epic_pages(
        user_id=user_id,
        workspace_id=workspace_id,
        project_id=project_id,
        epic_id=epic_id,
        search=search,
        is_global=is_global,
        exclude_epic_pages=exclude_epic_pages,
    )
