"""Teamspace access utilities for GraphQL project queries."""

from typing import Optional, Union

import strawberry
from asgiref.sync import sync_to_async
from django.db.models import Q

from plane.db.models import ProjectMember
from plane.ee.models import TeamspaceMember, TeamspaceProject, WorkspaceFeature
from plane.graphql.types.feature_flag import FeatureFlagsTypesEnum
from plane.graphql.types.teamspace import TeamspaceHelperType, TeamspaceProjectQueryPathEnum
from plane.graphql.utils.feature_flag import _validate_feature_flag


def check_teamspace_feature_flag(workspace_slug: str, user_id: Union[str, strawberry.ID]) -> bool:
    """
    Check if teamspace feature flag is enabled.

    Args:
        workspace_slug: Workspace slug identifier.
        user_id: User UUID.

    Returns:
        True if enabled, False otherwise.
    """
    feature_key = FeatureFlagsTypesEnum.TEAMSPACES.value
    return _validate_feature_flag(
        workspace_slug=workspace_slug,
        feature_key=feature_key,
        user_id=user_id,
    )


@sync_to_async
def check_teamspace_feature_flag_async(workspace_slug: str, user_id: Union[str, strawberry.ID]) -> bool:
    """Async version of check_teamspace_feature_flag."""
    return check_teamspace_feature_flag(workspace_slug=workspace_slug, user_id=user_id)


def check_workspace_teamspace_enabled(workspace_id: Union[str, strawberry.ID]) -> bool:
    """
    Check if teamspace is enabled in workspace settings.

    Args:
        workspace_id: Workspace UUID.

    Returns:
        True if enabled, False otherwise.
    """
    return WorkspaceFeature.objects.filter(
        workspace_id=workspace_id,
        is_teams_enabled=True,
    ).exists()


@sync_to_async
def check_workspace_teamspace_enabled_async(workspace_id: Union[str, strawberry.ID]) -> bool:
    """Async version of check_workspace_teamspace_enabled."""
    return check_workspace_teamspace_enabled(workspace_id)


def _get_user_exclusive_teamspace_project_ids(
    user_id: str,
    workspace_id: Union[str, strawberry.ID],
) -> list[str]:
    """
    Get project IDs accessible only via teamspace (excluding direct memberships).

    Args:
        user_id: User UUID.
        workspace_id: Workspace UUID.

    Returns:
        Deduplicated list of project IDs.
    """
    direct_membership_project_ids = ProjectMember.objects.filter(
        workspace_id=workspace_id,
        member_id=user_id,
        is_active=True,
    ).values_list("project_id", flat=True)

    user_teamspace_ids = TeamspaceMember.objects.filter(
        workspace_id=workspace_id,
        member_id=user_id,
    ).values_list("team_space_id", flat=True)

    teamspace_only_project_ids = (
        TeamspaceProject.objects.filter(
            team_space_id__in=user_teamspace_ids,
            project__archived_at__isnull=True,
        )
        .exclude(project_id__in=direct_membership_project_ids)
        .only("project_id")
        .values_list("project_id", flat=True)
    )

    return list(set(teamspace_only_project_ids))


def _build_base_project_membership_query(
    user_id: str,
    query_path: TeamspaceProjectQueryPathEnum,
) -> tuple[Q, str]:
    """
    Build Django Q filter for project membership.

    Args:
        user_id: User UUID.
        query_path: ORM relationship path enum.

    Returns:
        Tuple of (Q filter, project ID field name).
    """
    if query_path == TeamspaceProjectQueryPathEnum.SINGLE_FK:
        return (
            Q(
                project__project_projectmember__member_id=user_id,
                project__project_projectmember__is_active=True,
                project__archived_at__isnull=True,
            ),
            "project_id",
        )

    if query_path == TeamspaceProjectQueryPathEnum.DIRECT:
        return (
            Q(
                project_projectmember__member_id=user_id,
                project_projectmember__is_active=True,
                archived_at__isnull=True,
            ),
            "id",
        )

    if query_path == TeamspaceProjectQueryPathEnum.MANY_TO_MANY:
        return (
            Q(
                projects__project_projectmember__member_id=user_id,
                projects__project_projectmember__is_active=True,
                projects__archived_at__isnull=True,
            ),
            "projects__id",
        )


def build_teamspace_project_access_filter(
    user_id: str,
    workspace_id: Union[str, strawberry.ID],
    workspace_slug: str,
    query_path: Optional[TeamspaceProjectQueryPathEnum] = TeamspaceProjectQueryPathEnum.SINGLE_FK,
) -> TeamspaceHelperType:
    """
    Build filter for projects accessible via direct or teamspace membership.

    Args:
        user_id: User UUID.
        workspace_id: Workspace UUID.
        workspace_slug: Workspace slug identifier.
        query_path: ORM path enum (default: SINGLE_FK).

    Returns:
        TeamspaceHelperType with query and metadata.
    """
    is_feature_flag_enabled = check_teamspace_feature_flag(
        workspace_slug=workspace_slug,
        user_id=user_id,
    )
    is_teamspace_enabled = check_workspace_teamspace_enabled(workspace_id=workspace_id)

    base_membership_query, project_id_field = _build_base_project_membership_query(
        user_id=user_id,
        query_path=query_path,
    )

    result = TeamspaceHelperType(
        is_teamspace_enabled=is_teamspace_enabled,
        is_teamspace_feature_flagged=is_feature_flag_enabled,
        query=base_membership_query,
    )

    if not is_feature_flag_enabled or not is_teamspace_enabled:
        return result

    teamspace_project_ids = _get_user_exclusive_teamspace_project_ids(
        user_id=user_id,
        workspace_id=workspace_id,
    )

    if not teamspace_project_ids:
        return result

    teamspace_projects_query = Q(**{f"{project_id_field}__in": teamspace_project_ids})
    combined_access_query = base_membership_query | teamspace_projects_query

    result.query = combined_access_query
    result.teamspace_project_ids = teamspace_project_ids

    return result


@sync_to_async
def build_teamspace_project_access_filter_async(
    user_id: str,
    workspace_id: Union[str, strawberry.ID],
    workspace_slug: str,
    query_path: Optional[TeamspaceProjectQueryPathEnum] = TeamspaceProjectQueryPathEnum.SINGLE_FK,
) -> TeamspaceHelperType:
    """Async version of build_teamspace_project_access_filter."""
    return build_teamspace_project_access_filter(
        user_id=user_id,
        workspace_id=workspace_id,
        workspace_slug=workspace_slug,
        query_path=query_path,
    )
