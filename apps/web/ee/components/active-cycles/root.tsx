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

import { useParams } from "next/navigation";
// plane web components
import { WorkspaceActiveCyclesList, WorkspaceActiveCyclesUpgrade } from "@/plane-web/components/active-cycles";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";

export function WorkspaceActiveCyclesRoot() {
  // router
  const { workspaceSlug } = useParams();

  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug?.toString()}
      flag="WORKSPACE_ACTIVE_CYCLES"
      fallback={<WorkspaceActiveCyclesUpgrade />}
    >
      <WorkspaceActiveCyclesList />
    </WithFeatureFlagHOC>
  );
}
