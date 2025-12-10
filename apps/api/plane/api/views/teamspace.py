from rest_framework.response import Response
from rest_framework import status

from plane.api.views.base import BaseViewSet
from plane.api.serializers import TeamspaceSerializer, ProjectSerializer, UserLiteSerializer
from plane.ee.models import Teamspace, TeamspaceProject, TeamspaceMember
from plane.db.models import Workspace, Project, User
from plane.app.permissions import WorkSpaceAdminPermission
from plane.api.permissions import TeamspaceFeatureFlagPermission


# OpenAPI imports
from plane.utils.openapi.decorators import teamspace_docs, teamspace_entity_docs

from drf_spectacular.utils import OpenApiRequest, OpenApiResponse
from plane.utils.openapi import (
    TEAMSPACE_EXAMPLE,
    create_paginated_response,
    DELETED_RESPONSE,
    PROJECT_EXAMPLE,
    USER_EXAMPLE,
    WORKSPACE_SLUG_PARAMETER,
    TEAMSPACE_ID_PARAMETER,
    CURSOR_PARAMETER,
    PER_PAGE_PARAMETER,
)


class TeamspaceViewSet(BaseViewSet):
    serializer_class = TeamspaceSerializer
    model = Teamspace
    permission_classes = [WorkSpaceAdminPermission, TeamspaceFeatureFlagPermission]

    def get_queryset(self):
        return Teamspace.objects.filter(workspace__slug=self.kwargs.get("slug"))

    @teamspace_docs(
        operation_id="create_teamspace",
        summary="Create a new teamspace",
        description="Create a new teamspace in the workspace",
        request=OpenApiRequest(request=TeamspaceSerializer),
        responses={
            201: OpenApiResponse(
                description="Teamspace created", response=TeamspaceSerializer, examples=[TEAMSPACE_EXAMPLE]
            )
        },
    )
    def create(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        serializer = TeamspaceSerializer(
            data=request.data, context={"workspace_id": workspace.id, "user": request.user}
        )
        if serializer.is_valid():
            serializer.save(workspace_id=workspace.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @teamspace_docs(
        operation_id="list_teamspaces",
        summary="List teamspaces",
        description="List all teamspaces in the workspace",
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            CURSOR_PARAMETER,
            PER_PAGE_PARAMETER,
        ],
        responses={
            200: create_paginated_response(
                TeamspaceSerializer, "Teamspace", "List of teamspaces", example_name="Paginated Teamspaces"
            )
        },
    )
    def list(self, request, slug):
        teamspaces = self.get_queryset()
        return self.paginate(
            request=request,
            queryset=(teamspaces),
            on_results=lambda teamspaces: TeamspaceSerializer(teamspaces, many=True).data,
            default_per_page=20,
        )

    @teamspace_docs(
        operation_id="retrieve_teamspace",
        summary="Retrieve a teamspace",
        description="Retrieve a teamspace by its ID",
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={
            200: OpenApiResponse(description="Teamspace", response=TeamspaceSerializer, examples=[TEAMSPACE_EXAMPLE])
        },
    )
    def retrieve(self, request, slug, pk):
        teamspace = self.get_queryset().get(id=pk)
        return Response(TeamspaceSerializer(teamspace).data, status=status.HTTP_200_OK)

    @teamspace_docs(
        operation_id="update_teamspace",
        summary="Update a teamspace",
        description="Update a teamspace by its ID",
        request=OpenApiRequest(request=TeamspaceSerializer),
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={
            200: OpenApiResponse(description="Teamspace", response=TeamspaceSerializer, examples=[TEAMSPACE_EXAMPLE])
        },
    )
    def partial_update(self, request, slug, pk):
        teamspace = self.get_queryset().get(id=pk)
        serializer = TeamspaceSerializer(teamspace, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @teamspace_docs(
        operation_id="delete_teamspace",
        summary="Delete a teamspace",
        description="Delete a teamspace by its ID",
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={204: DELETED_RESPONSE},
    )
    def destroy(self, request, slug, pk):
        teamspace = self.get_queryset().get(id=pk)
        teamspace.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @teamspace_entity_docs(
        operation_id="list_teamspace_projects",
        summary="List teamspace projects",
        description="List all projects in a teamspace",
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={
            200: create_paginated_response(
                ProjectSerializer, "Project", "List of projects", example_name="Paginated Projects"
            )
        },
    )
    def get_projects(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        projects = Project.objects.filter(team_spaces__team_space=teamspace, team_spaces__deleted_at__isnull=True)
        # paginate the projects
        return self.paginate(
            request=request,
            queryset=(projects),
            on_results=lambda projects: ProjectSerializer(projects, many=True).data,
            default_per_page=20,
        )

    @teamspace_entity_docs(
        operation_id="add_teamspace_projects",
        summary="Add projects to a teamspace",
        description="Add projects to a teamspace",
        request=OpenApiRequest(
            request={
                "type": "object",
                "properties": {
                    "project_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "uuid",
                        },
                    },
                },
            }
        ),
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={
            200: OpenApiResponse(description="Projects added", response=ProjectSerializer, examples=[PROJECT_EXAMPLE])
        },
    )
    def add_projects(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        project_ids = request.data.get("project_ids", [])

        # skip adding projects that are already associated with the initiative
        existing_project_ids = TeamspaceProject.objects.filter(
            team_space=teamspace, project_id__in=project_ids
        ).values_list("project_id", flat=True)

        # Convert UUIDs to strings for proper comparison
        existing_project_ids = [str(uuid_id) for uuid_id in existing_project_ids]
        new_project_ids = set(project_ids) - set(existing_project_ids)

        for project_id in new_project_ids:
            project = Project.objects.get(id=project_id)
            TeamspaceProject.objects.create(team_space=teamspace, project=project, workspace_id=teamspace.workspace_id)

        # send new projects in response
        new_projects = Project.objects.filter(id__in=project_ids)
        serializer = ProjectSerializer(new_projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @teamspace_entity_docs(
        operation_id="remove_teamspace_projects",
        summary="Remove projects from a teamspace",
        description="Remove projects from a teamspace by its ID",
        request=OpenApiRequest(
            request={
                "type": "object",
                "properties": {
                    "project_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "uuid",
                        },
                    },
                },
            }
        ),
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={204: DELETED_RESPONSE},
    )
    def remove_projects(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        project_ids = request.data.get("project_ids", [])
        for project_id in project_ids:
            project = Project.objects.get(id=project_id)
            TeamspaceProject.objects.filter(team_space=teamspace, project=project).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @teamspace_entity_docs(
        operation_id="list_teamspace_members",
        summary="List teamspace members",
        description="List all members in a teamspace",
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
            CURSOR_PARAMETER,
            PER_PAGE_PARAMETER,
        ],
        responses={
            200: create_paginated_response(
                UserLiteSerializer, "UserLite", "List of members", example_name="Paginated Members"
            )
        },
    )
    def get_members(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        members = User.objects.filter(team_spaces__team_space=teamspace, team_spaces__deleted_at__isnull=True)
        return self.paginate(
            request=request,
            queryset=(members),
            on_results=lambda members: UserLiteSerializer(members, many=True).data,
            default_per_page=20,
        )

    @teamspace_entity_docs(
        operation_id="add_teamspace_members",
        summary="Add members to a teamspace",
        description="Add members to a teamspace",
        request=OpenApiRequest(
            request={
                "type": "object",
                "properties": {
                    "member_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "uuid",
                        },
                    },
                },
            }
        ),
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={
            200: OpenApiResponse(description="Members added", response=UserLiteSerializer, examples=[USER_EXAMPLE])
        },
    )
    def add_members(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        member_ids = request.data.get("member_ids", [])

        # skip adding members that are already associated with the teamspace
        existing_member_ids = TeamspaceMember.objects.filter(
            team_space=teamspace, member_id__in=member_ids
        ).values_list("member_id", flat=True)
        existing_member_ids = [str(uuid_id) for uuid_id in existing_member_ids]
        new_member_ids = set(member_ids) - set(existing_member_ids)

        for member_id in new_member_ids:
            member = User.objects.get(id=member_id)
            TeamspaceMember.objects.create(team_space=teamspace, member=member, workspace_id=teamspace.workspace_id)

        # send new members in response
        new_members = User.objects.filter(id__in=member_ids)
        serializer = UserLiteSerializer(new_members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @teamspace_entity_docs(
        operation_id="remove_teamspace_members",
        summary="Delete members from a teamspace",
        description="Delete members from a teamspace by its ID",
        request=OpenApiRequest(
            request={
                "type": "object",
                "properties": {
                    "member_ids": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "uuid",
                        },
                    },
                },
            }
        ),
        parameters=[
            WORKSPACE_SLUG_PARAMETER,
            TEAMSPACE_ID_PARAMETER,
        ],
        responses={204: DELETED_RESPONSE},
    )
    def remove_members(self, request, slug, teamspace_id):
        teamspace = self.get_queryset().get(id=teamspace_id)
        member_ids = request.data.get("member_ids", [])
        for member_id in member_ids:
            member = User.objects.get(id=member_id)
            TeamspaceMember.objects.filter(team_space=teamspace, member=member).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
