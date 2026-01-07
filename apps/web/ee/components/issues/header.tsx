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
import { IssuesHeader as CeIssueHeader } from "@/ce/components/issues/header";
import { WithFeatureFlagHOC } from "../feature-flags";
import { AdvancedIssuesHeader } from "./advanced-header";

export function IssuesHeader() {
  const { workspaceSlug } = useParams();
  return (
    // Add CE component for fallback
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString()} flag="PROJECT_OVERVIEW" fallback={<CeIssueHeader />}>
      <AdvancedIssuesHeader />
    </WithFeatureFlagHOC>
  );
}
