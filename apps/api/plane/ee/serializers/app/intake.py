# Django imports
from django.db import IntegrityError, transaction

# Third party imports
from rest_framework import serializers

# Module imports
from plane.app.serializers.base import BaseSerializer
from plane.ee.models import (
    IntakeSetting,
    IntakeForm,
    IntakeFormField,
    IntakeResponsibility,
    IntakeResponsibilityTypeChoices,
)
from plane.db.models import Project


class IntakeSettingSerializer(BaseSerializer):
    class Meta:
        model = IntakeSetting
        fields = "__all__"
        read_only_fields = [
            "created_at",
            "updated_at",
            "workspace",
            "project",
            "created_by",
        ]


class IntakeResponsibilitySerializer(BaseSerializer):
    class Meta:
        model = IntakeResponsibility
        fields = [
            "id",
            "intake",
            "user",
            "type",
            "project",
        ]
        read_only_fields = [
            "id",
            "intake",
            "project",
        ]

    def create(self, validated_data):
        # Remove the existing responsibility and add the new user
        intake = self.context.get("intake")
        project_id = self.context.get("project_id")
        if not intake or not project_id:
            raise serializers.ValidationError("Intake and project are required")

        # Check if there is an existing intake responsibility for this intake and project
        intake_responsibility = IntakeResponsibility.objects.filter(intake=intake, project_id=project_id).first()

        if intake_responsibility:
            intake_responsibility.user = validated_data.get("user")
            intake_responsibility.type = validated_data.get("type", IntakeResponsibilityTypeChoices.ASSIGNEE)
            intake_responsibility.save()
        else:
            intake_responsibility = IntakeResponsibility.objects.create(
                intake=intake,
                project_id=project_id,
                user=validated_data.get("user"),
                type=validated_data.get("type", IntakeResponsibilityTypeChoices.ASSIGNEE),
            )
        return intake_responsibility


class IntakeFormSerializer(BaseSerializer):
    form_fields = serializers.ListField(child=serializers.UUIDField(), write_only=True)

    class Meta:
        model = IntakeForm
        fields = "__all__"
        read_only_fields = [
            "created_at",
            "updated_at",
            "workspace",
            "project",
            "created_by",
            "intake",
        ]

    def create(self, validated_data):
        form_fields = validated_data.pop("form_fields", None)

        # Get the project id from the context
        project_id = self.context["project_id"]
        project = Project.objects.get(id=project_id)

        with transaction.atomic():
            # Create the intake form
            intake_form = IntakeForm.objects.create(
                **validated_data,
                project=project,
            )

            if form_fields:
                try:
                    intake_form.create_update_form_fields(form_fields, self.context.get("created_by_id"))
                except IntegrityError:
                    raise serializers.ValidationError("Error creating intake form fields")

            return intake_form

    def update(self, instance, validated_data):
        form_fields = validated_data.pop("form_fields", None)

        with transaction.atomic():
            instance = super().update(instance, validated_data)

            if form_fields:
                try:
                    instance.create_update_form_fields(form_fields, self.context.get("updated_by_id"))
                except IntegrityError:
                    raise serializers.ValidationError("Error updating intake form fields")
            return instance


class IntakeFormReadSerializer(IntakeFormSerializer):
    form_fields = serializers.SerializerMethodField()

    class Meta:
        model = IntakeForm
        fields = [
            "id",
            "name",
            "description",
            "anchor",
            "is_active",
            "intake",
            "work_item_type",
            "form_fields",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "project",
            "workspace",
            "intake",
        ]
        read_only_fields = fields

    def get_form_fields(self, obj):
        return [field.work_item_property_id for field in obj.fields]


class IntakeFormFieldSerializer(BaseSerializer):
    class Meta:
        model = IntakeFormField
        fields = "__all__"
        read_only_fields = [
            "created_at",
            "updated_at",
            "workspace",
            "project",
            "created_by",
        ]
