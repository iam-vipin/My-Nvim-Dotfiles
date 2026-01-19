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

from datetime import datetime, time

import pytz
from rest_framework import serializers

from plane.ee.models import (
    RecurringWorkitemTask,
    RecurringWorkItemTaskActivity,
    RecurringWorkitemTaskLog,
)
from plane.db.models import Project
from plane.app.serializers.base import BaseSerializer
from plane.ee.serializers import WorkitemTemplateSerializer


class RecurringWorkItemTaskLogSerializer(BaseSerializer):
    workitem_sequence_id = serializers.IntegerField(source="workitem.sequence_id", allow_null=True, required=False)

    class Meta:
        model = RecurringWorkitemTaskLog
        fields = "__all__"
        read_only_fields = ["workspace", "project", "created_at", "updated_at"]


class RecurringWorkItemTaskActivitySerializer(BaseSerializer):
    recurring_workitem_task_log = RecurringWorkItemTaskLogSerializer(read_only=True)

    class Meta:
        model = RecurringWorkItemTaskActivity
        fields = "__all__"
        read_only_fields = ["workspace", "project", "created_at", "updated_at"]


class RecurringWorkItemSerializer(BaseSerializer):
    workitem_blueprint = WorkitemTemplateSerializer(read_only=True)

    class Meta:
        model = RecurringWorkitemTask
        fields = [
            "id",
            "workitem_blueprint",
            "start_at",
            "end_at",
            "interval_type",
            "interval_count",
            "next_scheduled_at",
            "last_run_at",
            "enabled",
            "schedule_description",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "workspace",
            "project",
        ]
        read_only_fields = [
            "enabled",
            "periodic_task",
            "project",
            "workspace",
            "schedule_description",
            "next_scheduled_at",
            "last_run_at",
        ]

    def validate(self, data):
        """Validate and process input data"""
        project_id = self._get_project_id()
        if not project_id:
            raise serializers.ValidationError("Project ID is required for timezone conversion")

        if data.get("start_at"):
            data["start_at"] = self._convert_date_to_project_tz(data["start_at"], project_id, start_of_day=True)
        if data.get("end_at"):
            data["end_at"] = self._convert_date_to_project_tz(data["end_at"], project_id, start_of_day=False)

        return data

    def _convert_date_to_project_tz(self, date_value, project_id, start_of_day=True):
        """
        Convert a date to project timezone, then to UTC.

        Args:
            date_value: A date or datetime object
            project_id: The project ID to get timezone from
            start_of_day: If True, use 00:05:00; if False, use 23:59:59

        Returns:
            datetime: The time in project timezone, converted to UTC
        """
        project = Project.objects.get(id=project_id)
        project_timezone = project.timezone

        if not project_timezone:
            raise serializers.ValidationError("Project timezone is not configured")

        # Get just the date portion
        date_only = date_value.date() if hasattr(date_value, "date") else date_value

        # Get project timezone
        tz = pytz.timezone(project_timezone)

        # Create start or end of day in project timezone
        # Use 00:05 instead of 00:00 to avoid batch scheduler boundary issues
        # (batch runs every 6 hours at :00, so :05 avoids edge cases)
        local_time = time(0, 5, 0) if start_of_day else time(23, 59, 59)
        local_datetime = tz.localize(datetime.combine(date_only, local_time))

        # Convert to UTC for storage
        return local_datetime.astimezone(pytz.UTC)

    def _get_project_id(self):
        """Get project ID from context or instance"""
        return self.context.get("project_id") or (self.instance and self.instance.project_id)
