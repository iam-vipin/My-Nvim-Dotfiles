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

import { useEffect } from "react";

import { LockIcon } from "@plane/propel/icons";
import { E_FEATURE_FLAGS } from "@plane/constants";
import { EIssuesStoreType, EIssueLayoutTypes } from "@plane/types";
import { LayoutSelection } from "@/components/issues/issue-layouts/filters";
import type { TWorkspaceLayoutProps } from "@/components/views/helper";
import { useIssues } from "@/hooks/store/use-issues";
import { useFlag } from "@/plane-web/hooks/store";
import { WorkspaceGanttRoot } from "../issues/issue-layouts/gantt/root";

export type TLayoutSelectionProps = {
  onChange: (layout: EIssueLayoutTypes) => void;
  selectedLayout: EIssueLayoutTypes;
  workspaceSlug: string;
};

const ALLOWED_LAYOUTS = [EIssueLayoutTypes.SPREADSHEET, EIssueLayoutTypes.GANTT];

/**
 * @description Global view layout selection component
 * @param {TLayoutSelectionProps} props
 * @returns {React.ReactNode}
 */
export function GlobalViewLayoutSelection({ onChange, selectedLayout, workspaceSlug }: TLayoutSelectionProps) {
  const isGanttLayoutEnabled = useFlag(workspaceSlug, E_FEATURE_FLAGS.GLOBAL_VIEWS_TIMELINE);

  const {
    issuesFilter: { updateFilters },
  } = useIssues(EIssuesStoreType.GLOBAL);

  /** To handle layout switch when downgraded and to reset default layout to SPREADSHEET*/
  useEffect(() => {
    const shouldSwitchToSpreadsheet =
      !ALLOWED_LAYOUTS.includes(selectedLayout) ||
      (!isGanttLayoutEnabled && selectedLayout === EIssueLayoutTypes.GANTT);

    if (shouldSwitchToSpreadsheet) {
      onChange(EIssueLayoutTypes.SPREADSHEET);
    }
  }, [isGanttLayoutEnabled, selectedLayout, workspaceSlug, updateFilters, onChange]);

  if (!isGanttLayoutEnabled) return null;

  return <LayoutSelection layouts={ALLOWED_LAYOUTS} onChange={onChange} selectedLayout={selectedLayout} />;
}

export function WorkspaceAdditionalLayouts(props: TWorkspaceLayoutProps) {
  switch (props.activeLayout) {
    case EIssueLayoutTypes.GANTT:
      return <WorkspaceGanttRoot {...props} />;
    default:
      return null;
  }
}

export function AdditionalHeaderItems({ isLocked }: { isLocked: boolean }) {
  if (!isLocked) return null;
  return (
    <div className="h-6 min-w-[76px] flex items-center justify-center gap-1.5 px-2 rounded-sm text-accent-primary bg-accent-primary/20 text-11 font-medium">
      <LockIcon className="size-3.5 flex-shrink-0" /> Locked
    </div>
  );
}
