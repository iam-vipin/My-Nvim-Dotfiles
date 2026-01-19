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

import os
import requests


def slack_oauth(code):
    SLACK_OAUTH_URL = os.environ.get("SLACK_OAUTH_URL", False)
    SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID", False)
    SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET", False)

    # Oauth Slack
    if SLACK_OAUTH_URL and SLACK_CLIENT_ID and SLACK_CLIENT_SECRET:
        response = requests.get(
            SLACK_OAUTH_URL,
            params={
                "code": code,
                "client_id": SLACK_CLIENT_ID,
                "client_secret": SLACK_CLIENT_SECRET,
            },
        )
        return response.json()
    return {}
