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

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.ee.models import WorkspaceEntityConnection
from plane.silo.serializers import WorkspaceEntityConnectionAPISerializer
from .base import BaseServiceAPIView


class WorkspaceEntityConnectionAPIView(BaseServiceAPIView):
    def get(self, request, pk=None):
        if not pk:
            connections = WorkspaceEntityConnection.objects.filter(**request.query_params.dict()).select_related(
                "workspace"
            )
            serializer = WorkspaceEntityConnectionAPISerializer(connections, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        connection = WorkspaceEntityConnection.objects.filter(id=pk).select_related("workspace").first()
        serializer = WorkspaceEntityConnectionAPISerializer(connection)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = WorkspaceEntityConnectionAPISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        connection = WorkspaceEntityConnection.objects.get(pk=pk)
        serializer = WorkspaceEntityConnectionAPISerializer(connection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        connection = WorkspaceEntityConnection.objects.filter(pk=pk).first()
        if not connection:
            return Response(status=status.HTTP_204_NO_CONTENT)
        connection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
