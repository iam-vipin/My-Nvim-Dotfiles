# python imports
from logging import getLogger

# django imports
from django.conf import settings

# third party imports
from celery import shared_task

# plane imports
from plane.agents.models import AgentRunActivity
from plane.authentication.models import WorkspaceAppInstallation
from plane.bgtasks.webhook_task import webhook_send_task
from plane.agents.serializers.api import (
    AgentRunActivityWebhookPayloadSerializer,
    AgentRunWebhookPayloadSerializer,
)

logger = getLogger("plane.agents.bgtasks")


@shared_task
def trigger_user_activity_webhook_task(activity_id: str):
    """
    Trigger the user activity webhook.
    """
    logger.info(f"Triggering user activity webhook for activity {activity_id}")
    try:
        activity = AgentRunActivity.objects.get(id=activity_id)
    except AgentRunActivity.DoesNotExist:
        return

    agent_user = activity.agent_run.agent_user
    # get the workspace app installation for the agent user part of the workspace
    workspace_app_installation = WorkspaceAppInstallation.objects.filter(app_bot=agent_user).first()
    if not workspace_app_installation:
        return

    # create the payload data for the webhook
    event_data = {
        "action": "prompted",
        "agent_run_activity": AgentRunActivityWebhookPayloadSerializer(activity).data,
        "agent_run": AgentRunWebhookPayloadSerializer(activity.agent_run).data,
        "agent_user_id": str(activity.agent_run.agent_user.id),
        "app_client_id": workspace_app_installation.application.client_id,
        "comment_id": str(activity.comment.id) if activity.comment else None,
        "issue_id": str(activity.agent_run.issue.id) if activity.agent_run.issue else None,
        "project_id": str(activity.agent_run.project.id) if activity.agent_run.project else None,
        "workspace_id": str(activity.agent_run.workspace.id),
        "type": "agent_run_activity",
    }

    # send the webhook
    webhook_send_task.delay(
        webhook_id=workspace_app_installation.webhook.id,
        slug=workspace_app_installation.workspace.slug,
        event="agent_run_user_prompt",
        event_data=event_data,
        action="created",
        current_site=settings.WEB_URL,
        activity=event_data,
    )
