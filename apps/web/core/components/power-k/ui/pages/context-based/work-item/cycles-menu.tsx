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
// plane types
import type { ICycle, TIssue } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import { PowerKCyclesMenu } from "@/components/power-k/menus/cycles";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";

type Props = {
  handleSelect: (cycle: ICycle) => void;
  workItemDetails: TIssue;
};

export const PowerKWorkItemCyclesMenu = observer(function PowerKWorkItemCyclesMenu(props: Props) {
  const { handleSelect, workItemDetails } = props;
  // store hooks
  const { getProjectCycleIds, getCycleById } = useCycle();
  // derived values
  const projectCycleIds = workItemDetails.project_id ? getProjectCycleIds(workItemDetails.project_id) : undefined;
  const cyclesList = projectCycleIds ? projectCycleIds.map((cycleId) => getCycleById(cycleId)) : undefined;
  const filteredCyclesList = cyclesList ? cyclesList.filter((cycle) => !!cycle) : undefined;

  if (!filteredCyclesList) return <Spinner />;

  return <PowerKCyclesMenu cycles={filteredCyclesList} onSelect={handleSelect} value={workItemDetails.cycle_id} />;
});
