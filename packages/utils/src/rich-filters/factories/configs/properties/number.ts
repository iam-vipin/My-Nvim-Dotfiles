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
import { COMPARISON_OPERATOR, EQUALITY_OPERATOR } from "@plane/types";
// local imports
import { getIsNullOperatorConfigEntry } from "../entries";
import { getNumberConfig, getNumberRangeConfig } from "../extended";
import type { TCreateFilterConfig } from "../shared";
import { createFilterConfig, createOperatorConfigEntry } from "../shared";
import type { TCustomPropertyFilterParams } from "./shared";

/**
 * Number property filter specific params
 */
export type TCreateNumberPropertyFilterParams = TCustomPropertyFilterParams<number> & {
  min?: number;
  max?: number;
};

/**
 * Get the number property filter config
 * @param params - The filter params
 * @returns The number property filter config
 */
export const getNumberPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateNumberPropertyFilterParams> =>
  (params: TCreateNumberPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(EQUALITY_OPERATOR.EXACT, params, (updatedParams) => getNumberConfig(updatedParams)),
        createOperatorConfigEntry(COMPARISON_OPERATOR.LESS_THAN, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.GREATER_THAN, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.RANGE, params, (updatedParams) =>
          getNumberRangeConfig(updatedParams)
        ),
        getIsNullOperatorConfigEntry(params),
      ]),
    });
