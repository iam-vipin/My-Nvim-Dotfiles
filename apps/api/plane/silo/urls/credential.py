# Django imports
from django.urls import path

# Module imports
from plane.silo.views import (
    WorkspaceCredentialAPIView,
    VerifyWorkspaceCredentialAPIView,
)

urlpatterns = [
    # workspace credential url patterns
    path(
        "workspace-credentials/<uuid:pk>/",
        WorkspaceCredentialAPIView.as_view(),
        name="workspace-credential",
    ),
    path(
        "workspace-credentials/",
        WorkspaceCredentialAPIView.as_view(),
        name="workspace-credential",
    ),
    path(
        "workspace-credentials/<uuid:pk>/token-verify/",
        VerifyWorkspaceCredentialAPIView.as_view(),
        name="workspace-credential-token-verify",
    ),
    path(
        "workspace-credentials/token-verify/",
        VerifyWorkspaceCredentialAPIView.as_view(),
        name="workspace-credential-token-verify",
    ),
]
