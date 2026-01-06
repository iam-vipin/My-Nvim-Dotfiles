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

from .base import TeamspaceEndpoint
from .member import TeamspaceMembersEndpoint
from .analytic import (
    TeamspaceEntitiesEndpoint,
    TeamspaceRelationEndpoint,
    TeamspaceStatisticsEndpoint,
    TeamspaceProgressSummaryEndpoint,
    TeamspaceProgressChartEndpoint,
)
from .views import TeamspaceViewEndpoint
from .cycle import TeamspaceCycleEndpoint
from .page.base import (
    TeamspacePageEndpoint,
    TeamspacePageVersionEndpoint,
    TeamspacePagesDescriptionEndpoint,
    TeamspacePageArchiveEndpoint,
    TeamspacePageUnarchiveEndpoint,
    TeamspacePageLockEndpoint,
    TeamspacePageFavoriteEndpoint,
    TeamspacePageDuplicateEndpoint,
    TeamspaceSubPageEndpoint,
    TeamspaceParentPageEndpoint,
    TeamspacePageSummaryEndpoint,
)
from .page.publish import TeamspacePagePublishEndpoint
from .page.share import TeamspacePageUserEndpoint
from .page.comment import (
    TeamspacePageCommentEndpoint,
    TeamspacePageCommentReactionEndpoint,
    TeamspacePageResolveCommentEndpoint,
    TeamspacePageUnresolveCommentEndpoint,
    TeamspacePageRestoreCommentEndpoint,
    TeamspacePageCommentRepliesEndpoint,
)

from .issue import TeamspaceIssueEndpoint, TeamspaceUserPropertiesEndpoint
from .activity import TeamspaceActivityEndpoint
from .comment import TeamspaceCommentEndpoint, TeamspaceCommentReactionEndpoint
from .project import AddTeamspaceProjectEndpoint
