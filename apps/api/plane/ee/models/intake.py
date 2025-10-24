# Django imports
from django.db import models
from django.db.models import Q

# Module imports
from plane.db.models import ProjectBaseModel
from plane.utils.uuid import get_anchor


class IntakeSetting(ProjectBaseModel):
    intake = models.ForeignKey("db.Intake", on_delete=models.CASCADE, related_name="intake_settings")
    is_in_app_enabled = models.BooleanField(default=True)
    is_email_enabled = models.BooleanField(default=False)
    is_form_enabled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Intake Setting"
        verbose_name_plural = "Intake Settings"
        db_table = "intake_settings"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.intake.name}"


class IntakeForm(ProjectBaseModel):
    intake = models.ForeignKey("db.Intake", on_delete=models.CASCADE, related_name="intake_forms")
    work_item_type = models.ForeignKey("db.IssueType", on_delete=models.CASCADE, related_name="intake_forms")
    name = models.CharField(max_length=255, verbose_name=" Intake Form Name")
    description = models.TextField(blank=True, null=True, verbose_name=" Intake Form Description")
    anchor = models.CharField(max_length=255, default=get_anchor, unique=True, db_index=True)
    is_active = models.BooleanField(default=True, verbose_name=" Intake Form Is Active")

    class Meta:
        verbose_name = "Intake Form"
        verbose_name_plural = "Intake Forms"
        db_table = "intake_forms"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name}"


class IntakeFormField(ProjectBaseModel):
    intake_form = models.ForeignKey("ee.IntakeForm", on_delete=models.CASCADE, related_name="intake_form_fields")
    work_item_property = models.ForeignKey(
        "ee.IssueProperty", on_delete=models.CASCADE, related_name="intake_form_fields"
    )

    class Meta:
        verbose_name = "Intake Form Field"
        verbose_name_plural = "Intake Form Fields"
        db_table = "intake_form_fields"
        ordering = ("-created_at",)
        unique_together = ("intake_form", "work_item_property")
        constraints = [
            models.UniqueConstraint(
                fields=["intake_form", "work_item_property"],
                condition=Q(deleted_at__isnull=True),
                name="intake_form_field_unique_intake_form_work_item_property_when_deleted_at_null",
            )
        ]

    def __str__(self):
        return f"{self.work_item_property.name}"
