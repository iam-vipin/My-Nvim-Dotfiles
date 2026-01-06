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

from rest_framework.response import Response
from rest_framework import status

from plane.api.views.base import BaseViewSet
from plane.agents.models import AgentRun, AgentRunActivity, AgentRunActivityType, AgentRunActivitySignal
from plane.agents.serializers.app import AgentRunSerializer
from plane.app.permissions import WorkSpaceAdminPermission


class AgentRunViewSet(BaseViewSet):
    serializer_class = AgentRunSerializer
    model = AgentRun
    permission_classes = [WorkSpaceAdminPermission]

    def get_queryset(self):
        return self.filter_queryset(super().get_queryset().filter(workspace__slug=self.kwargs.get("slug")))

    def retrieve(self, request, slug, pk):
        run = self.get_queryset().get(id=pk)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(run, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def stop_run(self, request, slug, pk):
        run = AgentRun.objects.get(id=pk)
        if not run:
            return Response({"error": "Run not found"}, status=status.HTTP_404_NOT_FOUND)
        # create a new activity with the stop signal
        activity = AgentRunActivity.objects.create(
            agent_run=run,
            type=AgentRunActivityType.PROMPT,
            content={"type": "text", "body": "Stopping"},
            signal=AgentRunActivitySignal.STOP,
            actor=request.user,
            workspace=run.workspace,
            project=run.project,
            ephemeral=True,
        )
        return Response(self.get_serializer(activity).data, status=status.HTTP_201_CREATED)
