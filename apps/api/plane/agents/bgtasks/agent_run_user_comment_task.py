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
from bs4 import BeautifulSoup
from celery import shared_task
from logging import getLogger

# plane imports
from plane.db.models import IssueComment, User
from plane.agents.models import AgentRun, AgentRunActivity, AgentRunActivityType, AgentRunStatus


logger = getLogger("plane.agents.bgtasks")


def extract_comment_mention_ids(comment_value):
    try:
        mentions = []
        soup = BeautifulSoup(comment_value, "html.parser")
        mentions_tags = soup.find_all("mention-component", attrs={"entity_name": "user_mention"})
        for mention_tag in mentions_tags:
            mentions.append(mention_tag["entity_identifier"])
        return list(set(mentions))
    except Exception:
        return []


def create_prompt_activity(agent_run: AgentRun, source_comment: IssueComment):
    """
    Create a new prompt activity for the associated run.
    """
    logger.info(f"Creating prompt activity for agent run {agent_run.id} with source comment {source_comment.id}")
    try:
        return AgentRunActivity.objects.create(
            agent_run=agent_run,
            content={"type": AgentRunActivityType.PROMPT, "body": source_comment.comment_html},
            actor=source_comment.actor,
            comment=source_comment,
            project=source_comment.project,
            workspace=source_comment.workspace,
            type=AgentRunActivityType.PROMPT,
        )
    except Exception as e:
        logger.error(
            f"Error creating prompt activity for agent run {agent_run.id} with source comment {source_comment.id}: {e}"
        )
        return None


@shared_task
def handle_agent_run_user_comment_task(comment_id: str):
    """
    Handle the agent run user commented on an issue task.
    Creates a new agent run if no run exists and creates a new activity with user prompt.
    Handle the comment activity for the associated agent run.
    Starts a new run or adds a new activity to the existing run.
    """
    source_comment = IssueComment.objects.get(id=comment_id)
    # check if the comment content contains an agent mention
    is_agent_mention = False
    agent_user = None
    # get all mentions in the comment content
    mention_ids = extract_comment_mention_ids(source_comment.comment_html)
    for mention_id in mention_ids:
        # if mention is a bot user, set the agent user and break
        agent_user = User.objects.filter(id=mention_id, is_bot=True).first()
        if agent_user:
            is_agent_mention = True
            break

    # check if the comment has a parent comment to use it as run comment
    comment = source_comment.parent if source_comment.parent else source_comment

    # check if comment is already part of an agent run
    agent_run = comment.comment_agent_runs.first()

    # if no agent mention and no run exists, return
    if not is_agent_mention and not agent_run:
        return

    # if run does not exist, create a new one
    if not agent_run:
        agent_run = AgentRun.objects.create(
            agent_user=agent_user,
            comment=comment,
            source_comment=source_comment,
            creator=source_comment.actor,
            issue=source_comment.issue,
            workspace=source_comment.workspace,
            project=source_comment.project,
        )
    else:
        # reset the run if it was stopped, failed, or completed
        if agent_run.status in [
            AgentRunStatus.STOPPED,
            AgentRunStatus.FAILED,
            AgentRunStatus.COMPLETED,
            AgentRunStatus.STALE,
        ]:
            agent_run.ended_at = None
            agent_run.stopped_at = None
            agent_run.stopped_by = None
            agent_run.error_metadata = None
            agent_run.save()

    # create prompt activity for the run (new or existing)
    create_prompt_activity(agent_run, source_comment)
    return
