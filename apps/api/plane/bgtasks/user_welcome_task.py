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

# Django imports
from django.conf import settings

# Third party imports
from celery import shared_task
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# Module imports
from plane.db.models import User


@shared_task
def send_welcome_slack(user_id, created, message):
    try:
        instance = User.objects.get(pk=user_id)

        if created and not instance.is_bot:
            # Send message on slack as well
            if settings.SLACK_BOT_TOKEN:
                client = WebClient(token=settings.SLACK_BOT_TOKEN)
                try:
                    _ = client.chat_postMessage(channel="#trackers", text=message)
                except SlackApiError as e:
                    print(f"Got an error: {e.response['error']}")
        return
    except Exception as e:
        # Print logs if in DEBUG mode
        if settings.DEBUG:
            print(e)
        return
