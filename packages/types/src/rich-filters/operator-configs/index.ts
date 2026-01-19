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

import type { EQUALITY_OPERATOR, COLLECTION_OPERATOR, COMPARISON_OPERATOR } from "../operators";
import type { TCoreExactOperatorConfigs, TCoreInOperatorConfigs, TCoreRangeOperatorConfigs } from "./core";
import type {
  TExtendedExactOperatorConfigs,
  TExtendedInOperatorConfigs,
  TExtendedOperatorSpecificConfigs,
  TExtendedRangeOperatorConfigs,
} from "./extended";

// ----------------------------- Composed Operator Configs -----------------------------

/**
 * EXACT operator - combines core and extended configurations
 */
export type TExactOperatorConfigs = TCoreExactOperatorConfigs | TExtendedExactOperatorConfigs;

/**
 * IN operator - combines core and extended configurations
 */
export type TInOperatorConfigs = TCoreInOperatorConfigs | TExtendedInOperatorConfigs;

/**
 * RANGE operator - combines core and extended configurations
 */
export type TRangeOperatorConfigs = TCoreRangeOperatorConfigs | TExtendedRangeOperatorConfigs;

// ----------------------------- Final Operator Specific Configs -----------------------------

/**
 * Type-safe mapping of specific operators to their supported filter type configurations.
 * Each operator maps to its composed (core + extended) configurations.
 */
export type TOperatorSpecificConfigs = {
  [EQUALITY_OPERATOR.EXACT]: TExactOperatorConfigs;
  [COLLECTION_OPERATOR.IN]: TInOperatorConfigs;
  [COMPARISON_OPERATOR.RANGE]: TRangeOperatorConfigs;
} & TExtendedOperatorSpecificConfigs;

/**
 * Operator filter configuration mapping - for different operators.
 * Provides type-safe mapping of operators to their specific supported configurations.
 */
export type TOperatorConfigMap = Map<
  keyof TOperatorSpecificConfigs,
  TOperatorSpecificConfigs[keyof TOperatorSpecificConfigs]
>;

// -------- RE-EXPORTS --------

export * from "./core";
export * from "./extended";
