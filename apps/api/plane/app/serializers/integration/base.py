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
from plane.app.serializers import BaseSerializer
from plane.db.models import Integration, WorkspaceIntegration


class IntegrationSerializer(BaseSerializer):
    class Meta:
        model = Integration
        fields = "__all__"
        read_only_fields = ["verified"]


class WorkspaceIntegrationSerializer(BaseSerializer):
    integration_detail = IntegrationSerializer(read_only=True, source="integration")

    class Meta:
        model = WorkspaceIntegration
        fields = "__all__"
