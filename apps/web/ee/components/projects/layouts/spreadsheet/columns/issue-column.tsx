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

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// helpers
import { cn } from "@plane/utils";
import type { SpreadsheetStoreType } from "@/components/issues/issue-layouts/spreadsheet/base-spreadsheet-root";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useAppRouter } from "@/hooks/use-app-router";
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import type { TProject } from "@/plane-web/types/projects";

type Props = {
  project: TProject;
};

export const SpreadsheetIssueColumn = observer(function SpreadsheetIssueColumn(props: Props) {
  const { project } = props;
  // router
  const router = useAppRouter();
  // hooks
  const { workspaceSlug } = useParams();
  const storeType = useIssueStoreType() as SpreadsheetStoreType;

  const { issueMap } = useIssues(storeType);

  // derived values
  const issueCount = Object.keys(issueMap).length ?? 0;

  const redirectToIssueDetail = () => {
    router.push(`/${workspaceSlug?.toString()}/projects/${project.id}/issues`);
  };
  console.log("issueCount", issueCount);
  return (
    <div
      onClick={issueCount ? redirectToIssueDetail : () => {}}
      className={cn(
        "flex h-11 w-full items-center border-b-[0.5px] border-subtle-1 px-4 py-1 text-11 hover:bg-layer-1 group-[.selected-project-row]:bg-accent-primary/5 group-[.selected-project-row]:hover:bg-accent-primary/10",
        {
          "cursor-pointer": issueCount,
        }
      )}
    >
      {issueCount}
    </div>
  );
});
