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
import { useEffect } from "react";
import { observer } from "mobx-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@plane/propel/button";
import { renderFormattedDate } from "@plane/utils";
// hooks
import { useMember } from "@/hooks/store/use-member";
// plane web components
import { WorklogDownloadStatus } from "@/components/worklogs";
// plane web constants
import { EWorklogDownloadLoader } from "@/constants/workspace-worklog";
// plane web hooks
import { useWorklogDownload, useWorkspaceWorklogDownloads } from "@/plane-web/hooks/store";

type TWorkspaceWorklogDownloadItem = {
  workspaceSlug: string;
  worklogDownloadId: string;
};

export const WorkspaceWorklogDownloadItem = observer(function WorkspaceWorklogDownloadItem(
  props: TWorkspaceWorklogDownloadItem
) {
  const { workspaceSlug, worklogDownloadId } = props;
  // hooks
  const { loader, getWorkspaceWorklogDownloads } = useWorkspaceWorklogDownloads();
  const { asJson: worklogDownload } = useWorklogDownload(worklogDownloadId);
  const {
    workspace: { getWorkspaceMemberDetails },
  } = useMember();

  // derived values
  const filtersCount = Object.values(worklogDownload.filters || {}).reduce((acc, curr) => acc + curr.length, 0);

  const createdByName =
    (worklogDownload.created_by &&
      (getWorkspaceMemberDetails(worklogDownload.created_by)?.member?.display_name ||
        getWorkspaceMemberDetails(worklogDownload.created_by)?.member?.first_name)) ||
    "";

  const createdFilterDates = worklogDownload.filters?.created_at || [];
  const title =
    createdFilterDates.length > 0 ? (
      <div className="truncate text-14 flex items-center gap-2">
        <div>{renderFormattedDate(createdFilterDates[0].split(";")[0])}</div>
        <ArrowRight size={10} />
        <div>{renderFormattedDate(createdFilterDates[1].split(";")[0])}</div>
      </div>
    ) : (
      worklogDownload?.name || `Export to ${worklogDownload.provider}`
    );

  useEffect(() => {
    const interval = setInterval(() => {
      if (["processing", "queued"].includes(worklogDownload?.status ?? "")) {
        getWorkspaceWorklogDownloads(workspaceSlug, EWorklogDownloadLoader.MUTATION_LOADER);
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [workspaceSlug, worklogDownload?.status]);

  if (!worklogDownload) return <></>;

  return (
    <div className="flex justify-between items-center gap-2 p-3">
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2">
          <div className="text-14 font-medium">{title}</div>
          <div className="inline-block rounded-sm bg-layer-1 p-1 px-2 text-11">{filtersCount} filters</div>
        </div>
        <div className="flex items-center text-11 text-tertiary whitespace-nowrap">
          <div className="pr-2">{renderFormattedDate(worklogDownload.created_at)}</div>|
          <div className="pl-2">Exported by {createdByName}</div>
        </div>
      </div>
      {worklogDownload.status === "completed" ? (
        <a target="_blank" href={worklogDownload?.url} rel="noopener noreferrer">
          <Button variant="secondary">Download</Button>
        </a>
      ) : (
        <WorklogDownloadStatus
          status={worklogDownload.status}
          loader={loader === EWorklogDownloadLoader.MUTATION_LOADER}
        />
      )}
    </div>
  );
});
