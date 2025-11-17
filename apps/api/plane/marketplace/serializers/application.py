# third-party imports
from rest_framework import serializers

# local imports
from plane.authentication.models import Application, ApplicationCategory


class ApplicationCategorySerializer(serializers.ModelSerializer):
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationCategory
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "logo_props",
            "is_active",
            "sort_order",
            "applications_count",
        ]

    def get_applications_count(self, obj):
        """
        Sending count of applications that are published
        """
        return obj.applications.filter(published_at__isnull=False).count()


class ApplicationMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "slug",
            "is_featured",
            "name",
            "short_description",
            "metadata",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    attachments = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "description_html",
            "logo_url",
            "company_name",
            "privacy_policy_url",
            "terms_of_service_url",
            "contact_email",
            "support_url",
            "categories",
            "setup_url",
            "configuration_url",
            "video_url",
            "attachments",
            "supported_environments",
            "supported_plans",
            "links",
            "website",
            "is_featured",
            "metadata",
        ]

    def get_attachments(self, obj):
        """
        Sending attachments urls related to the application
        """
        return [attachment.asset_url for attachment in obj.attachments.all()]

    def get_categories(self, obj):
        """
        Sending categories data related to the application
        """
        return [
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "logo_props": category.logo_props,
                "is_active": category.is_active,
                "sort_order": category.sort_order,
            }
            for category in obj.categories.all()
        ]
