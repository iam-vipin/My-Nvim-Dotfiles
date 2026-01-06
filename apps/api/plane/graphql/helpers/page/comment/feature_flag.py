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

# Strawberry Imports
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.graphql.types.feature_flag import FeatureFlagsTypesEnum
from plane.graphql.utils.feature_flag import _validate_feature_flag


def is_page_comment_feature_flagged(
    user_id: str,
    workspace_slug: str,
    raise_exception: bool = True,
    default_value: bool = False,
):
    try:
        is_feature_flagged = _validate_feature_flag(
            user_id=user_id,
            workspace_slug=workspace_slug,
            feature_key=FeatureFlagsTypesEnum.PAGE_COMMENTS.value,
            default_value=default_value,
        )

        if not is_feature_flagged:
            if raise_exception:
                message = "Page comments feature flag is not enabled for the workspace"
                error_extensions = {
                    "code": "PAGE_COMMENTS_FEATURE_FLAG_NOT_ENABLED",
                    "statusCode": 400,
                }
                raise GraphQLError(message, extensions=error_extensions)
            return default_value
        return is_feature_flagged
    except Exception:
        if raise_exception:
            message = "Error checking if page comments feature flag is enabled"
            error_extensions = {"code": "SOMETHING_WENT_WRONG", "statusCode": 400}
            raise GraphQLError(message, extensions=error_extensions)
        return default_value


@sync_to_async
def is_page_comment_feature_flagged_async(
    user_id: str,
    workspace_slug: str,
    raise_exception: bool = True,
    default_value: bool = False,
):
    return is_page_comment_feature_flagged(
        user_id=user_id,
        workspace_slug=workspace_slug,
        raise_exception=raise_exception,
        default_value=default_value,
    )
