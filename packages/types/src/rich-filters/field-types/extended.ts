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

import type { TFilterValue } from "../expression";
import type { TBaseFilterFieldConfig } from "./shared";

/**
 * Extended filter types
 */
export const EXTENDED_FILTER_FIELD_TYPE = {
  BOOLEAN: "boolean",
  TEXT: "text",
  NUMBER: "number",
  NUMBER_RANGE: "number_range",
  WITH_VALUE: "with_value",
} as const;

// -------- BOOLEAN FILTER CONFIGURATIONS --------

/**
 * Boolean filter configuration - for boolean filtering.
 * - defaultValue: Initial boolean value
 */
export type TBooleanFilterFieldConfig = TBaseFilterFieldConfig & {
  type: typeof EXTENDED_FILTER_FIELD_TYPE.BOOLEAN;
  defaultValue?: boolean;
};

// -------- TEXT FILTER CONFIGURATIONS --------

/**
 * Text filter configuration - for text filtering.
 * - defaultValue: Initial text value
 * - minLength: Minimum allowed length
 * - maxLength: Maximum allowed length
 */
export type TTextFilterFieldConfig<V extends TFilterValue> = TBaseFilterFieldConfig & {
  type: typeof EXTENDED_FILTER_FIELD_TYPE.TEXT;
  defaultValue?: V;
  minLength?: number;
  maxLength?: number;
};

// -------- NUMBER FILTER CONFIGURATIONS --------

type TBaseNumberFilterFieldConfig = TBaseFilterFieldConfig & {
  min?: number;
  max?: number;
};

/**
 * Number filter configuration - for number filtering.
 * - defaultValue: Initial number value
 * - min: Minimum allowed number
 * - max: Maximum allowed number
 */
export type TNumberFilterFieldConfig<V extends TFilterValue> = TBaseNumberFilterFieldConfig & {
  type: typeof EXTENDED_FILTER_FIELD_TYPE.NUMBER;
  defaultValue?: V;
};

// -------- NUMBER RANGE FILTER CONFIGURATIONS --------

/**
 * Number range filter configuration - for number range filtering.
 * - defaultValue: Initial number range value
 * - min: Minimum allowed number
 * - max: Maximum allowed number
 */
export type TNumberRangeFilterFieldConfig<V extends TFilterValue> = TBaseNumberFilterFieldConfig & {
  type: typeof EXTENDED_FILTER_FIELD_TYPE.NUMBER_RANGE;
  defaultValue?: V[];
};

// -------- FILTER WITH VALUE CONFIGURATIONS --------

/**
 * Filter with value configuration - for filtering with a specific value.
 * - value: The value to filter with
 */
export type TWithValueFilterFieldConfig<V extends TFilterValue> = TBaseFilterFieldConfig & {
  type: typeof EXTENDED_FILTER_FIELD_TYPE.WITH_VALUE;
  value: V;
};

// -------- UNION TYPES --------

/**
 * All extended filter configurations
 */
export type TExtendedFilterFieldConfigs<V extends TFilterValue = TFilterValue> =
  | TTextFilterFieldConfig<V>
  | TBooleanFilterFieldConfig
  | TNumberFilterFieldConfig<V>
  | TNumberRangeFilterFieldConfig<V>
  | TWithValueFilterFieldConfig<V>;
