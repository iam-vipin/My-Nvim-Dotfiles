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

"""
Core utilities for Plane database routing and request scoping.
This package contains essential components for managing read replica routing
and request-scoped context in the Plane application.
"""

from .dbrouters import ReadReplicaRouter
from .mixins import ReadReplicaControlMixin
from .request_scope import (
    set_use_read_replica,
    should_use_read_replica,
    clear_read_replica_context,
)

__all__ = [
    "ReadReplicaRouter",
    "ReadReplicaControlMixin",
    "set_use_read_replica",
    "should_use_read_replica",
    "clear_read_replica_context",
]
