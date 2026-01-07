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

import { lazy, Suspense, useMemo } from "react";
import { useFlag } from "@/plane-web/hooks/store";

interface IActiveCycleDetails {
  workspaceSlug: string;
  projectId: string;
  cycleId?: string;
  showHeader?: boolean;
}

export function ActiveCycleRoot(props: IActiveCycleDetails) {
  const { workspaceSlug, projectId, cycleId, showHeader = true } = props;
  const isFeatureEnabled = useFlag(workspaceSlug.toString(), "CYCLE_PROGRESS_CHARTS");
  const ActiveCycle = useMemo(
    function ActiveCycle() {
      return lazy(() =>
        isFeatureEnabled
          ? import(`ee/components/cycles/active-cycle/base`).then((module) => ({
              default: module["ActiveCycleBase"],
            }))
          : import("ce/components/cycles/active-cycle/root").then((module) => ({
              default: module["ActiveCycleRoot"],
            }))
      );
    },
    [isFeatureEnabled]
  );

  return (
    <Suspense fallback={<></>}>
      <ActiveCycle
        workspaceSlug={workspaceSlug.toString()}
        projectId={projectId.toString()}
        cycleId={cycleId}
        showHeader={showHeader}
      />
    </Suspense>
  );
}
