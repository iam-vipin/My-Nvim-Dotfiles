# Python imports
# Django imports
from plane.payment.flags.flag import FeatureFlag
from plane.payment.flags.flag_decorator import check_feature_flag
from plane.app.permissions.project import ProjectMemberPermission
from django.db.models import Q, Count

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.views import BaseAPIView
from plane.db.models import Issue
from plane.utils.issue_search import search_issues


class MilestoneWorkItemsSearchEndpoint(BaseAPIView):
    permission_classes = [ProjectMemberPermission]

    @check_feature_flag(FeatureFlag.MILESTONES)
    def get(self, request, slug, project_id):
        """Return issues in the project that are not linked to any active milestone.

        Optional query params:
        - search: string to filter issues by name/sequence/project identifier
        """
        query = request.query_params.get("search", None)

        issues = (
            Issue.objects.filter(
                workspace__slug=slug,
                project_id=project_id,
                deleted_at__isnull=True,
                archived_at__isnull=True,
                is_draft=False,
            )
            .filter(Q(state__is_triage=False) | Q(state__isnull=True))
            .annotate(
                active_milestones=Count(
                    "issue_milestone",
                    filter=Q(
                        issue_milestone__deleted_at__isnull=True,
                        issue_milestone__project_id=project_id,
                    ),
                    distinct=True,
                )
            )
            .filter(active_milestones=0)
            .select_related("state")
            .accessible_to(self.request.user.id, slug)
            .distinct()
        )

        if query:
            issues = search_issues(query, issues)

        results = issues.values(
            "name",
            "id",
            "start_date",
            "sequence_id",
            "project__name",
            "project__identifier",
            "project_id",
            "workspace__slug",
            "state__name",
            "state__group",
            "state__color",
            "type_id",
        )
        return Response(list(results), status=status.HTTP_200_OK)
