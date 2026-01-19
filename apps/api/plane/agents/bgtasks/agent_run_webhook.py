# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

# python imports
from celery import shared_task
from django.conf import settings

# plane imports
from plane.agents.models import AgentRun
from plane.authentication.models import WorkspaceAppInstallation
from plane.bgtasks.webhook_task import webhook_send_task
from plane.agents.serializers.api import AgentRunWebhookPayloadSerializer


@shared_task
def trigger_agent_run_webhook_task(agent_run_id: str):
    """
    Trigger the agent run webhook. When a new agent run is created.
    """
    agent_run = AgentRun.objects.get(id=agent_run_id)
    if not agent_run:
        return
    agent_user = agent_run.agent_user
    # get the workspace app installation for the agent user part of the workspace
    workspace_app_installation = WorkspaceAppInstallation.objects.filter(app_bot=agent_user).first()
    if not workspace_app_installation:
        return

    # create the payload data for the webhook
    event_data = {
        "action": "created",
        "agent_run": AgentRunWebhookPayloadSerializer(agent_run).data,
        "agent_user_id": agent_run.agent_user.id,
        "app_client_id": workspace_app_installation.application.client_id,
        "issue_id": agent_run.issue.id,
        "project_id": agent_run.project.id,
        "workspace_id": agent_run.workspace.id,
        "comment_id": agent_run.comment.id if agent_run.comment else None,
        "type": "agent_run",
    }

    # send the webhook
    webhook_send_task.delay(
        webhook_id=workspace_app_installation.webhook.id,
        slug=workspace_app_installation.workspace.slug,
        event="agent_run_create",
        event_data=event_data,
        action="created",
        current_site=settings.WEB_URL,
        activity=event_data,
    )
