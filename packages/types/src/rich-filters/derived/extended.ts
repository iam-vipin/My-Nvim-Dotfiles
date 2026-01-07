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
import type {
  TBooleanFilterFieldConfig,
  TDateFilterFieldConfig,
  TDateRangeFilterFieldConfig,
  TWithValueFilterFieldConfig,
  TMultiSelectFilterFieldConfig,
  TNumberFilterFieldConfig,
  TNumberRangeFilterFieldConfig,
  TSingleSelectFilterFieldConfig,
  TTextFilterFieldConfig,
} from "../field-types";
import type { TExtendedOperatorSpecificConfigs, TOperatorSpecificConfigs } from "../operator-configs";
import type { TCoreSupportedDateFilterOperators, TCoreSupportedSelectFilterOperators } from "./core";
import type { TFilterOperatorHelper } from "./shared";

// -------- DATE FILTER OPERATORS --------

/**
 * Union type representing all extended operators that support single date filter types.
 */
export type TExtendedSupportedSingleDateFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TExtendedOperatorSpecificConfigs]: TFilterOperatorHelper<
    TExtendedOperatorSpecificConfigs,
    K,
    TDateFilterFieldConfig<V>
  >;
}[keyof TExtendedOperatorSpecificConfigs];

/**
 * Union type representing all extended operators that support range date filter types.
 */
export type TExtendedSupportedRangeDateFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TExtendedOperatorSpecificConfigs]: TFilterOperatorHelper<
    TExtendedOperatorSpecificConfigs,
    K,
    TDateRangeFilterFieldConfig<V>
  >;
}[keyof TExtendedOperatorSpecificConfigs];

/**
 * Union type representing all extended operators that support date filter types.
 */
export type TExtendedSupportedDateFilterOperators<V extends TFilterValue = TFilterValue> =
  | TExtendedSupportedSingleDateFilterOperators<V>
  | TExtendedSupportedRangeDateFilterOperators<V>;

export type TExtendedAllAvailableDateFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | `-${TCoreSupportedDateFilterOperators<V>}`
  | TExtendedSupportedDateFilterOperators<V>
  | `-${TExtendedSupportedDateFilterOperators<V>}`;

// -------- SELECT FILTER OPERATORS --------

/**
 * Union type representing all extended operators that support single select filter types.
 */
export type TExtendedSupportedSingleSelectFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TExtendedOperatorSpecificConfigs]: TFilterOperatorHelper<
    TExtendedOperatorSpecificConfigs,
    K,
    TSingleSelectFilterFieldConfig<V>
  >;
}[keyof TExtendedOperatorSpecificConfigs];

/**
 * Union type representing all extended operators that support multi select filter types.
 */
export type TExtendedSupportedMultiSelectFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TExtendedOperatorSpecificConfigs]: TFilterOperatorHelper<
    TExtendedOperatorSpecificConfigs,
    K,
    TMultiSelectFilterFieldConfig<V>
  >;
}[keyof TExtendedOperatorSpecificConfigs];

/**
 * Union type representing all extended operators that support select filter types.
 */
export type TExtendedSupportedSelectFilterOperators<V extends TFilterValue = TFilterValue> =
  TExtendedSupportedSingleSelectFilterOperators<V>;

export type TExtendedAllAvailableSelectFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | `-${TCoreSupportedSelectFilterOperators<V>}`
  | TExtendedSupportedSelectFilterOperators<V>;

// -------- BOOLEAN FILTER OPERATORS --------

/**
 * Union type representing all operators that support boolean filter types.
 */
export type TExtendedSupportedBooleanFilterOperators = {
  [K in keyof TOperatorSpecificConfigs]: TFilterOperatorHelper<TOperatorSpecificConfigs, K, TBooleanFilterFieldConfig>;
}[keyof TOperatorSpecificConfigs];

export type TExtendedAllAvailableBooleanFilterOperatorsForDisplay =
  | TExtendedSupportedBooleanFilterOperators
  | `-${TExtendedSupportedBooleanFilterOperators}`;

