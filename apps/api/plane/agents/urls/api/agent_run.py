from django.urls import path
from plane.agents.views.api.agent_run import AgentRunAPIViewSet

urlpatterns = [
    path("workspaces/<str:slug>/runs/", AgentRunAPIViewSet.as_view({"post": "create"}), name="agent-run-create"),
    path(
        "workspaces/<str:slug>/runs/<uuid:pk>/",
        AgentRunAPIViewSet.as_view({"get": "retrieve"}),
        name="agent-run-detail",
    )
]
