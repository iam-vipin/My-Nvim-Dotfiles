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

# Third Party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from plane.app.views.base import BaseViewSet
from plane.app.serializers import ProjectSubscriberSerializer
from plane.app.permissions import ProjectAdminPermission
from plane.db.models import Workspace
from plane.ee.models import ProjectSubscriber


class ProjectSubscriberEndpoint(BaseViewSet):
    serializer_class = ProjectSubscriberSerializer
    model = ProjectSubscriber

    permission_classes = [ProjectAdminPermission]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(project__archived_at__isnull=True)
            .order_by("-created_at")
            .accessible_to(self.request.user.id, self.kwargs["slug"])
            .distinct()
        )

    def list(self, request, slug, project_id):
        subscribers = self.get_queryset()
        serializer = ProjectSubscriberSerializer(subscribers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _get_existing_subscriber_ids(self, workspace, project_id):
        return set(
            ProjectSubscriber.objects.filter(
                workspace=workspace,
                project_id=project_id,
            ).values_list("subscriber_id", flat=True)
        )

    def _remove_subscribers(self, workspace, project_id, subscriber_ids):
        if subscriber_ids:
            ProjectSubscriber.objects.filter(
                workspace=workspace,
                project_id=project_id,
                subscriber_id__in=subscriber_ids,
            ).delete()

    def _add_subscribers(self, workspace, project_id, subscriber_ids):
        if subscriber_ids:
            ProjectSubscriber.objects.bulk_create(
                [
                    ProjectSubscriber(
                        workspace=workspace,
                        project_id=project_id,
                        subscriber_id=subscriber_id,
                    )
                    for subscriber_id in subscriber_ids
                ],
                batch_size=10,
                ignore_conflicts=True,
            )

    def create_or_update(self, request, slug, project_id):
        subscriber_ids = request.data.get("subscriber_ids", [])

        workspace = Workspace.objects.get(slug=slug)
        incoming_ids = set(subscriber_ids)
        existing_ids = self._get_existing_subscriber_ids(workspace, project_id)

        self._remove_subscribers(workspace, project_id, existing_ids - incoming_ids)
        self._add_subscribers(workspace, project_id, incoming_ids - existing_ids)

        subscribers = ProjectSubscriber.objects.filter(
            workspace=workspace,
            project_id=project_id,
        )
        serializer = ProjectSubscriberSerializer(subscribers, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
