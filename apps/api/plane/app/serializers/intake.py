# Python imports
from collections import defaultdict

# Third party frameworks
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from .issue import IssueIntakeSerializer, LabelLiteSerializer, IssueDetailSerializer
from .project import ProjectLiteSerializer
from .state import StateLiteSerializer
from .user import UserLiteSerializer
from plane.db.models import Intake, IntakeIssue, Issue


def _extract_property_value(property_value):
    property_obj = getattr(property_value, "property", None)
    property_type = getattr(property_obj, "property_type", None)

    if property_type in {"TEXT", "URL", "EMAIL", "FILE"}:
        return property_value.value_text
    if property_type == "DATETIME":
        return property_value.value_datetime.isoformat() if property_value.value_datetime else None
    if property_type == "DECIMAL":
        return property_value.value_decimal
    if property_type == "BOOLEAN":
        return property_value.value_boolean
    if property_type == "OPTION":
        return str(property_value.value_option_id) if property_value.value_option_id else None
    if property_type == "RELATION":
        return str(property_value.value_uuid) if property_value.value_uuid else None

    # Fallback: return the first non-null stored value
    for attr in (
        "value_text",
        "value_option_id",
        "value_uuid",
        "value_decimal",
        "value_boolean",
        "value_datetime",
    ):
        raw_value = getattr(property_value, attr, None)
        if raw_value is None:
            continue
        if attr == "value_datetime":
            return raw_value.isoformat()
        if attr in {"value_option_id", "value_uuid"}:
            return str(raw_value)
        return raw_value

    return None


def serialize_issue_property_values(issue):
    if not issue:
        return []

    property_manager = getattr(issue, "properties", None)
    if property_manager is None:
        return []

    property_values = list(property_manager.all())
    if not property_values:
        return []

    values_map: dict[str, list] = defaultdict(list)
    metadata_map: dict[str, dict] = {}

    for property_value in property_values:
        property_id = getattr(property_value, "property_id", None)
        if property_id is None:
            continue

        property_id_str = str(property_id)
        property_obj = getattr(property_value, "property", None)

        if property_id_str not in metadata_map and property_obj:
            metadata_map[property_id_str] = {
                "is_multi": getattr(property_obj, "is_multi", False),
                "sort_order": getattr(property_obj, "sort_order", 0),
            }

        extracted_value = _extract_property_value(property_value)
        if extracted_value is None:
            continue

        values_map[property_id_str].append(extracted_value)

    if not values_map:
        return []

    serialized = []
    for property_id, values in values_map.items():
        metadata = metadata_map.get(property_id, {})
        is_multi = metadata.get("is_multi", len(values) > 1)
        serialized.append(
            {
                "property_id": property_id,
                "value": values if is_multi or len(values) > 1 else values[0],
            }
        )

    serialized.sort(
        key=lambda item: (
            metadata_map.get(item["property_id"], {}).get("sort_order") is None,
            metadata_map.get(item["property_id"], {}).get("sort_order", 0),
        )
    )

    return serialized


class IntakeSerializer(BaseSerializer):
    project_detail = ProjectLiteSerializer(source="project", read_only=True)
    pending_issue_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Intake
        fields = "__all__"
        read_only_fields = ["project", "workspace"]


class IntakeIssueSerializer(BaseSerializer):
    issue = IssueIntakeSerializer(read_only=True)

    class Meta:
        model = IntakeIssue
        fields = [
            "id",
            "status",
            "duplicate_to",
            "snoozed_till",
            "source",
            "issue",
            "created_by",
        ]
        read_only_fields = ["project", "workspace"]

    def to_representation(self, instance):
        # Pass the annotated fields to the Issue instance if they exist
        if hasattr(instance, "label_ids"):
            instance.issue.label_ids = instance.label_ids

        data = super().to_representation(instance)
        issue_payload = data.get("issue")
        if isinstance(issue_payload, dict):
            issue_payload["additional_information"] = serialize_issue_property_values(getattr(instance, "issue", None))
        return data


class IntakeIssueDetailSerializer(BaseSerializer):
    issue = IssueDetailSerializer(read_only=True)
    duplicate_issue_detail = IssueIntakeSerializer(read_only=True, source="duplicate_to")

    class Meta:
        model = IntakeIssue
        fields = [
            "id",
            "status",
            "duplicate_to",
            "snoozed_till",
            "duplicate_issue_detail",
            "source",
            "issue",
        ]
        read_only_fields = ["project", "workspace"]

    def to_representation(self, instance):
        # Pass the annotated fields to the Issue instance if they exist
        if hasattr(instance, "assignee_ids"):
            instance.issue.assignee_ids = instance.assignee_ids
        if hasattr(instance, "label_ids"):
            instance.issue.label_ids = instance.label_ids

        data = super().to_representation(instance)
        issue_payload = data.get("issue")
        if isinstance(issue_payload, dict):
            issue_payload["additional_information"] = serialize_issue_property_values(getattr(instance, "issue", None))
        return data


class IntakeIssueLiteSerializer(BaseSerializer):
    class Meta:
        model = IntakeIssue
        fields = ["id", "status", "duplicate_to", "snoozed_till", "source"]
        read_only_fields = fields


class IssueStateIntakeSerializer(BaseSerializer):
    state_detail = StateLiteSerializer(read_only=True, source="state")
    project_detail = ProjectLiteSerializer(read_only=True, source="project")
    label_details = LabelLiteSerializer(read_only=True, source="labels", many=True)
    assignee_details = UserLiteSerializer(read_only=True, source="assignees", many=True)
    sub_issues_count = serializers.IntegerField(read_only=True)
    issue_intake = IntakeIssueLiteSerializer(read_only=True, many=True)

    class Meta:
        model = Issue
        fields = "__all__"
