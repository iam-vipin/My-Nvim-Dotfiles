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

# Django imports
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django_celery_beat.models import PeriodicTask
import pytz
from dateutil.relativedelta import relativedelta

# Module imports
from plane.db.models import ProjectBaseModel
from plane.db.mixins import ChangeTrackerMixin


class RecurringWorkitemTask(ChangeTrackerMixin, ProjectBaseModel):
    """
    A configuration that is used to create a recurring workitem.
    Stores user-defined timing and references the template.
    Keeps a one-to-one link to Celery Beat's PeriodicTask.
    """

    # Constants for interval types
    INTERVAL_DAILY = "daily"
    INTERVAL_WEEKLY = "weekly"
    INTERVAL_MONTHLY = "monthly"
    INTERVAL_YEARLY = "yearly"

    INTERVAL_CHOICES = [
        (INTERVAL_DAILY, "Daily"),
        (INTERVAL_WEEKLY, "Weekly"),
        (INTERVAL_MONTHLY, "Monthly"),
        (INTERVAL_YEARLY, "Yearly"),
    ]

    # Fields to track for schedule recalculation and scheduler triggering
    TRACKED_FIELDS = ["start_at", "interval_type", "interval_count", "enabled"]

    workitem_blueprint = models.ForeignKey(
        "ee.WorkitemTemplate",
        on_delete=models.CASCADE,
        related_name="recurring_tasks",
        help_text="Blueprint to duplicate",
    )
    start_at = models.DateTimeField(help_text="First allowed run (UTC)")
    end_at = models.DateTimeField(null=True, blank=True, help_text="Cut-off after which no runs occur (UTC)")
    interval_type = models.CharField(
        max_length=20,
        default=INTERVAL_MONTHLY,
    )
    interval_count = models.PositiveIntegerField(
        default=1,
        help_text="Repeat every X intervals (e.g., 2 = every 2 weeks/months)",
    )
    # Scheduler fields for batch scheduling approach
    next_scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Next scheduled execution time (calendar-accurate)",
    )
    last_run_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last successful execution time",
    )
    interval_seconds = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Simple repeat interval (≥ 60s). Mutually exclusive with cron_expression",  # noqa: E501
    )
    cron_expression = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="5-field standard cron. Mutually exclusive with interval_seconds",
    )
    enabled = models.BooleanField(default=True, help_text="Toggle to pause without deletion")
    periodic_task = models.OneToOneField(
        PeriodicTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recurring_workitem_task",
        help_text="Keeps Beat in sync with this row",
    )

    class Meta:
        db_table = "recurring_workitem_tasks"
        verbose_name = "Recurring Workitem Task"
        verbose_name_plural = "Recurring Workitem Tasks"
        ordering = ("-created_at",)

    def __str__(self):
        return f"<{self.workitem_blueprint.name} {self.start_at}>"

    def clean(self):
        """Validate required fields"""
        # For new tasks (without periodic_task), cron_expression is not required
        # as they use the batch scheduler. Only validate for legacy tasks.
        if self.periodic_task and not self.cron_expression and self.interval_count == 1:
            raise ValidationError("cron_expression is required for legacy tasks")
        if not self.start_at:
            raise ValidationError("start_at is required")
        if self.interval_count < 1:
            raise ValidationError("interval_count must be at least 1")

    def _get_interval_delta(self):
        """
        Get the relativedelta for this task's interval type and count.

        Returns:
            relativedelta: The interval delta, or None if interval_type is invalid.
        """
        if self.interval_type == self.INTERVAL_DAILY:
            return relativedelta(days=self.interval_count)
        elif self.interval_type == self.INTERVAL_WEEKLY:
            return relativedelta(weeks=self.interval_count)
        elif self.interval_type == self.INTERVAL_MONTHLY:
            return relativedelta(months=self.interval_count)
        elif self.interval_type == self.INTERVAL_YEARLY:
            return relativedelta(years=self.interval_count)
        return None

    def _get_project_timezone(self):
        """
        Get the project's timezone as a pytz timezone object.

        Returns:
            pytz.timezone: The project timezone, or UTC if not set/invalid.
        """
        project_tz = getattr(self.project, "timezone", None)
        if project_tz:
            try:
                return pytz.timezone(project_tz)
            except Exception:
                pass
        return pytz.UTC

    def calculate_next_scheduled_at(self, from_date=None, allow_past=False):
        """
        Calculate next execution time using calendar-accurate deltas.

        Uses dateutil.relativedelta to properly handle calendar months and years,
        avoiding drift that would occur with fixed day approximations.

        Calendar math is performed in the project's timezone to correctly handle
        DST transitions (e.g., "every day at 00:05" stays at 00:05 local time).

        Args:
            from_date: The date to calculate from. If None, uses current time.
            allow_past: If True, can return a past time for immediate execution.
                        Use True for new tasks, False for updates.

        Returns:
            datetime: The next scheduled execution time (in UTC), or None if not applicable.
        """
        now = from_date or timezone.now()

        if not self.start_at:
            return None

        delta = self._get_interval_delta()
        if not delta:
            return None

        # Get project timezone for calendar math
        tz = self._get_project_timezone()
        now_local = now.astimezone(tz)

        # Use next_scheduled_at as base if available, otherwise start_at
        base = self.next_scheduled_at or self.start_at
        base_local = base.astimezone(tz)

        # For new tasks (allow_past=True): if base is today or future, use it directly
        if allow_past and base_local.date() >= now_local.date():
            return base_local.astimezone(pytz.UTC)

        # If base is in future, return it
        if base_local > now_local:
            return base_local.astimezone(pytz.UTC)

        # Base is in the past - calculate how many intervals to skip
        diff = relativedelta(now_local, base_local)

        if self.interval_type == self.INTERVAL_DAILY:
            intervals_to_add = ((now_local - base_local).days // self.interval_count) + 1
        elif self.interval_type == self.INTERVAL_WEEKLY:
            intervals_to_add = ((now_local - base_local).days // (7 * self.interval_count)) + 1
        elif self.interval_type == self.INTERVAL_MONTHLY:
            total_months = diff.years * 12 + diff.months
            intervals_to_add = (total_months // self.interval_count) + 1
        elif self.interval_type == self.INTERVAL_YEARLY:
            intervals_to_add = (diff.years // self.interval_count) + 1
        else:
            return None

        # Add calculated intervals to base
        next_run_local = base_local + (delta * intervals_to_add)

        # Handle edge case for monthly/yearly with varying lengths
        if next_run_local <= now_local:
            next_run_local += delta

        # Convert back to UTC for storage
        return next_run_local.astimezone(pytz.UTC)

    def advance_to_next_schedule(self):
        """
        Advance to next execution time after successful run.

        Called by the background task after successfully creating a work item.
        Uses relativedelta for calendar-accurate scheduling.

        Calendar math is performed in the project's timezone to correctly handle
        DST transitions. The next execution is always normalized to 00:05
        in the project timezone, which handles timezone changes gracefully.

        Returns:
            datetime: The new next_scheduled_at value (in UTC), or None if not applicable.
        """
        from datetime import datetime, time

        current = self.next_scheduled_at or self.start_at
        if not current:
            return None

        delta = self._get_interval_delta()
        if not delta:
            return None

        # Get project timezone for calendar math
        tz = self._get_project_timezone()

        # Convert to project timezone and get the date
        # This handles timezone changes: if the project timezone changed,
        # we use the date in the NEW timezone as the base
        current_local = current.astimezone(tz)
        current_date = current_local.date()

        # Add interval to get next date (relativedelta handles calendar math)
        next_date = current_date + delta

        # Create 00:05 in project timezone for the next date
        # Use 00:05 instead of 00:00 to avoid batch scheduler boundary issues
        # (batch runs every 6 hours at :00, so :05 avoids edge cases)
        next_run_local = tz.localize(datetime.combine(next_date, time(0, 5, 0)))

        self.next_scheduled_at = next_run_local.astimezone(pytz.UTC)
        self.last_run_at = timezone.now()
        self.save(update_fields=["next_scheduled_at", "last_run_at", "updated_at"])

        return self.next_scheduled_at

    def save(self, *args, **kwargs):
        """Override save to generate cron expression and manage scheduling"""  # noqa: E501
        # Use _state.adding instead of pk check because UUID pk is set in __init__
        is_new = self._state.adding
        skip_scheduler = kwargs.pop("skip_scheduler", False)

        # Migrate existing legacy tasks (with periodic_task) to new batch scheduler
        # This happens on any update to an existing task
        if not is_new and self.periodic_task_id is not None:
            self._migrate_to_batch_scheduler()

        # Check if schedule fields changed (excluding 'enabled' for this check)
        schedule_fields = {"start_at", "interval_type", "interval_count"}
        schedule_fields_changed = bool(set(self.changed_fields) & schedule_fields)

        # If schedule fields changed, reset next_scheduled_at to recalculate from start_at
        if not is_new and schedule_fields_changed:
            self.next_scheduled_at = None

        # Check if task was just enabled (to handle stale past dates from disabled period)
        was_just_enabled = "enabled" in self.changed_fields and self.enabled

        # Calculate next_scheduled_at if enabled and:
        # 1. next_scheduled_at is not set, OR
        # 2. Task was just enabled (recalculate to avoid immediate execution of stale schedule)
        # allow_past=True for new tasks enables immediate execution if start date is today
        # allow_past=False for updates/re-enables ensures future scheduling
        if self.enabled and (not self.next_scheduled_at or was_just_enabled):
            self.next_scheduled_at = self.calculate_next_scheduled_at(allow_past=is_new)

        self.clean()

        super().save(*args, **kwargs)

        # Trigger scheduler if task is enabled and either:
        # - It's a new task, or
        # - Schedule fields changed, or
        # - Task was just enabled (enabled changed from False to True)
        if not skip_scheduler and self.enabled:
            should_trigger = is_new or schedule_fields_changed or was_just_enabled
            if should_trigger:
                from plane.ee.bgtasks.recurring_work_item_scheduler import schedule_on_create_or_enable
                schedule_on_create_or_enable.delay(str(self.id))

    def _migrate_to_batch_scheduler(self):
        """
        Migrate a legacy task (with PeriodicTask) to the new batch scheduler.

        Called during save() for existing tasks that still have a periodic_task.
        Deletes the PeriodicTask and sets up next_scheduled_at for the batch scheduler.
        """
        # Delete the legacy PeriodicTask
        if self.periodic_task:
            try:
                self.periodic_task.delete()
            except PeriodicTask.DoesNotExist:
                pass
            self.periodic_task = None

        # Calculate next_scheduled_at for batch scheduler if not already set
        # allow_past=True enables immediate execution if start date is today
        if self.enabled and not self.next_scheduled_at:
            self.next_scheduled_at = self.calculate_next_scheduled_at(allow_past=True)

    def delete(self, *args, **kwargs):
        """Override delete to clean up associated PeriodicTask"""
        # If there is an associated periodic task, delete it
        if self.periodic_task_id is not None:
            try:
                self.periodic_task.delete()
            except PeriodicTask.DoesNotExist:
                pass
            self.periodic_task = None

        return super().delete(*args, **kwargs)

    def enable(self):
        """Enable the recurring task"""
        self.enabled = True
        self.save()

    def disable(self):
        """Disable the recurring task"""
        self.enabled = False
        self.save()

    @property
    def schedule_description(self):
        """Get a human-readable description of the schedule"""
        interval_type = self.interval_type
        interval_count = self.interval_count

        # Represent the description in the project's local timezone
        local_dt = None
        try:
            tz = pytz.timezone(self.project.timezone)
            if self.start_at:
                if self.start_at.tzinfo is None:
                    local_dt = pytz.UTC.localize(self.start_at).astimezone(tz)
                else:
                    local_dt = self.start_at.astimezone(tz)
        except Exception:
            local_dt = self.start_at

        # Helper to pluralize interval descriptions
        def pluralize(count, singular, plural):
            return singular if count == 1 else plural

        if interval_type == self.INTERVAL_DAILY:
            if interval_count == 1:
                return "Every day at 00:05"
            return f"Every {interval_count} days at 00:05"
        elif interval_type == self.INTERVAL_WEEKLY:
            day_name = local_dt.strftime('%A') if local_dt else "the scheduled day"
            if interval_count == 1:
                return f"Every week on {day_name} at 00:05"
            return f"Every {interval_count} weeks on {day_name} at 00:05"
        elif interval_type == self.INTERVAL_MONTHLY:
            day_num = local_dt.day if local_dt else "the scheduled day"
            if interval_count == 1:
                return f"Every month on day {day_num} at 00:05"
            return f"Every {interval_count} months on day {day_num} at 00:05"
        elif interval_type == self.INTERVAL_YEARLY:
            date_str = local_dt.strftime('%B %d') if local_dt else "the scheduled date"
            if interval_count == 1:
                return f"Every year on {date_str} at 00:05"
            return f"Every {interval_count} years on {date_str} at 00:05"
        else:
            if self.cron_expression:
                return f"Cron: {self.cron_expression}"
            return "No schedule configured"


class RecurringWorkitemTaskLog(ProjectBaseModel):
    """
    One row per execution; records status, timestamps, and the concrete WorkItem created
    Provides audit trail for recurring workitem creation.
    """

    class TaskStatus(models.TextChoices):
        STARTED = "STARTED", "Started"
        SUCCESS = "SUCCESS", "Success"
        FAILURE = "FAILURE", "Failure"

    recurring_task = models.ForeignKey(
        RecurringWorkitemTask,
        on_delete=models.CASCADE,
        related_name="execution_logs",
        help_text="Parent schedule",
    )
    workitem = models.ForeignKey(
        "db.Issue",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="recurring_task_logs",
        help_text="Concrete item created on success",
    )
    task_id = models.CharField(max_length=255, help_text="Unique per Celery execution")
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.STARTED,
        help_text="State of this execution",
    )
    started_at = models.DateTimeField(auto_now_add=True, help_text="When task began")
    finished_at = models.DateTimeField(null=True, blank=True, help_text="When task completed or failed")
    error_message = models.TextField(null=True, blank=True, help_text="Truncated exception or failure reason")

    class Meta:
        db_table = "recurring_workitem_task_logs"
        verbose_name = "Recurring Workitem Task Log"
        verbose_name_plural = "Recurring Workitem Task Logs"
        ordering = ("-started_at",)

    def __str__(self):
        return f"<{self.recurring_task.workitem_blueprint.name} {self.status} {self.started_at}>"  # noqa: E501

    @property
    def duration(self):
        """Get the duration of the task execution"""
        if self.finished_at and self.started_at:
            return self.finished_at - self.started_at
        return None


class RecurringWorkItemTaskActivity(ProjectBaseModel):
    """
    One row per execution; records status, timestamps, and the concrete WorkItem created
    Provides audit trail for recurring workitem creation.
    """

    recurring_workitem_task = models.ForeignKey(
        RecurringWorkitemTask,
        on_delete=models.CASCADE,
        related_name="recurring_workitem_task_activities",
    )
    recurring_workitem_task_log = models.ForeignKey(
        RecurringWorkitemTaskLog,
        on_delete=models.CASCADE,
        related_name="recurring_workitem_task_activities",
        blank=True,
        null=True,
    )
    verb = models.CharField(max_length=255, verbose_name="Action", default="created")
    field = models.CharField(max_length=255, verbose_name="Field Name", blank=True, null=True)
    property = models.ForeignKey(
        "ee.IssueProperty",
        on_delete=models.CASCADE,
        related_name="recurring_workitem_task_activities",
        blank=True,
        null=True,
    )
    old_value = models.TextField(verbose_name="Old Value", blank=True, null=True)
    new_value = models.TextField(verbose_name="New Value", blank=True, null=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="recurring_workitem_task_activities",
    )
    old_identifier = models.UUIDField(null=True)
    new_identifier = models.UUIDField(null=True)
    epoch = models.FloatField(null=True)

    class Meta:
        verbose_name = "Recurring Workitem Task Activity"
        verbose_name_plural = "Recurring Workitem Task Activities"
        db_table = "recurring_workitem_task_activities"
        ordering = ("-created_at",)

    def __str__(self):
        """Return recurring workitem task log of the activity"""
        return str(self.recurring_workitem_task_log)
