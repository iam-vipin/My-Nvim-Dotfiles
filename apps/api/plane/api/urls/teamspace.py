from django.urls import path

from plane.api.views import TeamspaceViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/teamspaces/",
        TeamspaceViewSet.as_view({"get": "list", "post": "create"}),
        name="workspace-teamspaces",
    ),
    path(
        "workspaces/<str:slug>/teamspaces/<uuid:pk>/",
        TeamspaceViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="workspace-teamspaces",
    ),
    path(
        "workspaces/<str:slug>/teamspaces/<uuid:teamspace_id>/projects/",
        TeamspaceViewSet.as_view({"get": "get_projects", "post": "add_projects", "delete": "remove_projects"}),
        name="workspace-teamspaces-projects",
    ),
    path(
        "workspaces/<str:slug>/teamspaces/<uuid:teamspace_id>/members/",
        TeamspaceViewSet.as_view({"get": "get_members", "post": "add_members", "delete": "remove_members"}),
        name="workspace-teamspaces-members",
    ),
]
