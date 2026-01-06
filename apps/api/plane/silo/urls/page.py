from django.urls import path

from plane.silo.views import (
    WikiBulkOperationAPIView,
    ProjectPageBulkOperationAPIView,
    TeamspacePageBulkOperationAPIView,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/pages/bulk-operation/",
        WikiBulkOperationAPIView.as_view(),
        name="api-global-pages-bulk-operation",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/pages/bulk-operation/",
        ProjectPageBulkOperationAPIView.as_view(),
        name="api-project-pages-bulk-operation",
    ),
    path(
        "workspaces/<str:slug>/teamspaces/<uuid:team_space_id>/pages/bulk-operation/",
        TeamspacePageBulkOperationAPIView.as_view(),
        name="api-teamspace-pages-bulk-operation",
    ),
]
