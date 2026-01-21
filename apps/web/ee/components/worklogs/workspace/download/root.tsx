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
import { Fragment, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { ChevronDownIcon } from "@plane/propel/icons";
// helpers
import { cn } from "@plane/utils";
// plane web components
import {
  WorklogDownloadLoader,
  WorkspaceWorklogDownloadList,
  WorkspaceWorklogDownloadRefresh,
} from "@/plane-web/components/worklogs";
// plane web constants
import { EWorklogDownloadLoader, EWorklogDownloadQueryParamType } from "@/constants/workspace-worklog";
// hooks
import { useWorkspaceWorklogDownloads } from "@/plane-web/hooks/store";

type TWorkspaceWorklogDownloadRoot = {
  workspaceSlug: string;
  workspaceId: string;
};

export const WorkspaceWorklogDownloadRoot = observer(function WorkspaceWorklogDownloadRoot(
  props: TWorkspaceWorklogDownloadRoot
) {
  const { workspaceSlug, workspaceId } = props;
  // hooks
  const { loader, paginationInfo, worklogDownloadIdsByWorkspaceId, getWorkspaceWorklogDownloads } =
    useWorkspaceWorklogDownloads();
  // states
  const [disclosureState, setDisclosureState] = useState<boolean>(true);

  // derived values
  const workspaceWorklogDownloadIds = (workspaceId && worklogDownloadIdsByWorkspaceId(workspaceId)) || undefined;
  const worklogDownloadPagination =
    workspaceWorklogDownloadIds || paginationInfo
      ? EWorklogDownloadQueryParamType.CURRENT
      : EWorklogDownloadQueryParamType.INIT;
  const worklogDownloadLoader =
    workspaceWorklogDownloadIds && workspaceWorklogDownloadIds.length > 0
      ? EWorklogDownloadLoader.MUTATION_LOADER
      : EWorklogDownloadLoader.INIT_LOADER;
  const worklogDownloadIds = worklogDownloadIdsByWorkspaceId(workspaceId) || [];

  // fetching workspace worklog downloads
  useSWR(workspaceSlug ? `WORKSPACE_WORKLOG_DOWNLOADS_${workspaceSlug}` : null, () =>
    workspaceSlug
      ? getWorkspaceWorklogDownloads(workspaceSlug.toString(), worklogDownloadLoader, worklogDownloadPagination)
      : null
  );

  if (loader === EWorklogDownloadLoader.INIT_LOADER) return <WorklogDownloadLoader loader={loader} />;

  if (worklogDownloadIds.length <= 0) return <></>;

  return (
    <Fragment>
      <div className="flex justify-between items-center">
        <div
          className="cursor-pointer flex items-center gap-1 group"
          onClick={() => setDisclosureState(!disclosureState)}
        >
          <div className="flex-shrink-0 w-5 h-5 rounded-sm group-hover:bg-layer-1 text-secondary hover:text-primary flex justify-center items-center">
            <ChevronDownIcon
              height={16}
              width={16}
              className={cn("duration-300", { "-rotate-90": !disclosureState })}
            />
          </div>
          <div className="text-16 font-medium w-full py-0.5">Previous Downloads</div>
          {disclosureState && (workspaceWorklogDownloadIds || [])?.length > 0 && (
            <WorkspaceWorklogDownloadRefresh workspaceSlug={workspaceSlug} />
          )}
        </div>
      </div>

      {disclosureState && <WorkspaceWorklogDownloadList workspaceSlug={workspaceSlug} workspaceId={workspaceId} />}
    </Fragment>
  );
});
