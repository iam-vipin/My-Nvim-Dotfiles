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
from .base import BaseModel

# Third party imports
from plane.utils.html_processor import strip_tags


class Sticky(BaseModel):
    name = models.TextField(null=True, blank=True)

    description = models.JSONField(blank=True, default=dict)
    description_html = models.TextField(blank=True, default="<p></p>")
    description_stripped = models.TextField(blank=True, null=True)
    description_binary = models.BinaryField(null=True)

    logo_props = models.JSONField(default=dict)
    color = models.CharField(max_length=255, blank=True, null=True)
    background_color = models.CharField(max_length=255, blank=True, null=True)

    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="stickies")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stickies")
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Sticky"
        verbose_name_plural = "Stickies"
        db_table = "stickies"
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        # Strip the html tags using html parser
        self.description_stripped = (
            None
            if (self.description_html == "" or self.description_html is None)
            else strip_tags(self.description_html)
        )
        if self._state.adding:
            # Get the maximum sequence value from the database
            last_id = Sticky.objects.filter(workspace=self.workspace).aggregate(largest=models.Max("sort_order"))[
                "largest"
            ]
            # if last_id is not None
            if last_id is not None:
                self.sort_order = last_id + 10000

        super(Sticky, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.name)
