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
// local imports
import type { TCreateDateFilterParams, TCreateFilterConfig } from "../shared";
import { createFilterConfig } from "../shared";
import type { TCustomPropertyFilterParams } from "./shared";
import { getSupportedDateOperators } from "./shared";

/**
 * Date property filter specific params
 */
export type TCreateDatePropertyFilterParams = TCustomPropertyFilterParams<Date> & TCreateDateFilterParams;

/**
 * Get the date property filter config
 * @param params - The filter params
 * @returns The date property filter config
 */
export const getDatePropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDatePropertyFilterParams> =>
  (params: TCreateDatePropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });
