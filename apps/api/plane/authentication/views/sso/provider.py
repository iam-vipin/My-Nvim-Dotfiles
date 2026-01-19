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

# Python imports
import logging

# Third party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from plane.authentication.models.sso import IdentityProvider
from plane.utils.permissions.workspace import WorkspaceOwnerPermission
from plane.authentication.views.sso.base import BaseAPIView
from plane.authentication.serializers.sso import IdentityProviderCreateSerializer, IdentityProviderSerializer
from plane.payment.flags.flag_decorator import check_feature_flag
from plane.payment.flags.flag import FeatureFlag
from plane.db.models import Workspace


logger = logging.getLogger("plane.authentication")


class IdentityProviderEndpoint(BaseAPIView):
    """
    This endpoint allows workspace admins to configure the SSO provider for a workspace.
    """

    permission_classes = [
        WorkspaceOwnerPermission,
    ]

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def get(self, request, slug):
        # Get the identity provider for the workspace
        identity_provider = IdentityProvider.objects.filter(
            workspace__slug=slug,
        )
        serializer = IdentityProviderSerializer(identity_provider, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def post(self, request, slug):
        # Get the workspace
        workspace = Workspace.objects.get(slug=slug)
        serializer = IdentityProviderCreateSerializer(data=request.data, context={"workspace": workspace})
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(IdentityProviderSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def patch(self, request, slug, pk):
        # Get the workspace
        workspace = Workspace.objects.get(slug=slug)
        identity_provider = IdentityProvider.objects.get(workspace__slug=slug, pk=pk)
        serializer = IdentityProviderCreateSerializer(
            identity_provider, data=request.data, context={"workspace": workspace}, partial=True
        )
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(IdentityProviderSerializer(serializer.instance).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @check_feature_flag(FeatureFlag.CLOUD_SSO)
    def delete(self, request, slug, pk):
        # Get the workspace
        identity_provider = IdentityProvider.objects.get(workspace__slug=slug, pk=pk)
        identity_provider.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
