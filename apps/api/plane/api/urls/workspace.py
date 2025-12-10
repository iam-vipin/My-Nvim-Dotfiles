from django.urls import path
from plane.api.views.workspace import WorkspaceFeatureAPIEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/features/",
        WorkspaceFeatureAPIEndpoint.as_view(),
        name="workspace-features",
    ),
]
