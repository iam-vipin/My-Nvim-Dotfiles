# Django imports
from django.conf import settings
from django.db import models

# Module imports
from plane.db.models import ProjectBaseModel


class AutomatedCycle(ProjectBaseModel):
    title = models.CharField(max_length=255, verbose_name="Automated Cycle Title")

    # Cycle configuration
    cycle_duration = models.PositiveIntegerField(
        verbose_name="Cycle Duration (days)", help_text="Duration of each cycle in days"
    )
    cooldown_period = models.PositiveIntegerField(
        verbose_name="Cooldown Period (days)",
        default=0,
        help_text="Gap between cycles in days",
    )

    # Automation configuration
    start_date = models.DateTimeField(verbose_name="First Cycle Start Date")
    number_of_cycles = models.PositiveIntegerField(
        verbose_name="Number of Future Cycles",
        help_text="How many cycles to create automatically",
    )

    # Behavior
    is_auto_rollover_enabled = models.BooleanField(
        default=False,
        verbose_name="Auto Rollover Issues",
        help_text="Automatically move uncompleted issues to next cycle",
    )
    is_active = models.BooleanField(default=True, verbose_name="Is Active")

    # Tracking
    owned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_automated_cycles",
    )

    class Meta:
        unique_together = ["project", "workspace", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["project", "workspace"],
                condition=models.Q(deleted_at__isnull=True),
                name="automated_cycle_unique_project_workspace_when_deleted_at_null",
            ),
        ]
        verbose_name = "Automated Cycle"
        verbose_name_plural = "Automated Cycles"
        db_table = "automated_cycles"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.title} <{self.project}>"


class AutomatedCycleLog(ProjectBaseModel):
    automated_cycle = models.ForeignKey(
        "ee.AutomatedCycle",
        on_delete=models.CASCADE,
        related_name="creation_logs",
    )
    cycle = models.ForeignKey(
        "db.Cycle",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="creation_logs",
    )
    action = models.CharField(
        max_length=50,
        choices=[
            ("cycle_created", "Cycle Created"),
            ("cycle_creation_failed", "Cycle Creation Failed"),
            ("rollover_completed", "Rollover Completed"),
            ("rollover_failed", "Rollover Failed"),
            ("automated_cycle_deactivated", "Automated Cycle Deactivated"),
        ],
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("success", "Success"),
            ("failed", "Failed"),
            ("skipped", "Skipped"),
        ],
    )
    message = models.TextField(blank=True, help_text="Detailed log message")
    metadata = models.JSONField(default=dict, help_text="Additional context data")

    # Timing
    scheduled_at = models.DateTimeField(help_text="When the action was scheduled")
    executed_at = models.DateTimeField(
        auto_now_add=True, help_text="When the action was executed"
    )

    class Meta:
        verbose_name = "Automated Cycle Log"
        verbose_name_plural = "Automated Cycle Logs"
        db_table = "automated_cycle_logs"
        ordering = ("-executed_at",)
        indexes = [
            models.Index(fields=["automated_cycle", "-executed_at"]),
            models.Index(fields=["action", "status"]),
        ]