// -------- NUMBER FILTER OPERATORS --------

/**
 * Union type representing all operators that support number filter types.
 */
export type TExtendedSupportedNumberFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TOperatorSpecificConfigs]: TFilterOperatorHelper<
    TOperatorSpecificConfigs,
    K,
    TNumberFilterFieldConfig<V>
  >;
}[keyof TOperatorSpecificConfigs];

export type TExtendedAllAvailableNumberFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TExtendedSupportedNumberFilterOperators<V>
  | `-${TExtendedSupportedNumberFilterOperators<V>}`;

// -------- NUMBER RANGE FILTER OPERATORS --------

/**
 * Union type representing all operators that support number range filter types.
 */
export type TExtendedSupportedNumberRangeFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TOperatorSpecificConfigs]: TFilterOperatorHelper<
    TOperatorSpecificConfigs,
    K,
    TNumberRangeFilterFieldConfig<V>
  >;
}[keyof TOperatorSpecificConfigs];

export type TExtendedAllAvailableNumberRangeFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TExtendedSupportedNumberRangeFilterOperators<V>
  | `-${TExtendedSupportedNumberRangeFilterOperators<V>}`;

// -------- WITH VALUE OPERATORS --------
/**
 * Union type representing all operators that support with value filter types.
 */
export type TExtendedSupportedWithValueFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TOperatorSpecificConfigs]: TFilterOperatorHelper<
    TOperatorSpecificConfigs,
    K,
    TWithValueFilterFieldConfig<V>
  >;
}[keyof TOperatorSpecificConfigs];

export type TExtendedAllAvailableWithValueFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TExtendedSupportedWithValueFilterOperators<V>
  | `-${TExtendedSupportedWithValueFilterOperators<V>}`;

// -------- TEXT FILTER OPERATORS --------

/**
 * Union type representing all operators that support text filter types.
 */
export type TExtendedSupportedTextFilterOperators<V extends TFilterValue = TFilterValue> = {
  [K in keyof TOperatorSpecificConfigs]: TFilterOperatorHelper<TOperatorSpecificConfigs, K, TTextFilterFieldConfig<V>>;
}[keyof TOperatorSpecificConfigs];

export type TExtendedAllAvailableTextFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TExtendedSupportedTextFilterOperators<V>
  | `-${TExtendedSupportedTextFilterOperators<V>}`;

// -------- COMPOSED SUPPORT TYPES --------

/**
 * All supported boolean filter operators (ee only).
 */
export type TSupportedBooleanFilterOperators = TExtendedSupportedBooleanFilterOperators;

export type TAllAvailableBooleanFilterOperatorsForDisplay = TExtendedAllAvailableBooleanFilterOperatorsForDisplay;

/**
 * All supported number filter operators (ee only).
 */
export type TSupportedNumberFilterOperators<V extends TFilterValue = TFilterValue> =
  TExtendedSupportedNumberFilterOperators<V>;

export type TAllAvailableNumberFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  TExtendedAllAvailableNumberFilterOperatorsForDisplay<V>;

/**
 * All supported number range filter operators (ee only).
 */
export type TSupportedNumberRangeFilterOperators<V extends TFilterValue = TFilterValue> =
  TExtendedSupportedNumberRangeFilterOperators<V>;

export type TAllAvailableNumberRangeFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  TExtendedAllAvailableNumberRangeFilterOperatorsForDisplay<V>;

/**
 * All supported text filter operators (ee only).
 */
export type TSupportedTextFilterOperators<V extends TFilterValue = TFilterValue> =
  TExtendedSupportedTextFilterOperators<V>;

export type TAllAvailableTextFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  TExtendedAllAvailableTextFilterOperatorsForDisplay<V>;

/**
 * All supported filter with value filter operators (ee only).
 */
export type TSupportedWithValueFilterOperators<V extends TFilterValue = TFilterValue> =
  TExtendedSupportedWithValueFilterOperators<V>;

export type TAllAvailableWithValueFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  TExtendedAllAvailableWithValueFilterOperatorsForDisplay<V>;
