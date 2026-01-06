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
from .customer import urlpatterns as customer_patterns
from .cycle import urlpatterns as cycle_patterns
from .intake import urlpatterns as intake_patterns
from .label import urlpatterns as label_patterns
from .member import urlpatterns as member_patterns
from .module import urlpatterns as module_patterns
from .project import urlpatterns as project_patterns
from .state import urlpatterns as state_patterns
from .user import urlpatterns as user_patterns
from .work_item import urlpatterns as work_item_patterns
from .work_item_type import urlpatterns as work_item_type_patterns
from .invite import urlpatterns as invite_patterns
from .sticky import urlpatterns as sticky_patterns
from .workspace import urlpatterns as workspace_patterns

# ee imports
from plane.ee.urls.api import urlpatterns as ee_api_urls
from .initiative import urlpatterns as initiative_patterns
from .teamspace import urlpatterns as teamspace_patterns

# agents imports
from plane.agents.urls.api import urlpatterns as agents_api_urls

urlpatterns = [
    *asset_patterns,
    *customer_patterns,
    *cycle_patterns,
    *intake_patterns,
    *label_patterns,
    *member_patterns,
    *module_patterns,
    *project_patterns,
    *state_patterns,
    *user_patterns,
    *work_item_patterns,
    *work_item_type_patterns,
    *workspace_patterns,
    # ee url endpoints
    *ee_api_urls,
    *invite_patterns,
    *sticky_patterns,
    *initiative_patterns,
    *teamspace_patterns,
    *agents_api_urls,
]
