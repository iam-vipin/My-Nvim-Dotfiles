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
import type { ICycle, TCycleGroups, TFilterProperty, TSupportedOperators } from "@plane/types";
import { EQUALITY_OPERATOR, COLLECTION_OPERATOR } from "@plane/types";
// local imports
import type { TCreateFilterConfigParams, IFilterIconConfig, TCreateFilterConfig } from "../../../rich-filters";
import {
  createFilterConfig,
  getMultiSelectConfig,
  createOperatorConfigEntry,
  getIsNullOperatorConfigEntry,
} from "../../../rich-filters";

/**
 * Cycle filter specific params
 */
export type TCreateCycleFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<TCycleGroups> & {
    cycles: ICycle[];
  };

/**
 * Helper to get the cycle multi select config
 * @param params - The filter params
 * @returns The cycle multi select config
 */
export const getCycleMultiSelectConfig = (params: TCreateCycleFilterParams, singleValueOperator: TSupportedOperators) =>
  getMultiSelectConfig<ICycle, string, TCycleGroups>(
    {
      items: params.cycles,
      getId: (cycle) => cycle.id,
      getLabel: (cycle) => cycle.name,
      getValue: (cycle) => cycle.id,
      getIconData: (cycle) => cycle.status || "draft",
    },
    {
      singleValueOperator,
      ...params,
    },
    {
      ...params,
    }
  );

/**
 * Get the cycle filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the cycle filter config
 */
export const getCycleFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateCycleFilterParams> =>
  (params: TCreateCycleFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Cycle",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getCycleMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
        getIsNullOperatorConfigEntry(params),
      ]),
    });
