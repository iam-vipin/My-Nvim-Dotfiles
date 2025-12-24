from datetime import timedelta

from django.db import models
from django.utils import timezone

from plane.db.models import BaseModel

STALE_TIMEOUT = timedelta(minutes=5)


# created - The run has been initiated but not yet started processing
# in-progress - The agent is actively processing the request
# awaiting - The agent has paused execution and is waiting for additional input
# completed - The agent has successfully finished processing
# stopping - A stop request has been received and is being processed
# stopped - The run has been successfully stopped
# failed - The run encountered an error and cannot continue
# stale - The run has not been updated in a while and is considered stale
class AgentRunStatus(models.TextChoices):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    AWAITING = "awaiting"
    COMPLETED = "completed"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"
    STALE = "stale"


class AgentRunType(models.TextChoices):
    COMMENT_THREAD = "comment_thread"


class AgentRun(BaseModel):
    agent_user = models.ForeignKey("db.User", on_delete=models.CASCADE, related_name="agent_runs")
    comment = models.ForeignKey(
        "db.IssueComment", on_delete=models.CASCADE, related_name="comment_agent_runs", null=True, blank=True
    )
    source_comment = models.ForeignKey(
        "db.IssueComment", on_delete=models.CASCADE, related_name="source_comment_agent_runs", null=True, blank=True
    )
    creator = models.ForeignKey("db.User", on_delete=models.CASCADE, related_name="agent_runs_creators")
    stopped_at = models.DateTimeField(null=True, blank=True)
    stopped_by = models.ForeignKey(
        "db.User", on_delete=models.CASCADE, related_name="agent_runs_stopped_by", null=True, blank=True
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    external_link = models.URLField(null=True, blank=True)
    issue = models.ForeignKey("db.Issue", on_delete=models.CASCADE, related_name="agent_runs", null=True, blank=True)
    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="agent_runs")
    project = models.ForeignKey(
        "db.Project", on_delete=models.CASCADE, related_name="agent_runs", null=True, blank=True
    )
    status = models.CharField(max_length=255, choices=AgentRunStatus.choices, default=AgentRunStatus.CREATED)
    error_metadata = models.JSONField(
        default=dict, null=True, blank=True
    )  # more info about the error like message, stack trace, etc
    type = models.CharField(max_length=255, choices=AgentRunType.choices, default=AgentRunType.COMMENT_THREAD)

    def get_status(self):
        """Returns status, marking as stale if inactive for too long."""
        active_statuses = [
            AgentRunStatus.CREATED,
            AgentRunStatus.IN_PROGRESS,
            AgentRunStatus.AWAITING,
        ]
        if self.status in active_statuses:
            if timezone.now() - self.updated_at > STALE_TIMEOUT:
                self.status = AgentRunStatus.STALE
                self.ended_at = timezone.now()
                self.save(update_fields=["status", "ended_at", "updated_at"])
        return self.status
    
    def save(self, *args, **kwargs):
        is_creating = self._state.adding
        super().save(*args, **kwargs)
        # trigger the agent run webhook
        if is_creating:
            from plane.agents.bgtasks.agent_run_webhook import trigger_agent_run_webhook_task

            trigger_agent_run_webhook_task.delay(self.id)

    class Meta:
        verbose_name = "Agent Run"
        verbose_name_plural = "Agent Runs"
        db_table = "agent_runs"


class AgentRunActivitySignal(models.TextChoices):
    AUTH_REQUEST = "auth_request"
    CONTINUE = "continue"
    SELECT = "select"
    STOP = "stop"


class AgentRunActivityType(models.TextChoices):
    ACTION = "action"
    ELICITATION = "elicitation"
    ERROR = "error"
    PROMPT = "prompt"
    RESPONSE = "response"
    THOUGHT = "thought"


EPHEMERAL_ACTIVITY_TYPES = [AgentRunActivityType.ACTION, AgentRunActivityType.THOUGHT, AgentRunActivityType.ERROR]


