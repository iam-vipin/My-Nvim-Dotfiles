# Django imports
from django.urls import path

# Module imports
from plane.silo.views import (
    WorkspaceConnectionAPIView,
    WorkspaceUserConnectionAPIView,
)

urlpatterns = [
    # workspace connections url patterns
    path(
        "workspace-connections/<uuid:pk>/",
        WorkspaceConnectionAPIView.as_view(),
        name="workspace-connection-detail",
    ),
    path(
        "workspace-connections/",
        WorkspaceConnectionAPIView.as_view(),
        name="workspace-connection-detail",
    ),
    # List all user-specific connections for a workspace
    path(
        "workspace-user-connections/",
        WorkspaceUserConnectionAPIView.as_view(),
        name="workspace-user-connections",
    ),
]
