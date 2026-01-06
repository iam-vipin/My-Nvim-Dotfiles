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

from enum import Enum


class ImporterType(str, Enum):
    JIRA = "JIRA"
    ASANA = "ASANA"
    LINEAR = "LINEAR"
    JIRA_SERVER = "JIRA_SERVER"
    GITHUB = "GITHUB"
    GITLAB = "GITLAB"
    SLACK = "SLACK"


class IntegrationType(str, Enum):
    GITHUB = "GITHUB"
    GITLAB = "GITLAB"
    SLACK = "SLACK"
