# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

# Rest framework imports
from rest_framework import serializers

# Module imports
from plane.ee.models import Template, TemplateCategory


class TemplateCategorySerializer(serializers.ModelSerializer):
    templates_count = serializers.SerializerMethodField()

    class Meta:
        model = TemplateCategory
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "logo_props",
            "is_active",
            "sort_order",
            "templates_count",
        ]

    def get_templates_count(self, obj):
        """
        Sending count of templates that are published
        """
        return obj.templates.filter(is_published=True).count()


class TemplateMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = [
            "id",
            "short_id",
            "name",
            "slug",
            "short_description",
            "is_featured",
            "metadata",
        ]


class TemplateSerializer(serializers.ModelSerializer):
    attachments = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = [
            "id",
            "short_id",
            "slug",
            "name",
            "short_description",
            "company_name",
            "template_type",
            "categories",
            "website",
            "cover_image_url",
            "attachments",
            "is_published",
            "is_verified",
            "is_featured",
            "metadata",
        ]

    def get_attachments(self, obj):
        """
        Sending attachments urls related to the template
        """
        return [attachment.asset_url for attachment in obj.attachments.all()]

    def get_categories(self, obj):
        """
        Sending categories data related to the template
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

    def get_cover_image_url(self, obj):
        if obj.cover_image_asset:
            return obj.cover_image_asset.asset_url
        return None


class TemplateDetailSerializer(TemplateSerializer):
    class Meta(TemplateSerializer.Meta):
        fields = TemplateSerializer.Meta.fields + [
            "created_at",
            "updated_at",
            "description_stripped",
            "description_html",
            "supported_languages",
            "privacy_policy_url",
            "terms_of_service_url",
            "contact_email",
            "support_url",
        ]
