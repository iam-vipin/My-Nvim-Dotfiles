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

# Module imports
from .project import ProjectBaseModel


class Importer(ProjectBaseModel):
    service = models.CharField(max_length=50, choices=(("github", "GitHub"), ("jira", "Jira")))
    status = models.CharField(
        max_length=50,
        choices=(
            ("queued", "Queued"),
            ("processing", "Processing"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ),
        default="queued",
    )
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="imports")
    metadata = models.JSONField(default=dict)
    config = models.JSONField(default=dict)
    data = models.JSONField(default=dict)
    token = models.ForeignKey("db.APIToken", on_delete=models.CASCADE, related_name="importer")
    imported_data = models.JSONField(null=True)

    class Meta:
        verbose_name = "Importer"
        verbose_name_plural = "Importers"
        db_table = "importers"
        ordering = ("-created_at",)

    def __str__(self):
        """Return name of the service"""
        return f"{self.service} <{self.project.name}>"
