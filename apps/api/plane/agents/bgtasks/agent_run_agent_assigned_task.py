from celery import shared_task
from logging import getLogger

from plane.db.models import Issue, User
from plane.agents.models import AgentRun, AgentRunActivity, AgentRunActivityType

logger = getLogger("plane.agents.bgtasks")


@shared_task
def handle_assignee_for_agent_run_task(issue_id: str, actor_id: str):
    """
    Handle the assignee for agent run task.
    Check if an agent has been assigned to the issue.
    If so, create a new run activity for the agent.
    If not, return.
    """
    issue = Issue.objects.get(id=issue_id)
    actor = User.objects.get(id=actor_id)
    # return if no agent has been assigned to the issue
    agent_user = issue.assignees.filter(is_bot=True).first()
    if not agent_user:
        return

    # create a new agent run
    agent_run = AgentRun.objects.create(
        agent_user=agent_user,
        creator=actor,
        issue=issue,
        workspace=issue.workspace,
        project=issue.project,
    )

    # create a new prompt activity with ephemeral flag set to True
    AgentRunActivity.objects.create(
        agent_run=agent_run,
        content={"type": AgentRunActivityType.PROMPT, "body": "Agent assigned to the work item"},
        ephemeral=True,
        actor=actor,
        workspace=issue.workspace,
        project=issue.project,
        type=AgentRunActivityType.PROMPT,
    )
    return
