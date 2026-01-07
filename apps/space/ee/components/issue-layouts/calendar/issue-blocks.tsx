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

import { observer } from "mobx-react";
import type { TPaginationData } from "@plane/types";
// helpers
import { renderFormattedPayloadDate } from "@/plane-web/helpers/date-time.helper";
// hooks
import { useViewIssues } from "@/plane-web/hooks/store";
// types
import type { IIssue } from "@/types/issue";
//
import { CalendarIssueBlockRoot } from "./issue-block-root";

type Props = {
  date: Date;
  getIssueById: (issueId: string) => IIssue | undefined;
  loadMoreIssues: (dateString: string) => void;
  getPaginationData: (groupId: string | undefined) => TPaginationData | undefined;
  getGroupIssueCount: (groupId: string | undefined) => number | undefined;
  issueIdList: string[];
};

export const CalendarIssueBlocks = observer(function CalendarIssueBlocks(props: Props) {
  const { date, getIssueById, issueIdList, loadMoreIssues } = props;
  const formattedDatePayload = renderFormattedPayloadDate(date);

  const { getGroupIssueCount, getPaginationData, getIssueLoader } = useViewIssues();

  if (!formattedDatePayload) return null;

  const dayIssueCount = getGroupIssueCount(formattedDatePayload, undefined, false);
  const nextPageResults = getPaginationData(formattedDatePayload, undefined)?.nextPageResults;
  const isPaginating = !!getIssueLoader(formattedDatePayload);

  const shouldLoadMore =
    nextPageResults === undefined && dayIssueCount !== undefined
      ? issueIdList?.length < dayIssueCount
      : !!nextPageResults;

  return (
    <>
      {issueIdList?.map((issueId) => (
        <div key={issueId} className="relative cursor-pointer p-1 px-2">
          <CalendarIssueBlockRoot getIssueById={getIssueById} issueId={issueId} />
        </div>
      ))}

      {isPaginating && (
        <div className="p-1 px-2">
          <div className="flex h-10 md:h-8 w-full items-center justify-between gap-1.5 rounded-sm md:px-1 px-4 py-1.5 bg-layer-1 animate-pulse" />
        </div>
      )}

      {shouldLoadMore && !isPaginating && (
        <div className="flex items-center px-2.5 py-1">
          <button
            type="button"
            className="w-min whitespace-nowrap rounded-sm text-11 px-1.5 py-1 text-placeholder font-medium  hover:bg-layer-1 hover:text-tertiary"
            onClick={() => loadMoreIssues(formattedDatePayload)}
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
});
