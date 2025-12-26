from django.urls import path
from plane.agents.views.app.agent_run_activity import AgentRunActivityViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/runs/<uuid:run_id>/activities/",
        AgentRunActivityViewSet.as_view({"get": "get_run_activities"}),
        name="agent-run-activities-list",
    ),
    path(
        "workspaces/<str:slug>/runs/<uuid:run_id>/activities/<uuid:pk>/",
        AgentRunActivityViewSet.as_view({"get": "retrieve"}),
        name="agent-run-activity-retrieve",
    ),
]
