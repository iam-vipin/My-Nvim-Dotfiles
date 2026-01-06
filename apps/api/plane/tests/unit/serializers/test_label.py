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

import pytest
from plane.app.serializers import LabelSerializer
from plane.db.models import Project, Label


@pytest.mark.unit
class TestLabelSerializer:
    """Test the LabelSerializer"""

    @pytest.mark.django_db
    def test_label_serializer_create_valid_data(self, db, workspace):
        """Test creating a label with valid data"""
        project = Project.objects.create(name="Test Project", identifier="TEST", workspace=workspace)

        serializer = LabelSerializer(
            data={"name": "Test Label"},
            context={"project_id": project.id},
        )
        assert serializer.is_valid()
        assert serializer.errors == {}
        serializer.save(project_id=project.id)

        label = Label.objects.all().first()
        assert label.name == "Test Label"
        assert label.project == project
        assert label

    @pytest.mark.django_db
    def test_label_serializer_create_duplicate_name(self, db, workspace):
        """Test creating a label with a duplicate name"""
        project = Project.objects.create(name="Test Project", identifier="TEST", workspace=workspace)

        Label.objects.create(name="Test Label", project=project)

        serializer = LabelSerializer(data={"name": "Test Label"}, context={"project_id": project.id})
        assert not serializer.is_valid()
        assert serializer.errors == {"name": ["LABEL_NAME_ALREADY_EXISTS"]}
