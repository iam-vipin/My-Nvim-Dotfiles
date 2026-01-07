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
import type { TFilterProperty } from "@plane/types";
import { EQUALITY_OPERATOR, COLLECTION_OPERATOR } from "@plane/types";
// local imports
import type { TCreateFilterConfig, TCreateProjectFilterParams } from "../../../rich-filters";
import { createFilterConfig, createOperatorConfigEntry, getProjectMultiSelectConfig } from "../../../rich-filters";

/**
 * Teamspace Project filter specific params
 */
export type TCreateTeamspaceProjectFilterParams = TCreateProjectFilterParams;

/**
 * Get the teamspace project filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the teamspace project filter config
 */
export const getTeamspaceProjectFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateTeamspaceProjectFilterParams> =>
  (params: TCreateTeamspaceProjectFilterParams) =>
    createFilterConfig<P>({
      id: key,
      label: "Teamspace Projects",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getProjectMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
      ]),
    });
