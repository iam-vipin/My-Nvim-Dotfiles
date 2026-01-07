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
import { ETeamspaceEntityScope } from "@plane/constants";
import type { TTeamspaceActivityKeys, TTeamspaceActivityVerbs, TTeamspaceActivityFields } from "@plane/types";

// Get the label for the entity scope
export const getTeamspaceEntityScopeLabel = (entity: ETeamspaceEntityScope) => {
  switch (entity) {
    case ETeamspaceEntityScope.TEAM:
      return "Team";
    case ETeamspaceEntityScope.PROJECT:
      return "Project";
    default:
      return "Unknown";
  }
};

// Get the key for the issue property type based on the property type and relation type
export const getTeamspaceActivityKey = (
  activityField: TTeamspaceActivityFields | undefined,
  activityVerb: TTeamspaceActivityVerbs
) => `${activityField ? `${activityField}_` : ""}${activityVerb}` as TTeamspaceActivityKeys;
