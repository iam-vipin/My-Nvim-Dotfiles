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

from .attachment import EpicAttachmentMutation
from .base import EpicMutation
from .comment import EpicCommentMutation, EpicCommentReplyMutation
from .comment_reaction import EpicCommentReactionMutation
from .link import EpicLinkMutation
from .page import EpicPageMutation
from .relation import EpicRelationMutation
from .user_property import EpicUserPropertyMutation
from .work_item import EpicWorkItemsMutation
