# Python imports
import json

# Django imports
from plane.payment.flags.flag import FeatureFlag
from plane.payment.flags.flag_decorator import check_feature_flag
from plane.app.permissions.project import ProjectMemberPermission
from django.db.models import Subquery, OuterRef, Func, F
from django.utils import timezone

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.views import BaseViewSet, BaseAPIView


from plane.ee.serializers.app.milestone import (
    MilestoneWorkItemSerializer,
    MilestoneWorkItemResponseSerializer,
)
from plane.ee.models import Milestone, MilestoneIssue
from plane.db.models import Issue
from plane.utils.host import base_host
from plane.bgtasks.issue_activities_task import issue_activity
from plane.utils.issue_search import search_issues


class MilestoneWorkItemsEndpoint(BaseAPIView):
    permission_classes = [ProjectMemberPermission]

    @check_feature_flag(FeatureFlag.MILESTONES)
    def get(self, request, slug, project_id, milestone_id):
        # Return updated work items list using serializer
        workitem_ids = MilestoneIssue.objects.filter(
            milestone_id=milestone_id, deleted_at__isnull=True
        ).values_list("issue_id", flat=True)

        # Base queryset with basic filters
        issue_queryset = (
            Issue.issue_and_epics_objects.filter(
                workspace__slug=slug, project_id=project_id, pk__in=workitem_ids
            )
            .select_related("type")
            .prefetch_related("labels", "assignees")
        )
        serializer = MilestoneWorkItemResponseSerializer(issue_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @check_feature_flag(FeatureFlag.MILESTONES)
    def post(self, request, slug, project_id, milestone_id):
        """Update work items in a milestone"""
        # Validate milestone exists and belongs to project
        milestone = Milestone.objects.filter(
            workspace__slug=slug,
            project_id=project_id,
            id=milestone_id,
            deleted_at__isnull=True,
        ).first()

        if not milestone:
            return Response(
                {"error": "Milestone not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Use dedicated work item serializer to handle work items update
        serializer = MilestoneWorkItemSerializer(
            milestone,
            data=request.data,
            context={
                "request": request,
                "project_id": project_id,
            },
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Activity logging for work items
        for work_item_id in getattr(serializer, "work_items_to_add", []):
            issue_activity.delay(
                type="milestone_issue.activity.created",
                requested_data=json.dumps({"milestone_id": str(milestone_id)}),
                actor_id=str(request.user.id),
                issue_id=str(work_item_id),
                project_id=str(project_id),
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                notification=True,
                origin=base_host(request=request, is_app=True),
            )

        for work_item_id in getattr(serializer, "work_items_to_remove", []):
            issue_activity.delay(
                type="milestone_issue.activity.deleted",
                requested_data=json.dumps({"milestone_id": str(milestone_id)}),
                actor_id=str(request.user.id),
                issue_id=str(work_item_id),
                project_id=str(project_id),
                current_instance=json.dumps({"milestone_name": milestone.title}),
                epoch=int(timezone.now().timestamp()),
                notification=True,
                origin=base_host(request=request, is_app=True),
            )

        # Return updated work items list using serializer
        workitem_ids = MilestoneIssue.objects.filter(
            milestone_id=milestone_id, deleted_at__isnull=True
        ).values_list("issue_id", flat=True)

        # Base queryset with basic filters
        issue_queryset = (
            Issue.issue_and_epics_objects.filter(
                workspace__slug=slug, project_id=project_id, pk__in=workitem_ids
            )
            .select_related("type")
            .prefetch_related("labels", "assignees")
        )
        serializer = MilestoneWorkItemResponseSerializer(issue_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
