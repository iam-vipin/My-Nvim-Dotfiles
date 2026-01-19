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

# Django imports
from django.urls import path

# Module imports
from plane.ee.views import (
    IntakePublishedIssueEndpoint,
    IntakeMetaPublishedIssueEndpoint,
    IntakeFormSettingsEndpoint,
    IntakeFormCreateWorkItemEndpoint,
)

urlpatterns = [
    path(
        "anchor/<str:anchor>/intake/meta/",
        IntakeMetaPublishedIssueEndpoint.as_view(),
        name="intake-public-meta",
    ),
    path(
        "anchor/<str:anchor>/intake/",
        IntakePublishedIssueEndpoint.as_view(),
        name="intake-public",
    ),
    path(
        "anchor/<str:anchor>/intake/form/settings/",
        IntakeFormSettingsEndpoint.as_view(),
        name="intake-public-form-settings",
    ),
    path(
        "anchor/<str:anchor>/intake/form/",
        IntakeFormCreateWorkItemEndpoint.as_view(),
        name="intake-public-form-create",
    ),
]
