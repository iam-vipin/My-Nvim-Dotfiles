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
// types
import { observer } from "mobx-react";
import type { IActiveCycle } from "@plane/types";
// plane web components
import { ActiveCyclesProjectTitle, ActiveCycleHeader } from "@/plane-web/components/active-cycles";
import ActiveCycleDetail from "../cycles/active-cycle/details";
import useCycleDetails from "../cycles/active-cycle/use-cycle-details";

export type ActiveCycleInfoCardProps = {
  cycle: IActiveCycle;
  workspaceSlug: string;
  projectId: string;
};

export const ActiveCycleInfoCard = observer(function ActiveCycleInfoCard(props: ActiveCycleInfoCardProps) {
  const { cycle, workspaceSlug, projectId } = props;
  const cycleDetails = useCycleDetails({ workspaceSlug, projectId, cycleId: cycle.id, defaultCycle: cycle });
  return (
    <div key={cycle.id} className="flex flex-col gap-4 p-4 rounded-xl border border-subtle-1 bg-surface-1">
      <ActiveCyclesProjectTitle project={cycle.project_detail} />
      <ActiveCycleHeader cycle={cycle} workspaceSlug={workspaceSlug} projectId={projectId} />
      <ActiveCycleDetail {...cycleDetails} />
    </div>
  );
});
