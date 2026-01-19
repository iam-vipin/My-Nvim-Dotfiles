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

# third party
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response

from plane.db.models import DeployBoard, Project

from .base import BaseAPIView
from plane.space.serializer.project import ProjectLiteSerializer


class ProjectMetaDataEndpoint(BaseAPIView):
    permission_classes = [AllowAny]

    def get(self, request, anchor):
        try:
            deploy_board = DeployBoard.objects.get(anchor=anchor, entity_name="project")
        except DeployBoard.DoesNotExist:
            return Response({"error": "Project is not published"}, status=status.HTTP_404_NOT_FOUND)

        try:
            project_id = deploy_board.entity_identifier
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project is not published"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectLiteSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)
