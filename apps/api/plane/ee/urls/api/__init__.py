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

from .asset import urlpatterns as asset_patterns
from .epic import urlpatterns as epic_patterns
from .job import urlpatterns as job_patterns
from .page import urlpatterns as page_patterns
from .worklog import urlpatterns as worklog_patterns
from .workspace import urlpatterns as workspace_patterns
from .work_item_property import urlpatterns as work_item_property_patterns

urlpatterns = [
    *asset_patterns,
    *epic_patterns,
    *job_patterns,
    *page_patterns,
    *worklog_patterns,
    *workspace_patterns,
    *work_item_property_patterns,
]
