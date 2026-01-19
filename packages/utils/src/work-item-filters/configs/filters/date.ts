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
import type { TCreateFilterConfig, TCreateDateFilterParams } from "../../../rich-filters";
import { createFilterConfig, getSupportedDateOperators } from "../../../rich-filters";

// ------------ Date filters ------------

/**
 * Get the start date filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the start date filter config
 */
export const getStartDateFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDateFilterParams> =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Start date",
      ...params,
      icon: params.filterIcon,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });

/**
 * Get the target date filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the target date filter config
 */
export const getTargetDateFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDateFilterParams> =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Due date",
      ...params,
      icon: params.filterIcon,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });

/**
 * Get the created at filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the created at filter config
 */
export const getCreatedAtFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDateFilterParams> =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Created at",
      ...params,
      icon: params.filterIcon,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });

/**
 * Get the updated at filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the updated at filter config
 */
export const getUpdatedAtFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDateFilterParams> =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig({
      id: key,
      label: "Updated at",
      ...params,
      icon: params.filterIcon,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });
