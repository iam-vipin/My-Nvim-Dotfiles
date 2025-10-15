from collections import defaultdict
from typing import Any, Dict

from django.db.models import QuerySet

from plane.utils.exporters.schemas.base import BooleanField, JSONField, ListField, StringField
from plane.utils.exporters.schemas.issue import IssueExportSchema


def get_issue_custom_properties_dict(issues_queryset: QuerySet) -> Dict[str, Dict[str, Any]]:
    """Get custom properties dictionary for the given issues queryset.

    Args:
        issues_queryset: Queryset of Issue objects

    Returns:
        Dictionary mapping issue IDs to their custom properties dict
    """
    from plane.ee.models.issue_properties import IssuePropertyValue, PropertyTypeEnum

    # Pre-fetch all property values for all issues in the queryset
    property_values = IssuePropertyValue.objects.filter(
        issue_id__in=issues_queryset.values_list("id", flat=True),
        property__issue_type_id__in=issues_queryset.values_list("type_id", flat=True)
    ).select_related("property", "value_option")

    # Build nested dictionary: issue_id -> {property_display_name -> value}
    custom_properties_dict = defaultdict(dict)

    for prop_value in property_values:
        # Only include properties that match the issue's type
        if prop_value.property.issue_type_id != prop_value.issue.type_id:
            continue

        property_type = prop_value.property.property_type

        # Extract the appropriate value based on property type
        match property_type:
            case PropertyTypeEnum.TEXT | PropertyTypeEnum.URL | PropertyTypeEnum.EMAIL:
                value = prop_value.value_text
            case PropertyTypeEnum.BOOLEAN:
                value = prop_value.value_boolean
            case PropertyTypeEnum.DECIMAL:
                value = prop_value.value_decimal
            case PropertyTypeEnum.DATETIME:
                value = prop_value.value_datetime.isoformat() if prop_value.value_datetime else None
            case PropertyTypeEnum.OPTION:
                value = prop_value.value_option.name if prop_value.value_option else None
            case PropertyTypeEnum.RELATION | PropertyTypeEnum.FILE:
                value = str(prop_value.value_uuid) if prop_value.value_uuid else None
            case _:
                value = None

        custom_properties_dict[prop_value.issue_id][prop_value.property.display_name] = value

    return custom_properties_dict


class ExtendedIssueExportSchema(IssueExportSchema):
    """Extended issue export schema with custom properties and type information."""

    type_name = StringField(source="type.name", label="Type")
    custom_properties = JSONField(label="Custom Properties")
    is_epic = BooleanField(label="Is Epic")
    epic = StringField(label="Epic")
    customers = ListField(label="Customers")
    time_log = StringField(label="Time Log")
    initiatives = ListField(label="Initiatives")

    def prepare_epic(self, i):
        if not i.parent:
            return ""
        if i.parent.type.is_epic:
            return f"{i.parent.project.identifier}-{i.parent.sequence_id}"
        return ""

    def prepare_custom_properties(self, i):
        # Get pre-fetched custom properties from context
        return (self.context.get("custom_properties_dict") or {}).get(i.id, {})

    def prepare_is_epic(self, i):
        return i.type.is_epic if i.type else False

    def prepare_customers(self, i):
        return [f"{c.customer.name}" for c in i.customer_request_issues.all()]

    def prepare_time_log(self, i):
        total_duration = sum(w.duration for w in i.worklogs.all())
        hours = total_duration // 60
        minutes = total_duration % 60
        return f"{hours}h {minutes}m"

    def prepare_initiatives(self, i):
        # initiatives only for epics
        if not (i.type and i.type.is_epic):
            return []
        return [f"{ie.initiative.name}" for ie in i.initiative_epics.all()]

    def prepare_parent(self, i):
        if not i.parent:
            return ""
        if not i.parent.type.is_epic:
            return f"{i.parent.project.identifier}-{i.parent.sequence_id}"
        return ""

    @classmethod
    def get_context_data(cls, queryset: QuerySet) -> Dict[str, Any]:
        """Override to add custom properties to context."""
        # Get parent context data (attachments)
        context = super().get_context_data(queryset)

        # Add custom properties
        context["custom_properties_dict"] = get_issue_custom_properties_dict(queryset)

        return context
