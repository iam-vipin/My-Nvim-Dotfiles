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

# Strawberry imports
import strawberry


@strawberry.type
class WorkspaceFeatureType:
    is_project_grouping_enabled: bool
    is_initiative_enabled: bool
    is_teams_enabled: bool
    is_customer_enabled: bool
