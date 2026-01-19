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

# Django Imports
from django.contrib.auth import get_user

# Third-Party Imports
from asgiref.sync import sync_to_async

# Strawberry imports
from strawberry.django.views import AsyncGraphQLView


class CustomGraphQLView(AsyncGraphQLView):
    async def get_context(self, request, response):
        # Get the user
        user = await sync_to_async(get_user)(request)

        # Add the user to the context
        context = await super().get_context(request, response)
        context.user = user
        return context
