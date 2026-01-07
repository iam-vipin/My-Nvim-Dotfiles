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

import { useCallback, useMemo } from "react";
import { observer } from "mobx-react";
// types
import type { IIssueDisplayProperties, TGroupedIssues } from "@plane/types";
// constants
// components
import { IssueLayoutHOC } from "@/components/issues/issue-layouts/issue-layout-HOC";
// hooks
import { useIssue } from "@/hooks/store/use-issue";
import { List } from "./default";

type Props = {
  anchor: string;
};

export const IssuesListLayoutRoot = observer(function IssuesListLayoutRoot(props: Props) {
  const { anchor } = props;
  // store hooks
  const {
    groupedIssueIds: storeGroupedIssueIds,
    fetchNextPublicIssues,
    getGroupIssueCount,
    getPaginationData,
    getIssueLoader,
  } = useIssue();

  const groupedIssueIds = storeGroupedIssueIds as TGroupedIssues | undefined;
  // auth
  const displayProperties: IIssueDisplayProperties = useMemo(
    () => ({
      key: true,
      state: true,
      labels: true,
      priority: true,
      due_date: true,
    }),
    []
  );

  const loadMoreIssues = useCallback(
    (groupId?: string) => {
      fetchNextPublicIssues(anchor, groupId);
    },
    [anchor, fetchNextPublicIssues]
  );

  return (
    <IssueLayoutHOC getGroupIssueCount={getGroupIssueCount} getIssueLoader={getIssueLoader}>
      <div className="relative size-full">
        <List
          displayProperties={displayProperties}
          groupBy={"state"}
          groupedIssueIds={groupedIssueIds ?? {}}
          loadMoreIssues={loadMoreIssues}
          getGroupIssueCount={getGroupIssueCount}
          getPaginationData={getPaginationData}
          getIssueLoader={getIssueLoader}
          showEmptyGroup
        />
      </div>
    </IssueLayoutHOC>
  );
});
