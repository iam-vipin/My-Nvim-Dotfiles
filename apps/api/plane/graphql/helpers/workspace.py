"""
Workspace Helper Utilities for GraphQL Operations.

This module provides utility functions for fetching workspace instances
in both synchronous and asynchronous contexts. It handles workspace lookups
by slug or ID and provides consistent error handling with GraphQL-compliant
error responses.

Key Features:
    - Synchronous and asynchronous workspace retrieval
    - Flexible lookup by ID (UUID) or slug
    - Support for additional custom filters
    - Consistent GraphQL error handling with proper error codes
    - Configurable exception behavior

Usage:
    Synchronous retrieval::

        from plane.graphql.helpers.workspace import get_workspace

        # Retrieve by slug
        workspace = get_workspace(slug="my-workspace")

        # Retrieve by ID
        workspace = get_workspace(id="550e8400-e29b-41d4-a716-446655440000")

        # Retrieve without raising exception on not found
        workspace = get_workspace(slug="my-workspace", raise_exception=False)

    Asynchronous retrieval::

        from plane.graphql.helpers.workspace import get_workspace_async

        workspace = await get_workspace_async(slug="my-workspace")

Error Handling:
    - Returns HTTP 404 with code "NOT_FOUND" when workspace doesn't exist
    - Returns HTTP 400 with code "SOMETHING_WENT_WRONG" for unexpected errors

Dependencies:
    - Django ORM for database queries
    - Strawberry GraphQL for type definitions and error handling
    - asgiref for async/sync compatibility

Note:
    All functions in this module log errors using the centralized
    GraphQL error logging utility for consistent observability.
"""

# Python Imports
from typing import Optional, Union

# Third Party Imports
import strawberry
from asgiref.sync import async_to_sync

# Strawberry Imports
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.db.models import Workspace
from plane.graphql.utils.logger import log_graphql_error


def _build_workspace_filters(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
) -> dict:
    """
    Build the filter dictionary for workspace lookup.

    Constructs a dictionary of filter parameters to be used with Django ORM
    queries. Combines the standard lookup fields (id, slug) with any
    additional custom filters provided.

    Args:
        id: The workspace UUID identifier. Accepts either a string
            representation or a Strawberry ID type. Defaults to None.
        slug: The workspace slug (URL-friendly identifier).
            Defaults to None.
        filters: Additional filter parameters to merge into the
            lookup query. These are passed directly to Django's
            QuerySet.get() method. Defaults to None.

    Returns:
        dict: A dictionary containing all non-None filter parameters
            ready for use with Django ORM queries.

    Example:
        >>> _build_workspace_filters(slug="my-workspace")
        {'slug': 'my-workspace'}

        >>> _build_workspace_filters(
        ...     id="550e8400-e29b-41d4-a716-446655440000",
        ...     filters={"is_active": True}
        ... )
        {'id': '550e8400-e29b-41d4-a716-446655440000', 'is_active': True}

    Note:
        This is a private helper function and should not be called
        directly from outside this module.
    """

    workspace_filters = {}
    if id:
        workspace_filters["id"] = id
    if slug:
        workspace_filters["slug"] = slug
    if filters:
        workspace_filters.update(filters)
    return workspace_filters


