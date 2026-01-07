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
// components
import { GANTT_TIMELINE_TYPE } from "@plane/types";
import { TimeLineTypeContext } from "@/components/gantt-chart/contexts";
// local imports
import { WorkspaceGanttChart } from "./workspace-gantt-chart";

type Props = {
  isLoading?: boolean;
  workspaceSlug: string;
  globalViewId: string;
  fetchNextPages: () => void;
  issuesLoading: boolean;
};

export const WorkspaceGanttRoot = observer(function WorkspaceGanttRoot(props: Props) {
  const { isLoading = false, workspaceSlug, globalViewId, fetchNextPages, issuesLoading } = props;

  return (
    <TimeLineTypeContext.Provider value={GANTT_TIMELINE_TYPE.ISSUE}>
      <WorkspaceGanttChart
        isLoading={isLoading}
        workspaceSlug={workspaceSlug}
        globalViewId={globalViewId}
        fetchNextPages={fetchNextPages}
        issuesLoading={issuesLoading}
      />
    </TimeLineTypeContext.Provider>
  );
});
