# Django imports
from django.urls import path

# Module imports
from plane.silo.views import (
    WorkspaceEntityConnectionAPIView,
)

# workspace entity connection url patterns
urlpatterns = [
    path(
        "workspace-entity-connections/<uuid:pk>/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
    path(
        "workspace-entity-connections/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
]
