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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
// plane package imports
import type { ICycle, IModule, IProject } from "@plane/types";
import { Spinner } from "@plane/ui";
// hooks
import { useAnalytics } from "@/hooks/store/use-analytics";
// plane web components
import TotalInsights from "../../total-insights";
import CreatedVsResolved from "../created-vs-resolved";
import CustomizedInsights from "../customized-insights";
import WorkItemsInsightTable from "../workitems-insight-table";

type Props = {
  fullScreen: boolean;
  projectDetails: IProject | undefined;
  cycleDetails: ICycle | undefined;
  moduleDetails: IModule | undefined;
  isEpic?: boolean;
};

export const WorkItemsModalMainContent = observer(function WorkItemsModalMainContent(props: Props) {
  const { projectDetails, cycleDetails, moduleDetails, fullScreen, isEpic } = props;
  const { updateSelectedProjects, updateSelectedCycle, updateSelectedModule, updateIsPeekView } = useAnalytics();
  const [isModalConfigured, setIsModalConfigured] = useState(false);

  useEffect(() => {
    updateIsPeekView(true);

    // Handle project selection
    if (projectDetails?.id) {
      updateSelectedProjects([projectDetails.id]);
    }

    // Handle cycle selection
    if (cycleDetails?.id) {
      updateSelectedCycle(cycleDetails.id);
    }

    // Handle module selection
    if (moduleDetails?.id) {
      updateSelectedModule(moduleDetails.id);
    }
    setIsModalConfigured(true);

    // Cleanup fields
    return () => {
      updateSelectedProjects([]);
      updateSelectedCycle("");
      updateSelectedModule("");
      updateIsPeekView(false);
    };
  }, [
    projectDetails?.id,
    cycleDetails?.id,
    moduleDetails?.id,
    updateSelectedProjects,
    updateSelectedCycle,
    updateSelectedModule,
    updateIsPeekView,
  ]);

  if (!isModalConfigured)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-14 overflow-y-auto p-6">
      <TotalInsights analyticsType="work-items" peekView={!fullScreen} />
      <CreatedVsResolved />
      <CustomizedInsights peekView={!fullScreen} isEpic={isEpic} />
      <WorkItemsInsightTable />
    </div>
  );
});
