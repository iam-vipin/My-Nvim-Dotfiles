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

# Module imports
from plane.db.models import EstimatePoint
from .base import BaseSerializer


class EstimatePointSerializer(BaseSerializer):
    """
    Serializer for project estimation points and story point values.

    Handles numeric estimation data for work item sizing and sprint planning,
    providing standardized point values for project velocity calculations.
    """

    class Meta:
        model = EstimatePoint
        fields = ["id", "value"]
        read_only_fields = fields
