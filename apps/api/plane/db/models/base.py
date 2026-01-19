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

import uuid

# Django imports
from django.db import models

# Third party imports
from crum import get_current_user

# Module imports
from ..mixins import AuditModel


class BaseModel(AuditModel):
    id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True, primary_key=True)

    class Meta:
        abstract = True

    def save(self, *args, created_by_id=None, disable_auto_set_user=False, **kwargs):
        if not disable_auto_set_user:
            # Check if created_by_id is provided
            if created_by_id:
                self.created_by_id = created_by_id
            else:
                user = get_current_user()

                if user is None or user.is_anonymous:
                    self.created_by = None
                    self.updated_by = None
                else:
                    # Check if the model is being created or updated
                    if self._state.adding:
                        # If creating, set created_by and leave updated_by as None
                        self.created_by = user
                        self.updated_by = None
                    else:
                        # If updating, set updated_by only
                        self.updated_by = user

        super(BaseModel, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.id)
