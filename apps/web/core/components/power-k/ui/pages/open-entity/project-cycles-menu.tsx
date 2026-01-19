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
import type { ICycle } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import type { TPowerKContext } from "@/components/power-k/core/types";
import { PowerKCyclesMenu } from "@/components/power-k/menus/cycles";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";

type Props = {
  context: TPowerKContext;
  handleSelect: (cycle: ICycle) => void;
};

export const PowerKOpenProjectCyclesMenu = observer(function PowerKOpenProjectCyclesMenu(props: Props) {
  const { context, handleSelect } = props;
  // store hooks
  const { fetchedMap, getProjectCycleIds, getCycleById } = useCycle();
  // derived values
  const projectId = context.params.projectId?.toString();
  const isFetched = projectId ? fetchedMap[projectId] : false;
  const projectCycleIds = projectId ? getProjectCycleIds(projectId) : undefined;
  const cyclesList = projectCycleIds
    ? projectCycleIds.map((cycleId) => getCycleById(cycleId)).filter((cycle) => !!cycle)
    : [];

  if (!isFetched) return <Spinner />;

  return <PowerKCyclesMenu cycles={cyclesList} onSelect={handleSelect} />;
});
