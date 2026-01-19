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

import secrets
import string


def generate_short_id(length=6):
    """Generate a short random identifier (lowercase + digits only)"""
    min_length = 4
    if length < min_length:
        raise ValueError(f"Length must be at least {min_length}")
    alphabet = string.ascii_lowercase + string.digits  # a-z, 0-9
    return "".join(secrets.choice(alphabet) for _ in range(length))
