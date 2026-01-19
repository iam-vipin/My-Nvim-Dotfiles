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
import { EQUALITY_OPERATOR } from "@plane/types";
// local imports
import { getIsNullOperatorConfigEntry } from "../entries";
import { getTextConfig } from "../extended";
import type { TCreateFilterConfig } from "../shared";
import { createFilterConfig, createOperatorConfigEntry } from "../shared";
import type { TCustomPropertyFilterParams } from "./shared";

/**
 * Text property filter specific params
 */
type TCreateTextPropertyFilterParams = TCustomPropertyFilterParams<string> & {
  minLength?: number;
  maxLength?: number;
};

/**
 * Get the text property filter config
 * @param params - The filter params
 * @returns The text property filter config
 */
export const getTextPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateTextPropertyFilterParams> =>
  (params: TCreateTextPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(EQUALITY_OPERATOR.EXACT, params, (updatedParams) => getTextConfig(updatedParams)),
        createOperatorConfigEntry(EQUALITY_OPERATOR.CONTAINS, params, (updatedParams) => getTextConfig(updatedParams)),
        getIsNullOperatorConfigEntry(params),
      ]),
    });
