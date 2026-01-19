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
class ProjectFeatureType:
    # Project
    module_view: bool
    cycle_view: bool
    issue_views_view: bool
    page_view: bool
    intake_view: bool
    guest_view_all_features: bool
    # Project features
    is_project_updates_enabled: bool
    is_epic_enabled: bool
    is_workflow_enabled: bool
