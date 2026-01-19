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

import useSWR from "swr";
// plane web imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import type { TIssueServiceType } from "@plane/types";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useFlag } from "./store/use-flag";
export const useWorkItemProperties = (
  projectId: string | null | undefined,
  workspaceSlug: string | null | undefined,
  workItemId: string | null | undefined,
  issueServiceType: TIssueServiceType
) => {
  // plane hooks
  const {
    pages: { fetchPagesByIssueId },
  } = useIssueDetail(issueServiceType);

  const isPagesInWorkitemWidgetEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.LINK_PAGES);
  useSWR(
    workspaceSlug && projectId && workItemId && isPagesInWorkitemWidgetEnabled
      ? `WORK_ITEM_PAGES_${workspaceSlug}_${projectId}_${workItemId}_${isPagesInWorkitemWidgetEnabled}`
      : null,
    workspaceSlug && projectId && workItemId && isPagesInWorkitemWidgetEnabled
      ? () => fetchPagesByIssueId(workspaceSlug, projectId?.toString() ?? "", workItemId)
      : null,
    { revalidateIfStale: false, revalidateOnFocus: true }
  );
};
