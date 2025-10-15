from django.urls import path


from plane.app.views.exporter import ExportIssuesEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/export-issues/",
        ExportIssuesEndpoint.as_view(),
        name="export-issues",
    ),
]