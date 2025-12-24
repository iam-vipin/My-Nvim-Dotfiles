# Third party imports
from rest_framework import serializers

# Module imports
from plane.app.serializers import IssueSerializer


class IssueExportSerializer(IssueSerializer):
    """
    Export-optimized serializer that extends IssueSerializer with human-readable fields.

    Converts UUIDs to readable values for CSV/JSON export.
    """

    identifier = serializers.SerializerMethodField()
    project_name = serializers.CharField(source='project.name', read_only=True, default="")
    project_identifier = serializers.CharField(source='project.identifier', read_only=True, default="")
    state_name = serializers.CharField(source='state.name', read_only=True, default="")
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default="")

    assignees = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    labels = serializers.SerializerMethodField()
    cycle_name = serializers.SerializerMethodField()
    cycle_start_date = serializers.SerializerMethodField()
    cycle_end_date = serializers.SerializerMethodField()
    module_name = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    estimate = serializers.SerializerMethodField()
    links = serializers.SerializerMethodField()
    relations = serializers.SerializerMethodField()
    subscribers = serializers.SerializerMethodField()

    class Meta(IssueSerializer.Meta):
        fields = [
            "project_name",
            "project_identifier",
            "parent",
            "identifier",
            "name",
            "state_name",
            "priority",
            "assignees",
            "subscribers",
            "created_by_name",
            "start_date",
            "target_date",
            "completed_at",
            "created_at",
            "updated_at",
            "archived_at",
            "estimate",
            "labels",
            "cycle_name",
            "cycle_start_date",
            "cycle_end_date",
            "module_name",
            "links",
            "relations",
            "comments",
            "sub_issues_count",
            "link_count",
            "attachment_count",
        ]

    def get_identifier(self, obj):
        return f"{obj.project.identifier}-{obj.sequence_id}"

    def get_assignees(self, obj):
        return [u.full_name for u in obj.assignees.all() if u.is_active]

    def get_subscribers(self, obj):
        """Return list of subscriber names."""
        return [sub.subscriber.full_name for sub in obj.issue_subscribers.all() if sub.subscriber]

    def get_parent(self, obj):
        if not obj.parent:
            return ""
        return f"{obj.parent.project.identifier}-{obj.parent.sequence_id}"

    def get_labels(self, obj):
        return [
            il.label.name
            for il in obj.label_issue.all()
            if il.deleted_at is None
        ]

    def get_cycle_name(self, obj):
        """Return the cycle name (one-to-one relationship)."""
        cycle_issue = obj.issue_cycle.first()
        return cycle_issue.cycle.name if cycle_issue and cycle_issue.cycle else ""

    def get_cycle_start_date(self, obj):
        """Return the cycle start date."""
        cycle_issue = obj.issue_cycle.first()
        if cycle_issue and cycle_issue.cycle and cycle_issue.cycle.start_date:
            return cycle_issue.cycle.start_date.strftime("%Y-%m-%d")
        return ""

    def get_cycle_end_date(self, obj):
        """Return the cycle end date."""
        cycle_issue = obj.issue_cycle.first()
        if cycle_issue and cycle_issue.cycle and cycle_issue.cycle.end_date:
            return cycle_issue.cycle.end_date.strftime("%Y-%m-%d")
        return ""

    def get_module_name(self, obj):
        """Return the module name (one-to-one relationship)."""
        module_issue = obj.issue_module.first()
        return module_issue.module.name if module_issue and module_issue.module else ""

    def get_estimate(self, obj):
        """Return estimate point value."""
        if obj.estimate_point:
            return obj.estimate_point.value if hasattr(obj.estimate_point, 'value') else str(obj.estimate_point)
        return ""

    def get_links(self, obj):
        """Return list of issue links with titles."""
        return [
            {
                "url": link.url,
                "title": link.title if link.title else link.url,
            }
            for link in obj.issue_link.all()
        ]

    def get_relations(self, obj):
        """
        Return list of related issues (outgoing only).

        For exports, we only capture relations once from the source issue.
        This avoids duplicate entries and reduces to a single prefetch query.
        """
        return [
            {
                "type": rel.relation_type,
                "related_issue": f"{rel.related_issue.project.identifier}-{rel.related_issue.sequence_id}",
            }
            for rel in obj.issue_relation.all()
            if rel.related_issue
        ]

    def get_comments(self, obj):
        """Return list of comments with author and timestamp."""
        return [
            {
                "comment": comment.comment_stripped if hasattr(comment, 'comment_stripped') else comment.comment_html,
                "created_by": comment.actor.full_name if comment.actor else "",
                "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M:%S") if comment.created_at else "",
            }
            for comment in obj.issue_comments.all()
        ]
