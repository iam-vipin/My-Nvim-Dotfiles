/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
// plane package imports
import { E_SORT_ORDER, EActivityFilterType, filterActivityOnSelectedFilters } from "@plane/constants";
// hooks
import { useLocalStorage } from "@plane/hooks";
import { useTranslation } from "@plane/i18n";
import type { TIssueActivityComment } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
// components
import { ActivitySortRoot } from "@/components/issues/issue-detail/issue-activity";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// plane web
import { SidebarContentWrapper } from "@/plane-web/components/common/layout/sidebar/content-wrapper";
// local components
import { EpicActivityItem } from "./activity/activity-block";

type TEpicDetailActivityRootProps = {
  epicId: string;
};

// TODO: replace with @plane/constants import later
const BASE_ACTIVITY_FILTER_TYPES = [
  EActivityFilterType.ACTIVITY,
  EActivityFilterType.STATE,
  EActivityFilterType.ASSIGNEE,
  EActivityFilterType.DEFAULT,
];

export const EpicSidebarActivityRoot = observer(function EpicSidebarActivityRoot(props: TEpicDetailActivityRootProps) {
  const { epicId } = props;
  // i18n
  const { t } = useTranslation();
  // states
  const { storedValue: sortOrder, setValue: setSortOrder } = useLocalStorage<E_SORT_ORDER>(
    "epic_activity_sort_order",
    E_SORT_ORDER.ASC
  );
  // store hooks
  const {
    activity: { getActivityAndCommentsByIssueId },
    comment: {},
  } = useIssueDetail(EIssueServiceType.EPICS);

  // handlers
  const toggleSortOrder = () => setSortOrder(sortOrder === E_SORT_ORDER.ASC ? E_SORT_ORDER.DESC : E_SORT_ORDER.ASC);

  // derived values
  const activityComments = getActivityAndCommentsByIssueId(epicId, sortOrder ?? E_SORT_ORDER.ASC);

  const filteredActivityComments = filterActivityOnSelectedFilters(activityComments ?? [], BASE_ACTIVITY_FILTER_TYPES);

  return (
    <SidebarContentWrapper
      title={t("activity")}
      actionElement={<ActivitySortRoot sortOrder={sortOrder ?? E_SORT_ORDER.ASC} toggleSort={toggleSortOrder} />}
    >
      <div className="min-h-[200px]">
        {filteredActivityComments.length > 0 &&
          filteredActivityComments.map((activityComment, index) => {
            const currActivityComment = activityComment;
            return (
              <EpicActivityItem
                key={currActivityComment.id}
                id={currActivityComment.id}
                ends={index === 0 ? "top" : index === filteredActivityComments.length - 1 ? "bottom" : undefined}
              />
            );
          })}
      </div>
    </SidebarContentWrapper>
  );
});
