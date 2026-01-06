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

from .intake import urlpatterns as intake_urls
from .issue import urlpatterns as issue_urls
from .project import urlpatterns as project_urls
from .asset import urlpatterns as asset_urls

from plane.ee.urls.space import urlpatterns as ee_space_urls

urlpatterns = [
    *intake_urls,
    *issue_urls,
    *project_urls,
    *asset_urls,
    # Include EE urls
    *ee_space_urls,
]