class AgentRunActivity(BaseModel):
    agent_run = models.ForeignKey("agents.AgentRun", on_delete=models.CASCADE, related_name="activities")
    content = models.JSONField(
        default=dict
    )  # {type: str, body: str, action?: str, parameters?: dict} eg {type: "text", body: "What is the meaning of life?"}
    content_metadata = models.JSONField(default=dict)  # info about how the content was generated
    ephemeral = models.BooleanField(default=False)  # hide the activity from the user after a non-ephemeral activity
    signal = models.CharField(
        max_length=255, choices=AgentRunActivitySignal.choices, default=AgentRunActivitySignal.CONTINUE
    )  # info about how to interpret the activity
    signal_metadata = models.JSONField(default=dict)  # more info about how the signal needs to be handled
    comment = models.ForeignKey(
        "db.IssueComment", on_delete=models.CASCADE, related_name="agent_run_activities", null=True, blank=True
    )  # the comment that the activity is associated with
    actor = models.ForeignKey(
        "db.User", on_delete=models.CASCADE, related_name="agent_run_activities", null=True, blank=True
    )
    type = models.CharField(max_length=255, choices=AgentRunActivityType.choices, default=AgentRunActivityType.PROMPT)
    project = models.ForeignKey(
        "db.Project", on_delete=models.CASCADE, related_name="agent_run_activities", null=True, blank=True
    )
    workspace = models.ForeignKey(
        "db.Workspace",
        on_delete=models.CASCADE,
        related_name="agent_run_activities",
    )

    class Meta:
        verbose_name = "Agent Run Activity"
        verbose_name_plural = "Agent Run Activities"
        db_table = "agent_run_activities"

    def update_run_status(self):
        # if type is action or thought, set the run status to in progress
        if self.type in [AgentRunActivityType.ACTION, AgentRunActivityType.THOUGHT]:
            self.agent_run.status = AgentRunStatus.IN_PROGRESS
        # if type is error, set the run status to failed
        elif self.type == AgentRunActivityType.ERROR:
            self.agent_run.status = AgentRunStatus.FAILED
            self.agent_run.ended_at = timezone.now()
            self.agent_run.error_metadata = self.signal_metadata
        # if type is response, set the run status to in progress if the run is not stopping, otherwise set it to stopped
        elif self.type == AgentRunActivityType.RESPONSE:
            current_run_status = self.agent_run.status
            if current_run_status == AgentRunStatus.STOPPING:
                self.agent_run.status = AgentRunStatus.STOPPED
                self.agent_run.stopped_at = timezone.now()
                self.agent_run.stopped_by = self.user if self.user else None
                self.agent_run.ended_at = timezone.now()
            else:
                self.agent_run.status = AgentRunStatus.IN_PROGRESS
        # if type is elicitation, set the run status to awaiting
        elif self.type == AgentRunActivityType.ELICITATION:
            self.agent_run.status = AgentRunStatus.AWAITING
        # if type is response, set the run status to completed if the run is not stopping, otherwise set it to stopped
        elif self.type == AgentRunActivityType.PROMPT:
            if self.signal == AgentRunActivitySignal.STOP:
                self.agent_run.status = AgentRunStatus.STOPPING
            else:
                self.agent_run.status = AgentRunStatus.IN_PROGRESS
        else:
            self.agent_run.status = AgentRunStatus.IN_PROGRESS

        # save the run
        self.agent_run.save()

    def save(self, *args, **kwargs):
        # update ephemeral value based on the activity type
        is_creating = self._state.adding
        if self.type in EPHEMERAL_ACTIVITY_TYPES:
            self.ephemeral = True
        super().save(*args, **kwargs)
        # update the run status based on the activity type and signal
        self.update_run_status()
        # if the activity is created by the run's agent user,
        # handle the agent activity by creating a new comment conditionally

        if is_creating:
          if self.actor == self.agent_run.agent_user:
              from plane.agents.utils.handlers import handle_agent_run_activity
              handle_agent_run_activity(self)
          else:
              # trigger the activity webhook for the user activity
              from plane.agents.bgtasks.agent_run_activity_webhook import trigger_user_activity_webhook_task
              trigger_user_activity_webhook_task.delay(self.id)
