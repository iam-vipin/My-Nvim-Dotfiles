from django.urls import path
from plane.agents.views.app.agent_run import AgentRunViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/runs/<uuid:pk>/", AgentRunViewSet.as_view({"get": "retrieve"}), name="agent-run-detail"
    ),
    path(
        "workspaces/<str:slug>/runs/<uuid:pk>/stop/",
        AgentRunViewSet.as_view({"post": "stop_run"}),
        name="agent-run-stop",
    ),
]
