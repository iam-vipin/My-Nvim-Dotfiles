# Third Party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from plane.ee.views.base import BaseAPIView
from plane.ee.models import WorkspaceMemberActivity
from plane.app.permissions import allow_permission, ROLE
from plane.ee.serializers import WorkspaceMemberActivitySerializer
from plane.payment.flags.flag_decorator import check_feature_flag
from plane.payment.flags.flag import FeatureFlag


class WorkspaceMemberActivityEndpoint(BaseAPIView):
    filterset_fields = {"created_at": ["gt", "gte", "lt", "lte"]}

    @check_feature_flag(FeatureFlag.WORKSPACE_MEMBER_ACTIVITY)
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def get(self, request, slug):
        workspace_member_activities = WorkspaceMemberActivity.objects.filter(workspace__slug=slug)

        workspace_member_activities = (
            self.filter_queryset(workspace_member_activities)
            .select_related("actor", "workspace_member")
            .order_by("created_at")
        )

        workspace_member_activities = WorkspaceMemberActivitySerializer(workspace_member_activities, many=True).data

        return Response(workspace_member_activities, status=status.HTTP_200_OK)
