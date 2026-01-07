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

import { sortBy } from "lodash-es";
import type { TTeamspace, TTeamspaceFilters, TTeamspaceOrderByOptions } from "@plane/types";

/**
 * @description filters team based on the filters and display filters
 * @param {TTeamspace} team
 * @param {TTeamFilters} filters
 * @returns {boolean}
 */
export const shouldFilterTeam = (_team: TTeamspace, _filters: TTeamspaceFilters): boolean => true;

export const orderTeams = (teams: TTeamspace[], orderByKey: TTeamspaceOrderByOptions | undefined): TTeamspace[] => {
  let orderedTeams: TTeamspace[] = [];
  if (teams.length === 0) return orderedTeams;

  switch (orderByKey) {
    case "name":
      orderedTeams = sortBy(teams, [(t) => t.name.toLowerCase()]);
      break;
    case "-name":
      orderedTeams = sortBy(teams, [(t) => t.name.toLowerCase()]).reverse();
      break;
    case "created_at":
      orderedTeams = sortBy(teams, [(t) => t.created_at]);
      break;
    case "-created_at":
      orderedTeams = sortBy(teams, [(t) => t.created_at]).reverse();
      break;
    default:
      orderedTeams = teams;
      break;
  }

  return orderedTeams;
};
