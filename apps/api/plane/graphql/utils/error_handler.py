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

# strawberry imports
from strawberry.exceptions import GraphQLError


class CustomGraphQLError(GraphQLError):
    def __init__(self, message, code=None, field=None):
        super().__init__(message)
        self.code = code
        self.field = field

    def extensions(self):
        return {"code": self.code, "field": self.field}
