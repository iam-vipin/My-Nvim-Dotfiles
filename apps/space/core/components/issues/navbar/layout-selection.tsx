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
import { useRouter, useSearchParams } from "next/navigation";
// ui
import { SITES_ISSUE_LAYOUTS } from "@plane/constants";
// plane i18n
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";
// helpers
import { queryParamGenerator } from "@/helpers/query-param-generator";
// hooks
import { useIssueFilter } from "@/hooks/store/use-issue-filter";
// mobx
import type { TIssueLayout } from "@/types/issue";
import { IssueLayoutIcon } from "./layout-icon";

type Props = {
  anchor: string;
};

export const IssuesLayoutSelection = observer(function IssuesLayoutSelection(props: Props) {
  const { anchor } = props;
  // hooks
  const { t } = useTranslation();
  // router
  const router = useRouter();
  const searchParams = useSearchParams();
  // query params
  const labels = searchParams.get("labels");
  const state = searchParams.get("state");
  const priority = searchParams.get("priority");
  const peekId = searchParams.get("peekId");
  // hooks
  const { layoutOptions, getIssueFilters, updateIssueFilters } = useIssueFilter();
  // derived values
  const issueFilters = getIssueFilters(anchor);
  const activeLayout = issueFilters?.display_filters?.layout || undefined;

  const handleCurrentBoardView = (boardView: TIssueLayout) => {
    if (activeLayout !== boardView) {
      updateIssueFilters(anchor, "display_filters", "layout", boardView);
      const { queryParam } = queryParamGenerator({ board: boardView, peekId, priority, state, labels });
      router.push(`/issues/${anchor}?${queryParam}`);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-md bg-layer-3 p-1">
      {SITES_ISSUE_LAYOUTS.map((layout) => {
        if (!layoutOptions[layout.key]) return;

        return (
          <Tooltip key={layout.key} tooltipContent={t(layout.titleTranslationKey)}>
            <button
              type="button"
              className={cn(
                "group grid h-5.5 w-7 place-items-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover",
                {
                  "bg-layer-transparent-active hover:bg-layer-transparent-active": activeLayout === layout.key,
                }
              )}
              onClick={() => handleCurrentBoardView(layout.key)}
            >
              <IssueLayoutIcon
                layout={layout.key}
                size={14}
                strokeWidth={2}
                className={cn("size-3.5", {
                  "text-primary": activeLayout === layout.key,
                  "text-secondary": activeLayout !== layout.key,
                })}
              />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
});
