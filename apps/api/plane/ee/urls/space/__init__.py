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

from .intake import urlpatterns as intake_patterns
from .page import urlpatterns as page_patterns
from .views import urlpatterns as views_patterns
from plane.payment.urls import space_urlpatterns as payment_space_patterns

urlpatterns = [
    *intake_patterns,
    *page_patterns,
    *views_patterns,
    *payment_space_patterns,
]
