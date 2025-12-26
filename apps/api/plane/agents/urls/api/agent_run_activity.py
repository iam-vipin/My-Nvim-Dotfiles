from django.urls import path
from plane.agents.views.api.agent_run_activity import AgentRunActivityAPIViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/runs/<uuid:run_id>/activities/",
        AgentRunActivityAPIViewSet.as_view({"get": "get_run_activities", "post": "create"}),
        name="agent-run-activities",
    ),
    path(
        "workspaces/<str:slug>/runs/<uuid:run_id>/activities/<uuid:pk>/",
        AgentRunActivityAPIViewSet.as_view({"get": "retrieve"}),
        name="agent-run-activity-detail",
    )
]
