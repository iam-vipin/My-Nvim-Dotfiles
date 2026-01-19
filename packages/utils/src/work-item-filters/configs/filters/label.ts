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
import type { IIssueLabel, TFilterProperty, TSupportedOperators } from "@plane/types";
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
 * Label filter specific params
 */
export type TCreateLabelFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<string> & {
    labels: IIssueLabel[];
  };

/**
 * Helper to get the label multi select config
 * @param params - The filter params
 * @returns The label multi select config
 */
export const getLabelMultiSelectConfig = (params: TCreateLabelFilterParams, singleValueOperator: TSupportedOperators) =>
  getMultiSelectConfig<IIssueLabel, string, string>(
    {
      items: params.labels,
      getId: (label) => label.id,
      getLabel: (label) => label.name,
      getValue: (label) => label.id,
      getIconData: (label) => label.color,
    },
    {
      singleValueOperator,
      ...params,
    },
    {
      getOptionIcon: params.getOptionIcon,
    }
  );

/**
 * Get the label filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the label filter config
 */
export const getLabelFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateLabelFilterParams> =>
  (params: TCreateLabelFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Label",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getLabelMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
        getIsNullOperatorConfigEntry(params),
      ]),
    });
