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

from django.urls import path


from plane.ee.views import InboxViewSet


urlpatterns = [
    path(
        "workspaces/<str:slug>/inbox/",
        InboxViewSet.as_view({"patch": "partial_update"}),
        name="inbox",
    ),
    path(
        "workspaces/<str:slug>/inbox/read/",
        InboxViewSet.as_view({"post": "mark_read", "delete": "mark_unread"}),
        name="inbox",
    ),
    path(
        "workspaces/<str:slug>/inbox/archive/",
        InboxViewSet.as_view({"post": "archive", "delete": "unarchive"}),
        name="inbox",
    ),
]