def get_workspace(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
    raise_exception: bool = True,
) -> Optional[Workspace]:
    """
    Retrieve a workspace instance by either its slug or ID.

    Performs a synchronous database lookup for a workspace using the
    provided identifiers. Supports flexible lookup strategies and
    configurable error handling behavior.

    Args:
        id: The workspace UUID identifier. Accepts either a string
            representation (e.g., "550e8400-e29b-41d4-a716-446655440000")
            or a Strawberry ID type. Defaults to None.
        slug: The workspace slug - a URL-friendly unique identifier
            (e.g., "my-workspace"). Defaults to None.
        filters: Additional Django ORM filter parameters to apply
            to the lookup query. Useful for adding constraints like
            `{"is_active": True}`. Defaults to None.
        raise_exception: Controls behavior when workspace is not found.
            If True (default), raises a GraphQLError with NOT_FOUND code.
            If False, returns None silently. Defaults to True.

    Returns:
        Workspace: The workspace model instance matching the provided
            identifier(s).
        None: If workspace is not found and `raise_exception` is False.

    Raises:
        GraphQLError: Raised in the following scenarios:
            - Workspace not found (code: "NOT_FOUND", status: 404)
              when `raise_exception=True`
            - Unexpected database or system error (code: "SOMETHING_WENT_WRONG",
              status: 400)
            - ValueError: Raised if neither id nor slug is provided to build workspace filters


    Example:
        Basic usage with slug::

            workspace = get_workspace(slug="engineering-team")
            print(workspace.name)  # "Engineering Team"

        Usage with ID::

            workspace = get_workspace(id="550e8400-e29b-41d4-a716-446655440000")

        Graceful handling of missing workspace::

            workspace = get_workspace(slug="non-existent", raise_exception=False)
            if workspace is None:
                # Handle missing workspace case
                create_default_workspace()

        With additional filters::

            workspace = get_workspace(
                slug="my-workspace",
                filters={"owner_id": user.id}
            )

    See Also:
        get_workspace_async: Asynchronous version of this function.
    """
    try:
        if not id and not slug:
            raise ValueError("Either id or slug must be provided to build workspace filters")

        workspace_filters = _build_workspace_filters(id=id, slug=slug, filters=filters)
        return Workspace.objects.get(**workspace_filters)
    except ValueError as e:
        error_message = str(e)
        error_extensions = {"code": "INVALID_ARGUMENTS", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Workspace.DoesNotExist:
        if not raise_exception:
            return None

        error_message = f"Workspace not found with filters: {workspace_filters}"
        error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
        raise GraphQLError(message=error_message, extensions=error_extensions)
    except Exception as e:
        if not raise_exception:
            return None

        error_message = f"Error getting workspace with filters: {workspace_filters}"
        log_graphql_error(message=error_message, error=e)
        error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
        raise GraphQLError(message=error_message, extensions=error_extensions)


@async_to_sync
async def get_workspace_async(
    id: Optional[Union[str, strawberry.ID]] = None,
    slug: Optional[str] = None,
    filters: Optional[dict] = None,
    raise_exception: bool = True,
) -> Optional[Workspace]:
    """
    Asynchronously retrieve a workspace instance by either its slug or ID.

    Provides an async-compatible interface for workspace retrieval, suitable
    for use in async GraphQL resolvers and other asynchronous contexts.
    Internally delegates to the synchronous `get_workspace` function using
    the `async_to_sync` decorator for database compatibility.

    Args:
        id: The workspace UUID identifier. Accepts either a string
            representation (e.g., "550e8400-e29b-41d4-a716-446655440000")
            or a Strawberry ID type. Defaults to None.
        slug: The workspace slug - a URL-friendly unique identifier
            (e.g., "my-workspace"). Defaults to None.
        filters: Additional Django ORM filter parameters to apply
            to the lookup query. Useful for adding constraints like
            `{"is_active": True}`. Defaults to None.
        raise_exception: Controls behavior when workspace is not found.
            If True (default), raises a GraphQLError with NOT_FOUND code.
            If False, returns None silently. Defaults to True.

    Returns:
        Workspace: The workspace model instance matching the provided
            identifier(s).
        None: If workspace is not found and `raise_exception` is False.

    Raises:
        GraphQLError: Raised in the following scenarios:
            - Workspace not found (code: "NOT_FOUND", status: 404)
              when `raise_exception=True`
            - Unexpected database or system error (code: "SOMETHING_WENT_WRONG",
              status: 400)
            - ValueError: Raised if neither id nor slug is provided to build workspace filters

    Example:
        Usage in an async resolver::

            @strawberry.field
            async def workspace(self, info, slug: str) -> WorkspaceType:
                workspace = await get_workspace_async(slug=slug)
                return WorkspaceType.from_orm(workspace)

        Graceful error handling::

            workspace = await get_workspace_async(
                slug="my-workspace",
                raise_exception=False
            )
            if workspace is None:
                return None  # or handle appropriately

    Note:
        This function uses the `@async_to_sync` decorator to bridge
        Django's synchronous ORM with async code. For high-throughput
        scenarios, consider using Django's async ORM features directly.

    See Also:
        get_workspace: Synchronous version of this function.
    """
    return await get_workspace(id=id, slug=slug, filters=filters, raise_exception=raise_exception)
