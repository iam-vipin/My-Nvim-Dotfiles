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
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# Django imports
from django.utils import timezone
from django.db.models import Case, CharField, Q, Value, When

# Module imports
from .base import BaseAPIView
from plane.db.models import DeployBoard, Cycle


class ProjectCyclesEndpoint(BaseAPIView):
    permission_classes = [AllowAny]

    def get(self, request, anchor):
        deploy_board = DeployBoard.objects.filter(anchor=anchor).first()
        if not deploy_board:
            return Response({"error": "Invalid anchor"}, status=status.HTTP_404_NOT_FOUND)

        cycles = (
            Cycle.objects.filter(
                workspace__slug=deploy_board.workspace.slug,
                project_id=deploy_board.project_id,
            )
            .annotate(
                status=Case(
                    When(
                        Q(start_date__lte=timezone.now()) & Q(end_date__gte=timezone.now()),
                        then=Value("CURRENT"),
                    ),
                    When(start_date__gt=timezone.now(), then=Value("UPCOMING")),
                    When(end_date__lt=timezone.now(), then=Value("COMPLETED")),
                    When(
                        Q(start_date__isnull=True) & Q(end_date__isnull=True),
                        then=Value("DRAFT"),
                    ),
                    default=Value("DRAFT"),
                    output_field=CharField(),
                )
            )
            .values("id", "name", "status")
        )

        return Response(cycles, status=status.HTTP_200_OK)
