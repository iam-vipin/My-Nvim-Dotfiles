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

from rest_framework import serializers
from plane.app.serializers.base import BaseSerializer
from plane.db.models import Description
from plane.utils.content_validator import validate_html_content


class DescriptionSerializer(BaseSerializer):
    class Meta:
        model = Description
        fields = [
            "description_html",
            "description_binary",
            "description_stripped",
            "description_json",
        ]
        read_only_fields = [
            "workspace",
            "project",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "deleted_at",
            "description_stripped",
        ]

    def validate_description_html(self, value):
        """Validate the HTML content for description_html using shared validator."""
        if not value:
            return value

        is_valid, error_message, sanitized_html = validate_html_content(value)

        if not is_valid:
            raise serializers.ValidationError(error_message)

        # Return sanitized HTML if available, otherwise return original
        return sanitized_html if sanitized_html is not None else value
