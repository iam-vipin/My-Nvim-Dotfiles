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

# Python imports
from datetime import date, datetime

# Third-party imports
import pytz


async def user_timezone_converter(user, input_date=None):
    if user is None or input_date is None:
        return None

    user_timezone = user.user_timezone or None
    if not user_timezone:
        return input_date

    try:
        tz = pytz.timezone(user_timezone)
    except pytz.UnknownTimeZoneError:
        return input_date

    # Ensure input_date is datetime or date
    if isinstance(input_date, datetime):
        converted_date = input_date.astimezone(tz)
    elif isinstance(input_date, date):
        converted_date = datetime.combine(input_date, datetime.min.time()).astimezone(tz)
    else:
        return input_date

    return converted_date
