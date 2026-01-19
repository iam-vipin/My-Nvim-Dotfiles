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

# Strawberry imports
import strawberry

# Module imports
from .cycle import CycleLiteType
from .issues.base import IssueLiteType
from .module import ModuleLiteType
from .pages import PageLiteType
from .project import ProjectLiteType


@strawberry.type
class GlobalSearchType:
    projects: list[ProjectLiteType]
    issues: list[IssueLiteType]
    modules: list[ModuleLiteType]
    cycles: list[CycleLiteType]
    pages: list[PageLiteType]
    epics: list[IssueLiteType]
