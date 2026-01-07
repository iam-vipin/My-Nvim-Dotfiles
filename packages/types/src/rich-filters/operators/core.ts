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

/**
 * Core logical operators
 */
export const CORE_LOGICAL_OPERATOR = {
  AND: "and",
} as const;

/**
 * Core equality operators
 */
export const CORE_EQUALITY_OPERATOR = {
  EXACT: "exact",
} as const;

/**
 * Core collection operators
 */
export const CORE_COLLECTION_OPERATOR = {
  IN: "in",
} as const;

/**
 * Core comparison operators
 */
export const CORE_COMPARISON_OPERATOR = {
  RANGE: "range",
} as const;

/**
 * Core operators that support multiple values
 */
export const CORE_MULTI_VALUE_OPERATORS = [CORE_COLLECTION_OPERATOR.IN, CORE_COMPARISON_OPERATOR.RANGE] as const;

/**
 * All core operators
 */
export const CORE_OPERATORS = {
  ...CORE_EQUALITY_OPERATOR,
  ...CORE_COLLECTION_OPERATOR,
  ...CORE_COMPARISON_OPERATOR,
} as const;

/**
 * All core operators that can be used in filter conditions
 */
export type TCoreSupportedOperators = (typeof CORE_OPERATORS)[keyof typeof CORE_OPERATORS];
