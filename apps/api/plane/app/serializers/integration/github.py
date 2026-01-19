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

# Module imports
from plane.app.serializers import BaseSerializer
from plane.db.models import (
    GithubIssueSync,
    GithubRepository,
    GithubRepositorySync,
    GithubCommentSync,
)


class GithubRepositorySerializer(BaseSerializer):
    class Meta:
        model = GithubRepository
        fields = "__all__"


class GithubRepositorySyncSerializer(BaseSerializer):
    repo_detail = GithubRepositorySerializer(source="repository")

    class Meta:
        model = GithubRepositorySync
        fields = "__all__"


class GithubIssueSyncSerializer(BaseSerializer):
    class Meta:
        model = GithubIssueSync
        fields = "__all__"
        read_only_fields = ["project", "workspace", "repository_sync"]


class GithubCommentSyncSerializer(BaseSerializer):
    class Meta:
        model = GithubCommentSync
        fields = "__all__"
        read_only_fields = ["project", "workspace", "repository_sync", "issue_sync"]
