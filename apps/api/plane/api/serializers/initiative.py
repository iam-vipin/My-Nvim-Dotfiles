from plane.app.serializers import BaseSerializer
from plane.ee.models import Initiative, InitiativeLabel
from rest_framework import serializers


class InitiativeSerializer(BaseSerializer):
    class Meta:
        model = Initiative
        fields = "__all__"
        read_only_fields = ["workspace"]


class InitiativeLabelSerializer(BaseSerializer):
    class Meta:
        model = InitiativeLabel
        fields = ["id", "name", "description", "color", "sort_order", "workspace"]
        read_only_fields = [
            "workspace",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def validate_name(self, name):
        initiative_label_id = self.instance.id if self.instance else None
        workspace_id = self.context["workspace_id"]

        initiative_label = InitiativeLabel.objects.filter(name=name, workspace_id=workspace_id, deleted_at__isnull=True)

        if initiative_label_id:
            initiative_label = initiative_label.exclude(id=initiative_label_id)

        if initiative_label.exists():
            raise serializers.ValidationError(detail="INITIATIVE_LABEL_NAME_ALREADY_EXISTS")

        return name

    def create(self, validated_data):
        validated_data["workspace_id"] = self.context["workspace_id"]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["workspace_id"] = self.context["workspace_id"]
        return super().update(instance, validated_data)
