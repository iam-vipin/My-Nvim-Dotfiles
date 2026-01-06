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

# Third Party Imports
from asgiref.sync import sync_to_async
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.graphql.types.feature_flag import FeatureFlagsTypesEnum
from plane.graphql.utils.feature_flag import _validate_feature_flag


@sync_to_async
def feature_flagged(
    user_id: str,
    workspace_slug: str,
    feature_key: FeatureFlagsTypesEnum,
    default_value: bool = False,
):
    """
    Check if the feature flag is enabled for the workspace
    """
    try:
        is_feature_flagged = _validate_feature_flag(
            user_id=user_id,
            workspace_slug=workspace_slug,
            feature_key=feature_key,
            default_value=default_value,
        )
        return is_feature_flagged
    except Exception:
        message = f"{feature_key} is not enabled for this workspace"
        error_extensions = {"code": "NOT_FOUND", "statusCode": 404}
        raise GraphQLError(message, extensions=error_extensions)
