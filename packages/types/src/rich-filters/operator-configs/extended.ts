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
  TDateFilterFieldConfig,
  TTextFilterFieldConfig,
  TNumberFilterFieldConfig,
  TBooleanFilterFieldConfig,
  TNumberRangeFilterFieldConfig,
  TWithValueFilterFieldConfig,
} from "../field-types";
import type { EXTENDED_COMPARISON_OPERATOR, EXTENDED_EQUALITY_OPERATOR } from "../operators";

// ----------------------------- EXACT Operator -----------------------------
export type TExtendedExactOperatorConfigs =
  | TBooleanFilterFieldConfig
  | TNumberFilterFieldConfig<TFilterValue>
  | TTextFilterFieldConfig<TFilterValue>;

// ----------------------------- IS NULL Operator -----------------------------
export type TExtendedIsNullOperatorConfigs = TWithValueFilterFieldConfig<TFilterValue>;

// ----------------------------- IN Operator -----------------------------
export type TExtendedInOperatorConfigs = never;

// ----------------------------- RANGE Operator -----------------------------
export type TExtendedRangeOperatorConfigs = TNumberRangeFilterFieldConfig<TFilterValue>;

// ----------------------------- CONTAINS Operator -----------------------------
export type TExtendedContainsOperatorConfigs = TTextFilterFieldConfig<TFilterValue>;

// ----------------------------- LT Operator -----------------------------
export type TLtOperatorConfigs = TDateFilterFieldConfig<TFilterValue> | TNumberFilterFieldConfig<TFilterValue>;

// ----------------------------- LTE Operator -----------------------------
export type TLteOperatorConfigs = TDateFilterFieldConfig<TFilterValue> | TNumberFilterFieldConfig<TFilterValue>;

// ----------------------------- GT Operator -----------------------------
export type TGtOperatorConfigs = TDateFilterFieldConfig<TFilterValue> | TNumberFilterFieldConfig<TFilterValue>;

// ----------------------------- GTE Operator -----------------------------
export type TGteOperatorConfigs = TDateFilterFieldConfig<TFilterValue> | TNumberFilterFieldConfig<TFilterValue>;

// ----------------------------- Extended Operator Specific Configs -----------------------------
export type TExtendedOperatorSpecificConfigs = {
  [EXTENDED_EQUALITY_OPERATOR.ISNULL]: TExtendedIsNullOperatorConfigs;
  [EXTENDED_EQUALITY_OPERATOR.CONTAINS]: TExtendedContainsOperatorConfigs;
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN]: TLtOperatorConfigs;
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO]: TLteOperatorConfigs;
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN]: TGtOperatorConfigs;
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO]: TGteOperatorConfigs;
};
