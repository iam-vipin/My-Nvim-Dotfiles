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

// plane imports
import { EProductSubscriptionTier } from "@plane/constants";
import type { IWorkspace } from "@plane/types";

export const orderWorkspacesList = (workspaces: IWorkspace[]): IWorkspace[] =>
  workspaces.sort((a, b) => {
    // Get subscription tiers with fallback to FREE
    const aTier = EProductSubscriptionTier[a.current_plan ?? "FREE"];
    const bTier = EProductSubscriptionTier[b.current_plan ?? "FREE"];

    // First sort by tier (descending order - highest tier first)
    if (aTier !== bTier) {
      return bTier - aTier;
    }

    // If same tier, sort by trial status (non-trial first)
    if (a.is_on_trial !== b.is_on_trial) {
      return a.is_on_trial ? 1 : -1;
    }

    // If same tier and trial status, sort alphabetically
    return a.name.localeCompare(b.name);
  });
