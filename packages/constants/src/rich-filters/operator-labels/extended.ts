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

import type { TExtendedSupportedOperators, TSupportedOperators, TSupportedDateFilterOperators } from "@plane/types";
import { EXTENDED_COMPARISON_OPERATOR, EXTENDED_EQUALITY_OPERATOR } from "@plane/types";

/**
 * Extended operator labels
 */
export const EXTENDED_OPERATOR_LABELS_MAP: Record<TExtendedSupportedOperators, string> = {
  [EXTENDED_EQUALITY_OPERATOR.ISNULL]: "is empty",
  [EXTENDED_EQUALITY_OPERATOR.CONTAINS]: "contains",
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN]: "less than",
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO]: "less than or equal",
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN]: "greater than",
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO]: "greater than or equal",
} as const;

/**
 * Extended date-specific operator labels
 */
export const EXTENDED_DATE_OPERATOR_LABELS_MAP: Record<TExtendedSupportedOperators, string> = {
  ...EXTENDED_OPERATOR_LABELS_MAP,
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN]: "before",
  [EXTENDED_COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO]: "before or on",
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN]: "after",
  [EXTENDED_COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO]: "after or on",
} as const;

/**
 * Negated operator labels for all operators
 */
export const NEGATED_OPERATOR_LABELS_MAP: Record<`-${TSupportedOperators}`, string> = {
  "-isnull": "is not empty",
  "-exact": "is not",
  "-in": "is not any of",
  "-range": "not between",
  "-icontains": "not contains",
  "-lt": "not less than",
  "-lte": "not less than or equal",
  "-gt": "not greater than",
  "-gte": "not greater than or equal",
} as const;

/**
 * Negated date operator labels for all date operators
 */
export const NEGATED_DATE_OPERATOR_LABELS_MAP: Record<`-${TSupportedDateFilterOperators}`, string> = {
  ...NEGATED_OPERATOR_LABELS_MAP,
  "-exact": "is not",
  "-range": "not between",
  "-lt": "not before",
  "-lte": "not before or on",
  "-gt": "not after",
  "-gte": "not after or on",
} as const;
