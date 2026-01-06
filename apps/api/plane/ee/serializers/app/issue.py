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

from plane.db.models import Issue, Page
from plane.ee.serializers import BaseSerializer
from plane.ee.models import WorkItemPage


class IssueLiteSerializer(BaseSerializer):
    class Meta:
        model = Issue
        fields = ["id", "name", "sequence_id"]


class WorkItemPageLiteSerializer(BaseSerializer):
    class Meta:
        model = Page
        fields = [
            "id",
            "name",
            "description_html",
            "created_at",
            "updated_at",
            "created_by",
            "is_global",
            "logo_props",
        ]


class WorkItemPageSerializer(BaseSerializer):
    page = WorkItemPageLiteSerializer(read_only=True)

    class Meta:
        model = WorkItemPage
        fields = [
            "id",
            "page",
            "issue",
            "created_at",
            "updated_at",
            "workspace",
        ]
