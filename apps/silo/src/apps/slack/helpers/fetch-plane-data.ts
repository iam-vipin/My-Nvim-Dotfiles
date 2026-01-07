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

import type { ExIssueLabel, ExState, Client as PlaneClient, PlaneUser } from "@plane/sdk";

export type PlaneProjectAssets = {
  states: ExState[];
  members: PlaneUser[];
  labels: ExIssueLabel[];
};

export const fetchPlaneAssets = async (slug: string, projectId: string, planeClient: PlaneClient) => {
  const states = await planeClient.state.list(slug, projectId);
  return { states };
};
