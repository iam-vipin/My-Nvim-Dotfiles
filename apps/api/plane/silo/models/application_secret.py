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

from django.db import models
from django.db.models import Q
from plane.db.models import BaseModel
from plane.utils.encryption import encrypt


class ApplicationSecret(BaseModel):
    key = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    is_secured = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Application Secret"
        verbose_name_plural = "Application Secrets"
        db_table = "application_secrets"
        unique_together = ["key", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["key", "deleted_at"],
                condition=Q(deleted_at__isnull=True),
                name="application_secret_unique_key_when_deleted_at_null",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_secured:
            encrypted_data = encrypt(self.value)
            self.value = f"{encrypted_data['iv']}:{encrypted_data['ciphertext']}:{encrypted_data['tag']}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.key}"
