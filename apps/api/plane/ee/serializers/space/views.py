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
from plane.ee.serializers import BaseSerializer
from plane.db.models import IssueView


class ViewsPublicMetaSerializer(BaseSerializer):
    class Meta:
        model = IssueView
        fields = ["id", "name", "description"]


class ViewsPublicSerializer(BaseSerializer):
    class Meta:
        model = IssueView
        fields = [
            "id",
            "name",
            "filters",
            "logo_props",
            "display_filters",
            "display_properties",
            "created_at",
            "updated_at",
        ]
