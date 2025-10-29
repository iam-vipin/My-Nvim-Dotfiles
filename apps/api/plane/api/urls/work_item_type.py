from django.urls import path

from plane.api.views import IssueTypeListCreateAPIEndpoint, IssueTypeDetailAPIEndpoint

old_url_patterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/",
        IssueTypeListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="external-issue-type",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/<uuid:type_id>/",
        IssueTypeDetailAPIEndpoint.as_view(http_method_names=["get", "patch", "delete"]),
        name="external-issue-type-detail",
    ),
]

new_url_patterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/work-item-types/",
        IssueTypeListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="external-work-item-type",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/work-item-types/<uuid:type_id>/",
        IssueTypeDetailAPIEndpoint.as_view(http_method_names=["get", "patch", "delete"]),
        name="external-work-item-type-detail",
    ),
]

urlpatterns = old_url_patterns + new_url_patterns
