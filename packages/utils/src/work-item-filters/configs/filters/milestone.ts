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
import type { IMilestoneInstance, TFilterProperty, TSupportedOperators } from "@plane/types";
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
 * Milestone filter specific params
 */
export type TCreateMilestoneFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<IMilestoneInstance> & {
    milestones: IMilestoneInstance[];
  };

/**
 * Helper to get the milestone multi select config
 * @param params - The filter params
 * @returns The milestone multi select config
 */
export const getMilestoneMultiSelectConfig = (
  params: TCreateMilestoneFilterParams,
  singleValueOperator: TSupportedOperators
) =>
  getMultiSelectConfig<IMilestoneInstance, string, IMilestoneInstance>(
    {
      items: params.milestones.filter(Boolean).filter((milestone) => milestone.id && milestone.title),
      getId: (milestone) => milestone.id,
      getLabel: (milestone) => milestone.title,
      getValue: (milestone) => milestone.id,
      getIconData: (milestone) => milestone,
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
 * Get the milestone filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the milestone filter config
 */
export const getMilestoneFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateMilestoneFilterParams> =>
  (params: TCreateMilestoneFilterParams) =>
    createFilterConfig<P>({
      id: key,
      label: "Milestone",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getMilestoneMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
        getIsNullOperatorConfigEntry(params),
      ]),
    });
