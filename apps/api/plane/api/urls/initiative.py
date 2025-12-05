from plane.api.views import InitiativeViewSet, InitiativeLabelViewSet
from django.urls import path


urlpatterns = [
    # Initiative urls - manage initiatives, and its associated labels, projects, and epics
    path(
        "workspaces/<str:slug>/initiatives/",
        InitiativeViewSet.as_view({"get": "list", "post": "create"}),
        name="initiatives",
    ),
    path(
        "workspaces/<str:slug>/initiatives/<uuid:pk>/",
        InitiativeViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="initiatives",
    ),
    path(
        "workspaces/<str:slug>/initiatives/<uuid:initiative_id>/labels/",
        InitiativeViewSet.as_view({"get": "get_labels", "post": "add_labels", "delete": "remove_labels"}),
        name="initiative-labels-manage",
    ),
    path(
        "workspaces/<str:slug>/initiatives/<uuid:initiative_id>/projects/",
        InitiativeViewSet.as_view({"get": "get_projects", "post": "add_projects", "delete": "remove_projects"}),
        name="initiative-projects-manage",
    ),
    path(
        "workspaces/<str:slug>/initiatives/<uuid:initiative_id>/epics/",
        InitiativeViewSet.as_view({"get": "get_epics", "post": "add_epics", "delete": "remove_epics"}),
        name="initiative-epics-manage",
    ),
    # initiative labels endpoints
    path(
        "workspaces/<str:slug>/initiatives/labels/",
        InitiativeLabelViewSet.as_view({"get": "list", "post": "create"}),
        name="initiative-labels",
    ),
    path(
        "workspaces/<str:slug>/initiatives/labels/<uuid:pk>/",
        InitiativeLabelViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="initiative-label-detail",
    ),
]
