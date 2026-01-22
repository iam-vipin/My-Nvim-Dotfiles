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
import { observer } from "mobx-react";
// plane web components
import {
  WorkspaceWorklogFilterRoot,
  WorkspaceWorklogDownloadButton,
  WorkspaceWorklogAppliedFilterRoot,
} from "@/components/worklogs";

type TWorkspaceWorklogHeaderRoot = {
  workspaceSlug: string;
  workspaceId: string;
};

export const WorkspaceWorklogHeaderRoot = observer(function WorkspaceWorklogHeaderRoot(
  props: TWorkspaceWorklogHeaderRoot
) {
  const { workspaceSlug, workspaceId } = props;

  return (
    <div className="pb-4 space-y-4 border-b border-subtle">
      <div className="relative flex justify-between items-center gap-2">
        <WorkspaceWorklogFilterRoot workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
        <WorkspaceWorklogDownloadButton workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
      </div>
      <WorkspaceWorklogAppliedFilterRoot workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
    </div>
  );
});
