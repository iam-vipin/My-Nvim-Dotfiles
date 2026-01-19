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

from .views import (
    ApplicationBySlugEndpoint,
    ApplicationCategoryEndpoint,
    ApplicationEndpoint,
    ApplicationMetaEndpoint,
    TemplateBySlugEndpoint,
    TemplateCategoryEndpoint,
    TemplateEndpoint,
    TemplateMetaEndpoint,
)

urlpatterns = [
    # application endpoints
    path(
        "application-categories/",
        ApplicationCategoryEndpoint.as_view(),
        name="application-categories",
    ),
    path(
        "published-applications/meta/",
        ApplicationMetaEndpoint.as_view(),
        name="published-applications-meta",
    ),
    path(
        "published-applications/meta/<str:slug>/",
        ApplicationMetaEndpoint.as_view(),
        name="published-application-meta-by-slug",
    ),
    path(
        "published-applications/",
        ApplicationEndpoint.as_view(),
        name="published-applications",
    ),
    path(
        "published-applications/<uuid:pk>/",
        ApplicationEndpoint.as_view(),
        name="published-application-detail-by-pk",
    ),
    path(
        "published-applications/<str:slug>/",
        ApplicationBySlugEndpoint.as_view(),
        name="published-application-detail-by-slug",
    ),
    # template endpoints
    path(
        "template-categories/",
        TemplateCategoryEndpoint.as_view(),
        name="template-categories",
    ),
    path(
        "published-templates/meta/",
        TemplateMetaEndpoint.as_view(),
        name="published-templates-meta",
    ),
    path(
        "published-templates/meta/<str:slug>/",
        TemplateMetaEndpoint.as_view(),
        name="published-template-meta-by-slug",
    ),
    path(
        "published-templates/",
        TemplateEndpoint.as_view(),
        name="published-templates",
    ),
    path(
        "published-templates/<uuid:pk>/",
        TemplateEndpoint.as_view(),
        name="published-template-detail-by-pk",
    ),
    path(
        "published-templates/<str:short_id>/",
        TemplateEndpoint.as_view(),
        name="published-template-detail-by-short-id",
    ),
    path(
        "published-templates/slug/<str:slug>/",
        TemplateBySlugEndpoint.as_view(),
        name="published-template-detail-by-slug",
    ),
]
